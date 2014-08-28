/*
 * Copyright 2013 Open Source Robotics Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

#include <algorithm>
#include <boost/thread.hpp>

#include "pb2json.hh"
#include "OgreMaterialParser.hh"
#include "GazeboPubSub.hh"

#include <gazebo/common/SystemPaths.hh>

#define MAX_NUM_MSG_SIZE 1000

using namespace gzscript;
using namespace gzweb;
using namespace std;


Subscriber::Subscriber(const char* _topic, bool _latch)
:topic(_topic)
{

}

Subscriber::~Subscriber()
{
}


Publisher::Publisher(const char *_type, const char *_topic)
  :type(_type), topic(_topic)
{
}

Publisher::~Publisher()
{
}


void Subscriber::Callback(const char* _msg)
{
  cout << this->topic << ": " << _msg  <<endl;
}


class MocType : public gazebo::msgs::WorldControl
{  
  public: std::string GetTypeName() const {return globalName;}
  public: static std::string globalName;

};

std::string MocType::globalName;

class GzPublisher: public Publisher
{
  private: gazebo::transport::PublisherPtr pub;

  public: GzPublisher(gazebo::transport::NodePtr &_node, const char* _type, const char* _topic)
            :Publisher(_type, _topic)
  {
    // this->pub = _node->Advertise< ::google::protobuf::Message >(this->topic);
    //  this->pub = _node->Advertise< string >(this->topic);
    MocType::globalName = _type;
    this->pub = _node->Advertise< MocType >(this->topic);
  }

  public: virtual void Publish(const char *topic, const char *msg)
  {
     ::google::protobuf::Message *pb = NULL;
     this->pub->Publish(*pb);
  }

};

class GzSubscriber: public Subscriber
{
  private: gazebo::transport::SubscriberPtr sub;

  public: GzSubscriber(gazebo::transport::NodePtr &_node, const char* _topic, bool _latch)
            :Subscriber(_topic, _latch)
  {
      string t(_topic);
      this->sub = _node->Subscribe(t,
         &GzSubscriber::PbCallback, this, _latch);
  }

  private: void PbCallback(const string &_msg)
  {
    string json = "{}";
    this->Callback(json.c_str());
  }

  public: virtual ~GzSubscriber()
  {
    // clean up sub
    
  }

};



void GazeboPubSub::Pause()
{
  gazebo::msgs::WorldControl worldControlMsg;
  worldControlMsg.set_pause(1);
  this->worldControlPub->Publish(worldControlMsg);  
}

void GazeboPubSub::Play()
{
  gazebo::msgs::WorldControl worldControlMsg;
  worldControlMsg.set_pause(0);
  this->worldControlPub->Publish(worldControlMsg);  
}


// subscriber factory
void GazeboPubSub::Subscribe(const char *_topic, bool latch)
{
  Subscriber *sub = new GzSubscriber(this->node, _topic, latch);
  this->subs.push_back(sub);
}



void GazeboPubSub::Unsubscribe(const char *_topic)
{
  for (vector<Subscriber*>::iterator it = this->subs.begin();  it != this->subs.end(); it++)
  {
    Subscriber* p = *it;
    if ( p->topic == _topic)
    {
      delete p;
      this->subs.erase(it);
      return;
    }
  }
  // not found!
}

std::vector<std::string> GazeboPubSub::Subscriptions()
{
  vector<std::string> v;
  for(unsigned int i=0; i < this->subs.size(); ++i)
  {
    v.push_back(this->subs[i]->topic);
  }
  return v;
}

vector<string> GazeboPubSub::GetMaterials()
{

  vector<string> v;

  std::list<std::string> paths = gazebo::common::SystemPaths::Instance()->GetModelPaths();
  for(std::list<std::string>::iterator it= paths.begin(); it != paths.end(); it++)
  {
    string path = *it;
    this->materialParser->Load(path);
    string mats =  this->materialParser->GetMaterialAsJson();
    v.push_back(mats);
  }
  return v;
}


void GazeboPubSub::Publish(const char*_type, const char *_topic, const char *_msg)
{
  Publisher *pub;
  string t(_topic);
  std::map< string, Publisher*  >::iterator it = this->pubs.find(t);
  if(it != this->pubs.end())
  {
    pub = it->second; 
  }
  else
  {
    pub = new GzPublisher(this->node, _type, _topic);
    this->pubs[t] = pub;
  }
  pub->Publish(_msg);
}



std::vector<std::string> GazeboPubSub::incoming;
std::vector<std::string> GazeboPubSub::outgoing;

boost::recursive_mutex inMutex;
boost::recursive_mutex outMutex;


/////////////////////////////////////////////////
GazeboPubSub::GazeboPubSub()
{

  gazebo::transport::init();
  gazebo::transport::run();

  this->worldControlTopic = "~/world_control";
  // For controling world
  this->worldControlPub =
      this->node->Advertise<gazebo::msgs::WorldControl>(
      this->worldControlTopic);


//  this->socketServer = _server;
  this->receiveMutex = new boost::recursive_mutex();
  this->serviceMutex = new boost::recursive_mutex();
  this->stop = false;

  // Create our node for communication
  this->node.reset(new gazebo::transport::Node());
  this->node->Init();

  // Gazebo topics
  this->statsTopic = "~/world_stats";

  this->statsSub = this->node->Subscribe(this->statsTopic,
      &GazeboPubSub::OnStats, this);



  this->sensorTopic = "~/sensor";
  this->visualTopic = "~/visual";
  this->jointTopic = "~/joint";
  this->modelTopic = "~/model/info";
  this->poseTopic = "~/pose/info";
  this->requestTopic = "~/request";
  this->lightTopic = "~/light";
  this->sceneTopic = "~/scene";
  this->modelModifyTopic = "~/model/modify";
  this->factoryTopic = "~/factory";
  this->roadTopic = "~/roads";
  this->heightmapService = "~/heightmap_data";
  this->deleteTopic = "~/entity_delete";


  // material topic
  this->materialTopic = "~/material";


  this->sensorSub = this->node->Subscribe(this->sensorTopic,
      &GazeboPubSub::OnSensorMsg, this, true);

  this->visSub = this->node->Subscribe(this->visualTopic,
      &GazeboPubSub::OnVisualMsg, this);

  this->jointSub = this->node->Subscribe(this->jointTopic,
      &GazeboPubSub::OnJointMsg, this);

  // For entity creation
  this->modelInfoSub = node->Subscribe(this->modelTopic,
      &GazeboPubSub::OnModelMsg, this);

  // For entity update
  this->poseSub = this->node->Subscribe(this->poseTopic,
      &GazeboPubSub::OnPoseMsg, this);

  // For entity delete coming from the server side
  this->requestSub = this->node->Subscribe(this->requestTopic,
      &GazeboPubSub::OnRequest, this);



  // For lights
  this->lightSub = this->node->Subscribe(this->lightTopic,
      &GazeboPubSub::OnLightMsg, this);

  this->sceneSub = this->node->Subscribe(this->sceneTopic,
      &GazeboPubSub::OnScene, this);
  this->roadSub = this->node->Subscribe(this->roadTopic,
      &GazeboPubSub::OnRoad, this, true);

  // For getting scene info on connect
  this->requestPub =
      this->node->Advertise<gazebo::msgs::Request>(this->requestTopic);

  // For modifying models
  this->modelPub =
      this->node->Advertise<gazebo::msgs::Model>(this->modelModifyTopic);

  // For modifying lights
  this->lightPub =
      this->node->Advertise<gazebo::msgs::Light>(this->lightTopic);

  // For spawning models
  this->factoryPub =
      this->node->Advertise<gazebo::msgs::Factory>(this->factoryTopic);
  this->responseSub = this->node->Subscribe("~/response",
      &GazeboPubSub::OnResponse, this);



  this->lastStatsTime = gazebo::common::Time::Zero;
  this->lastPausedState = true;

  // message filtering apparatus
  this->minimumDistanceSquared = 0.0001;
  this->minimumQuaternionSquared = 0.0001;
  this->minimumMsgAge = 0.03;
  this->skippedMsgCount = 0;
  this->messageWindowSize = 10000;
  this->messageCount = 0;

  this->isConnected = false;

  // initialize thread variables
  this->runThread = NULL;
  this->serviceThread = NULL;
  this->connectionCondition = new boost::condition_variable();
  this->connectionMutex = new boost::mutex();

/*
  // this->Init();
  this->requestPub->WaitForConnection();

  // this->RunThread();
  this->runThread = new boost::thread(boost::bind(&GazeboPubSub::Run, this));
  this->serviceThread = new boost::thread(
      boost::bind(&GazeboPubSub::RunService, this));

  this->SetConnected(true);
*/
  this->materialParser = new gzweb::OgreMaterialParser();


}

/////////////////////////////////////////////////
GazeboPubSub::~GazeboPubSub()
{

  cout << "GazeboPubSub::~GazeboPubSub()" << endl;

  // this->Fini();
  this->stop = true;

  this->node->Fini();

  this->modelMsgs.clear();
  this->poseMsgs.clear();
  this->requestMsgs.clear();
  this->lightMsgs.clear();
  this->visualMsgs.clear();
  this->sceneMsgs.clear();
  this->jointMsgs.clear();
  this->sensorMsgs.clear();

  this->sensorSub.reset();
  this->visSub.reset();
  this->lightSub.reset();
  this->sceneSub.reset();
  this->jointSub.reset();
  this->modelInfoSub.reset();
  this->requestPub.reset();
  this->modelPub.reset();
  this->lightPub.reset();
  this->responseSub.reset();
  this->node.reset();

  if (this->runThread)
  {
    this->runThread->join();
    delete this->runThread;
  }
  if (this->serviceThread)
  {
    this->serviceThread->join();
    delete this->serviceThread;
  }

  delete this->receiveMutex;
  delete this->serviceMutex;
  delete this->connectionCondition;
  delete this->connectionMutex;

  delete this->materialParser;
}



/////////////////////////////////////////////////
void GazeboPubSub::Run()
{
  while (!this->stop)
  {
    this->WaitForConnection();
    this->ProcessMessages();
  }
}

//////////////////////////////////////////////////
void GazeboPubSub::RunService()
{
  while (!this->stop)
  {
    this->WaitForConnection();
    this->ProcessServiceRequests();
  }
}


/////////////////////////////////////////////////
void GazeboPubSub::ProcessMessages()
{
  static RequestMsgs_L::iterator rIter;
  static SceneMsgs_L::iterator sIter;
  static WorldStatsMsgs_L::iterator wIter;
  static ModelMsgs_L::iterator modelIter;
  static VisualMsgs_L::iterator visualIter;
  static LightMsgs_L::iterator lightIter;
  static PoseMsgs_L::iterator pIter;
  // static SkeletonPoseMsgs_L::iterator spIter;
  static JointMsgs_L::iterator jointIter;
  static SensorMsgs_L::iterator sensorIter;

  {
    boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);

    // Process incoming messages.
    std::vector<std::string> msgs = this->PopIncomingMessages();

    for (unsigned int i = 0; i < msgs.size(); ++i)
    {
      std::string msg = msgs[i];

      std::string operation = get_value(msg, "op");
      // ignore "advertise" messages (responsible for announcing the
      // availability of topics) as we currently don't make use of them.
      if (operation == "advertise")
        continue;

      std::string topic = get_value(msg.c_str(), "topic");

      // Process subscribe requests
      if (!topic.empty())
      {
        if (topic == this->sceneTopic)
        {
          gazebo::msgs::Request *requestMsg;
          requestMsg = gazebo::msgs::CreateRequest("scene_info");
          if (this->requests.find(requestMsg->id()) != this->requests.end())
            requests.erase(requestMsg->id());
          this->requests[requestMsg->id()] = requestMsg;
          this->requestPub->Publish(*requestMsg);
        }
        else if (topic == this->poseTopic)
        {
          // TODO we currently subscribe on init,
          // should change logic so that  we subscribe only
          // when we receive sub msgs
        }
        else if (topic == this->modelModifyTopic)
        {
          std::string type = get_value(msg, "messageType");
          std::string name = get_value(msg, "msg:name");
          int id = atoi(get_value(msg, "msg:id").c_str());

          if (name == "")
            continue;

          gazebo::math::Vector3 pos(
            atof(get_value(msg, "msg:position:x").c_str()),
            atof(get_value(msg, "msg:position:y").c_str()),
            atof(get_value(msg, "msg:position:z").c_str()));
          gazebo::math::Quaternion quat(
            atof(get_value(msg, "msg:orientation:w").c_str()),
            atof(get_value(msg, "msg:orientation:x").c_str()),
            atof(get_value(msg, "msg:orientation:y").c_str()),
            atof(get_value(msg, "msg:orientation:z").c_str()));
          gazebo::math::Pose pose(pos, quat);

          gazebo::msgs::Model modelMsg;
          modelMsg.set_id(id);
          modelMsg.set_name(name);
          gazebo::msgs::Set(modelMsg.mutable_pose(), pose);

          this->modelPub->Publish(modelMsg);
        }
        else if (topic == this->lightTopic)
        {
          std::string name = get_value(msg, "msg:name");
          std::string type = get_value(msg, "msg:type");
          // createEntity = 1: create new light
          // createEntity = 0: modify existing light
          std::string createEntity = get_value(msg, "msg:createEntity");

          if (name == "")
            continue;

          gazebo::math::Vector3 pos(
            atof(get_value(msg, "msg:position:x").c_str()),
            atof(get_value(msg, "msg:position:y").c_str()),
            atof(get_value(msg, "msg:position:z").c_str()));
          gazebo::math::Quaternion quat(
            atof(get_value(msg, "msg:orientation:w").c_str()),
            atof(get_value(msg, "msg:orientation:x").c_str()),
            atof(get_value(msg, "msg:orientation:y").c_str()),
            atof(get_value(msg, "msg:orientation:z").c_str()));
          gazebo::math::Pose pose(pos, quat);

          gazebo::msgs::Light lightMsg;
          lightMsg.set_name(name);
          gazebo::msgs::Set(lightMsg.mutable_pose(), pose);

          if (createEntity.compare("1") == 0)
          {
            if (type.compare("pointlight") == 0)
            {
              lightMsg.set_type(gazebo::msgs::Light::POINT);
            }
            else if (type.compare("spotlight") == 0)
            {
              lightMsg.set_type(gazebo::msgs::Light::SPOT);
              gazebo::msgs::Set(lightMsg.mutable_direction(),
                  gazebo::math::Vector3(0,0,-1));
            }
            else if (type.compare("directionallight") == 0)
            {
              lightMsg.set_type(gazebo::msgs::Light::DIRECTIONAL);
              gazebo::msgs::Set(lightMsg.mutable_direction(),
                  gazebo::math::Vector3(0,0,-1));
            }

            gazebo::msgs::Set(lightMsg.mutable_diffuse(),
                gazebo::common::Color(0.5, 0.5, 0.5, 1));
            gazebo::msgs::Set(lightMsg.mutable_specular(),
                gazebo::common::Color(0.1, 0.1, 0.1, 1));
            lightMsg.set_attenuation_constant(0.5);
            lightMsg.set_attenuation_linear(0.01);
            lightMsg.set_attenuation_quadratic(0.001);
            lightMsg.set_range(20);
          }

          this->lightPub->Publish(lightMsg);
        }
        else if (topic == this->factoryTopic)
        {
          gazebo::msgs::Factory factoryMsg;
          std::stringstream newModelStr;

          std::string name = get_value(msg, "msg:name");
          std::string type = get_value(msg, "msg:type");

          gazebo::math::Vector3 pos(
              atof(get_value(msg, "msg:position:x").c_str()),
              atof(get_value(msg, "msg:position:y").c_str()),
              atof(get_value(msg, "msg:position:z").c_str()));
          gazebo::math::Quaternion quat(
              atof(get_value(msg, "msg:orientation:w").c_str()),
              atof(get_value(msg, "msg:orientation:x").c_str()),
              atof(get_value(msg, "msg:orientation:y").c_str()),
              atof(get_value(msg, "msg:orientation:z").c_str()));
          gazebo::math::Vector3 rpy = quat.GetAsEuler();

          if(type == "box" || type == "sphere" || type == "cylinder")
          {
            std::stringstream geom;
            if (type == "box")
            {
              geom  << "<box>"
                    <<   "<size>1.0 1.0 1.0</size>"
                    << "</box>";
            }
            else if (type == "sphere")
            {
              geom  << "<sphere>"
                    <<   "<radius>0.5</radius>"
                    << "</sphere>";
            }
            else if (type == "cylinder")
            {
              geom  << "<cylinder>"
                    <<   "<radius>0.5</radius>"
                    <<   "<length>1.0</length>"
                    << "</cylinder>";
            }

            newModelStr << "<sdf version ='" << SDF_VERSION << "'>"
                << "<model name='" << name << "'>"
                << "<pose>" << pos.x << " " << pos.y << " " << pos.z << " "
                            << rpy.x << " " << rpy.y << " " << rpy.z << "</pose>"
                << "<link name ='link'>"
                <<   "<inertial><mass>1.0</mass></inertial>"
                <<   "<collision name ='collision'>"
                <<     "<geometry>"
                <<        geom.str()
                <<     "</geometry>"
                << "</collision>"
                << "<visual name ='visual'>"
                <<     "<geometry>"
                <<        geom.str()
                <<     "</geometry>"
                <<     "<material>"
                <<       "<script>"
                <<         "<uri>file://media/materials/scripts/gazebo.material"
                <<         "</uri>"
                <<         "<name>Gazebo/Grey</name>"
                <<       "</script>"
                <<     "</material>"
                <<   "</visual>"
                << "</link>"
                << "</model>"
                << "</sdf>";
          }
          else
          {
            newModelStr << "<sdf version ='" << SDF_VERSION << "'>"
                  << "<model name='" << name << "'>"
                  << "  <pose>" << pos.x << " " << pos.y << " "
                                << pos.z << " " << rpy.x << " "
                                << rpy.y << " " << rpy.z << "</pose>"
                  << "  <include>"
                  << "    <uri>model://" << type << "</uri>"
                  << "  </include>"
                  << "</model>"
                  << "</sdf>";
          }

          // Spawn the model in the physics server
          factoryMsg.set_sdf(newModelStr.str());
          this->factoryPub->Publish(factoryMsg);
        }
        else if (topic == this->worldControlTopic)
        {
          gazebo::msgs::WorldControl worldControlMsg;
          std::string pause = get_value(msg, "msg:pause");
          std::string reset = get_value(msg, "msg:reset");
          if (!pause.empty())
          {
            int pauseValue = atoi(pause.c_str());
            worldControlMsg.set_pause(pauseValue);
          }
          if (!reset.empty())
          {
            if (reset == "model")
            {
              worldControlMsg.mutable_reset()->set_all(false);
              worldControlMsg.mutable_reset()->set_time_only(false);
              worldControlMsg.mutable_reset()->set_model_only(true);
            }
            else if (reset == "world")
            {
              worldControlMsg.mutable_reset()->set_all(true);

            }
          }
          if (!pause.empty() || !reset.empty())
            this->worldControlPub->Publish(worldControlMsg);
        }

//        else if (topic == this->materialTopic)
//        {
//
//          if (this->materialParser)
//          {
//            std::string msg =
//                this->PackOutgoingTopicMsg(this->materialTopic,
//                this->materialParser->GetMaterialAsJson());
//            this->Send(msg);
//          }
//        }

        else if (topic == this->deleteTopic)
        {
            std::string name = get_value(msg, "msg:name");
            gazebo::transport::requestNoReply(this->node, "entity_delete", name);
        }
      }
      else
      {
        // store service calls for processing later
        std::string service = get_value(msg.c_str(), "service");
        if (!service.empty())
        {
          boost::recursive_mutex::scoped_lock lock(*this->serviceMutex);
          this->serviceRequests.push_back(msg);
        }
      }

    }

    std::string msg = "";
    // Forward the scene messages.
    for (sIter = this->sceneMsgs.begin(); sIter != this->sceneMsgs.end();
        ++sIter)
    {
      msg = this->PackOutgoingTopicMsg(this->sceneTopic,
          pb2json(*(*sIter).get()));
      this->Send(msg);
    }
    this->sceneMsgs.clear();

    // Forward the model messages.
    for (modelIter = this->modelMsgs.begin();
        modelIter != this->modelMsgs.end(); ++modelIter)
    {
      msg = this->PackOutgoingTopicMsg(this->modelTopic,
          pb2json(*(*modelIter).get()));
      this->Send(msg);
    }
    this->modelMsgs.clear();

    // Forward the sensor messages.
    for (sensorIter = this->sensorMsgs.begin();
        sensorIter != this->sensorMsgs.end(); ++sensorIter)
    {
      msg = this->PackOutgoingTopicMsg(this->sensorTopic,
          pb2json(*(*sensorIter).get()));
      this->Send(msg);
    }
    this->sensorMsgs.clear();

    // Forward the light messages.
    for (lightIter = this->lightMsgs.begin();
        lightIter != this->lightMsgs.end(); ++lightIter)
    {
      msg = this->PackOutgoingTopicMsg(this->lightTopic,
          pb2json(*(*lightIter).get()));
      this->Send(msg);
    }
    this->lightMsgs.clear();

    // Forward the visual messages.
    for (visualIter = this->visualMsgs.begin();
        visualIter != this->visualMsgs.end(); ++visualIter)
    {
      msg = this->PackOutgoingTopicMsg(this->visualTopic,
          pb2json(*(*visualIter).get()));
      this->Send(msg);
      std::cerr << msg << std::endl;
    }
    this->visualMsgs.clear();

    // Forward the joint messages.
    for (jointIter = this->jointMsgs.begin();
        jointIter != this->jointMsgs.end(); ++jointIter)
    {
      msg = this->PackOutgoingTopicMsg(this->jointTopic,
          pb2json(*(*jointIter).get()));
      this->Send(msg);
    }
    this->jointMsgs.clear();

    // Forward the request messages
    for (rIter =  this->requestMsgs.begin(); rIter != this->requestMsgs.end();
        ++rIter)
    {
      msg = this->PackOutgoingTopicMsg(this->requestTopic,
          pb2json(*(*rIter).get()));
      this->Send(msg);
    }
    this->requestMsgs.clear();

    // Forward the stats messages.
    for (wIter = this->statsMsgs.begin(); wIter != this->statsMsgs.end();
        ++wIter)
    {
      msg = this->PackOutgoingTopicMsg(this->statsTopic,
          pb2json(*(*wIter).get()));
      this->Send(msg);
    }
    this->statsMsgs.clear();

    // Forward all the pose messages.
    pIter = this->poseMsgs.begin();
    while (pIter != this->poseMsgs.end())
    {
      msg = this->PackOutgoingTopicMsg(this->poseTopic,
          pb2json(*pIter));
      this->Send(msg);
      ++pIter;
    }
    this->poseMsgs.clear();
  }
}

/////////////////////////////////////////////////
void GazeboPubSub::ProcessServiceRequests()
{
  std::vector<std::string> services;
  {
    boost::recursive_mutex::scoped_lock lock(*this->serviceMutex);
    services = this->serviceRequests;
    this->serviceRequests.clear();
  }

  // process service request outside lock otherwise somehow it deadlocks
  for (unsigned int i = 0; i < services.size(); ++i)
  {
    std::string request = services[i];
    std::string service = get_value(request.c_str(), "service");
    std::string id = get_value(request.c_str(), "id");
    std::string name = get_value(request.c_str(), "args");
    if (service == this->heightmapService)
    {
      boost::shared_ptr<gazebo::msgs::Response> response
          = gazebo::transport::request(name, "heightmap_data");
      gazebo::msgs::Geometry geomMsg;
      if (response->response() != "error" &&
          response->type() == geomMsg.GetTypeName())
      {
        geomMsg.ParseFromString(response->serialized_data());

        std::string msg = this->PackOutgoingServiceMsg(id,
            pb2json(geomMsg));
        this->Send(msg);
      }
    }
    else if (service == this->roadTopic)
    {
      if (!this->roadMsgs.empty())
      {
        std::string msg = this->PackOutgoingServiceMsg(id,
            pb2json(*roadMsgs.front().get()));
        this->Send(msg);
      }
    }
  }
}

/////////////////////////////////////////////////
void GazeboPubSub::OnModelMsg(ConstModelPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->modelMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
bool GazeboPubSub::FilterPoses(const TimedPose &_old,
    const TimedPose &_current)
{
  if (this->messageCount >= this->messageWindowSize)
  {
    // double ratio =  100.0 * this->skippedMsgCount  / this->messageWindowSize;
    // std::cout << "Message filter: " << ratio << " %" << std::endl;
    // std::cout << "Message count : " << this->skippedMsgCount;
    // std::cout << " "  << << std::endl;
    this->skippedMsgCount = 0;
    this->messageCount = 0;
  }
  this->messageCount++;

  bool hasMoved = false;
  bool isTooEarly = false;
  bool hasRotated = false;

  gazebo::common::Time mininumTimeElapsed(this->minimumMsgAge);

  gazebo::common::Time timeDifference =  _current.first - _old.first;

  // checking > 0 because world may have been reset
  if (timeDifference < mininumTimeElapsed && timeDifference.Double() > 0)
  {
    isTooEarly = true;
  }

  gazebo::math::Vector3 posDiff = _current.second.pos - _old.second.pos;
  double translationSquared = posDiff.GetSquaredLength();
  if (translationSquared > minimumDistanceSquared)
  {
    hasMoved = true;
  }

  gazebo::math::Quaternion i = _current.second.rot.GetInverse();
  gazebo::math::Quaternion qDiff =  i * _old.second.rot;

  gazebo::math::Vector3 d(qDiff.x, qDiff.y, qDiff.z);
  double rotation = d.GetSquaredLength();
  if (rotation > minimumQuaternionSquared)
  {
    hasRotated = true;
  }

  if (isTooEarly)
  {
    this->skippedMsgCount++;
    return true;
  }

  if ((hasMoved == false) && (hasRotated == false))
  {
    this->skippedMsgCount++;
    return true;
  }

    return false;
}

/////////////////////////////////////////////////
void GazeboPubSub::OnPoseMsg(ConstPosesStampedPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  PoseMsgs_L::iterator iter;

  for (int i = 0; i < _msg->pose_size(); ++i)
  {
    // Find an old model message, and remove them
    for (iter = this->poseMsgs.begin(); iter != this->poseMsgs.end(); ++iter)
    {
      if ((*iter).name() == _msg->pose(i).name())
      {
        this->poseMsgs.erase(iter);
        break;
      }
    }
    bool filtered = false;

    std::string name = _msg->pose(i).name();

    gazebo::math::Pose pose = gazebo::msgs::Convert(_msg->pose(i));
    gazebo::common::Time time = gazebo::msgs::Convert(_msg->time());

    PoseMsgsFilter_M::iterator it = this->poseMsgsFilterMap.find(name);

    TimedPose currentPose;
    currentPose.first = time;
    currentPose.second = pose;

    if (it == this->poseMsgsFilterMap.end())
    {
      std::pair<PoseMsgsFilter_M::iterator, bool> r;
      r = this->poseMsgsFilterMap.insert(make_pair(name, currentPose));
    }
    else
    {
      TimedPose oldPose = it->second;
      filtered = FilterPoses(oldPose, currentPose);
      if (!filtered)
      {
        // update the map
        it->second.first = currentPose.first;
        it->second.second = currentPose.second;
        this->poseMsgs.push_back(_msg->pose(i));
      }
    }
  }
  std::cout.flush();
}

/////////////////////////////////////////////////
void GazeboPubSub::OnRequest(ConstRequestPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->requestMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboPubSub::OnResponse(ConstResponsePtr &_msg)
{
  if (!this->IsConnected())
    return;

  if (this->requests.find(_msg->id()) == this->requests.end())
    return;

  gazebo::msgs::Scene sceneMsg;
  sceneMsg.ParseFromString(_msg->serialized_data());
  boost::shared_ptr<gazebo::msgs::Scene> sm(new gazebo::msgs::Scene(sceneMsg));
  this->sceneMsgs.push_back(sm);
  this->requests.erase(_msg->id());
}

/////////////////////////////////////////////////
void GazeboPubSub::OnLightMsg(ConstLightPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->lightMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboPubSub::OnScene(ConstScenePtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->sceneMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboPubSub::OnStats(ConstWorldStatisticsPtr &_msg)
{
  if (!this->IsConnected())
    return;

  gazebo::common::Time wallTime;
  wallTime = gazebo::msgs::Convert(_msg->real_time());
  bool paused = _msg->paused();

  // pub at 1Hz, but force pub if world state changes
  if (((wallTime - this->lastStatsTime).Double() >= 1.0) ||
      wallTime < this->lastStatsTime ||
      this->lastPausedState != paused)
  {
    this->lastStatsTime = wallTime;
    this->lastPausedState = paused;
    boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
    this->statsMsgs.push_back(_msg);
  }
}

/////////////////////////////////////////////////
void GazeboPubSub::OnRoad(ConstRoadPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->roadMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboPubSub::OnJointMsg(ConstJointPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->jointMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboPubSub::OnSensorMsg(ConstSensorPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->sensorMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboPubSub::OnVisualMsg(ConstVisualPtr &_msg)
{
  if (!this->IsConnected())
    return;

  boost::recursive_mutex::scoped_lock lock(*this->receiveMutex);
  this->visualMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
std::string GazeboPubSub::PackOutgoingTopicMsg(const std::string &_topic,
    const std::string &_msg)
{
  // Use roslibjs format for now.
  std::string out;
  out += "{\"op\":\"publish\",\"topic\":\"" + _topic + "\", \"msg\":";
  out += _msg;
  out += "}";
  return out;
}

/////////////////////////////////////////////////
std::string GazeboPubSub::PackOutgoingServiceMsg(const std::string &_id,
    const std::string &_msg)
{
  // Use roslibjs format for now.
  std::string out;
  out += "{\"op\":\"service_response\",\"id\":\"" + _id + "\", \"values\":";
  out += _msg;
  out += "}";
  return out;
}

/////////////////////////////////////////////////
void GazeboPubSub::Send(const std::string &_msg)
{
//  if (this->socketServer)
//    this->socketServer->Write(_msg);
  boost::recursive_mutex::scoped_lock lock(outMutex);
  if (outgoing.size() < MAX_NUM_MSG_SIZE)
    outgoing.push_back(_msg);
}

/*
/////////////////////////////////////////////////
void GazeboPubSub::Write(const std::string &_msg)
{
  boost::recursive_mutex::scoped_lock lock(outMutex);
  if (outgoing.size() < MAX_NUM_MSG_SIZE)
    outgoing.push_back(_msg);
}*/

/////////////////////////////////////////////////
std::vector<std::string> GazeboPubSub::PopIncomingMessages()
{
  boost::recursive_mutex::scoped_lock lock(inMutex);
  std::vector<std::string> in = incoming;
  incoming.clear();
  return in;
}

/////////////////////////////////////////////////
std::vector<std::string> GazeboPubSub::PopOutgoingMessages()
{
  boost::recursive_mutex::scoped_lock lock(outMutex);
  std::vector<std::string> out = outgoing;
  outgoing.clear();
  return out;
}


/////////////////////////////////////////////////
void GazeboPubSub::PushRequest(const std::string &_msg)
{
  boost::recursive_mutex::scoped_lock lock(inMutex);
  if (incoming.size() < MAX_NUM_MSG_SIZE)
    incoming.push_back(_msg);
}


/////////////////////////////////////////////////
void GazeboPubSub::WaitForConnection() const
{
  boost::mutex::scoped_lock lock(*this->connectionMutex);
  while (!this->isConnected)
  {
    this->connectionCondition->wait(lock);
  }
}

/////////////////////////////////////////////////
void GazeboPubSub::SetConnected(bool _connected)
{
  boost::mutex::scoped_lock lock(*this->connectionMutex);
  this->isConnected = _connected;
  this->connectionCondition->notify_all();
}

/////////////////////////////////////////////////
bool GazeboPubSub::IsConnected() const
{
  boost::mutex::scoped_lock lock(*this->connectionMutex);
  return this->isConnected;
}
