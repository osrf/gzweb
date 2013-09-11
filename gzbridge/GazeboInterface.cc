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

#include <boost/thread.hpp>

#include "pb2json.hh"
//#include "WebSocketServer.hh"
#include "OgreMaterialParser.hh"
#include "GazeboInterface.hh"

#define MAX_NUM_MSG_SIZE 1000

using namespace gzweb;

std::vector<std::string> GazeboInterface::incoming;
std::vector<std::string> GazeboInterface::outgoing;

boost::recursive_mutex incomingMutex;
boost::recursive_mutex outgoingMutex;

/////////////////////////////////////////////////
GazeboInterface::GazeboInterface()
{
//  this->socketServer = _server;
  this->receiveMutex = new boost::mutex();
  this->stop = false;

  // Create our node for communication
  this->node.reset(new gazebo::transport::Node());
  this->node->Init();

  // Gazebo topics
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

  // material topic
  this->materialTopic = "~/material";

  this->sensorSub = this->node->Subscribe(this->sensorTopic,
      &GazeboInterface::OnSensorMsg, this, true);

  this->visSub = this->node->Subscribe(this->visualTopic,
      &GazeboInterface::OnVisualMsg, this);

  // this->lightPub = this->node->Advertise<gazebo::msgs::Light>("~/light");

  this->jointSub = this->node->Subscribe(this->jointTopic,
      &GazeboInterface::OnJointMsg, this);

  // For entity creation
  this->modelInfoSub = node->Subscribe(this->modelTopic,
      &GazeboInterface::OnModelMsg, this);

  // For entity update
  this->poseSub = this->node->Subscribe(this->poseTopic,
      &GazeboInterface::OnPoseMsg, this);

  // For entity delete
  this->requestSub = this->node->Subscribe(this->requestTopic,
      &GazeboInterface::OnRequest, this);

  // For lights
  this->lightSub = this->node->Subscribe(this->lightTopic,
      &GazeboInterface::OnLightMsg, this);

  this->sceneSub = this->node->Subscribe(this->sceneTopic,
      &GazeboInterface::OnScene, this);

  // For getting scene info on connect
  this->requestPub =
      this->node->Advertise<gazebo::msgs::Request>(this->requestTopic);

  // For modifying models
  this->modelPub =
      this->node->Advertise<gazebo::msgs::Model>(this->modelModifyTopic);

  // For modifying lights
  this->lightPub = this->node->Advertise<gazebo::msgs::Light>(this->lightTopic);

  // For spawning models
  this->factoryPub =
      this->node->Advertise<gazebo::msgs::Factory>(this->factoryTopic);

  this->responseSub = this->node->Subscribe("~/response",
      &GazeboInterface::OnResponse, this);

  this->materialParser = new OgreMaterialParser();

  // message filtering apparatus
  this->minimumDistanceSquared = 0.0001;
  this->minimumQuaternionSquared = 0.0001;
  this->minimumMsgAge = 0.03;
  this->skippedMsgCount = 0;
  this->messageWindowSize = 10000;
  this->messageCount = 0;

}

/////////////////////////////////////////////////
GazeboInterface::~GazeboInterface()
{
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

  delete this->receiveMutex;
}

/////////////////////////////////////////////////
void GazeboInterface::Init()
{
  this->requestPub->WaitForConnection();
}

/////////////////////////////////////////////////
void GazeboInterface::RunThread()
{
  this->runThread = new boost::thread(boost::bind(&GazeboInterface::Run, this));
}

/////////////////////////////////////////////////
void GazeboInterface::Run()
{
  while (!this->stop)
  {
    this->ProcessMessages();
  }
}

/////////////////////////////////////////////////
void GazeboInterface::Fini()
{
  this->stop = true;
}

/////////////////////////////////////////////////
void GazeboInterface::ProcessMessages()
{
  static RequestMsgs_L::iterator rIter;
  static SceneMsgs_L::iterator sIter;
  static ModelMsgs_L::iterator modelIter;
  static VisualMsgs_L::iterator visualIter;
  static LightMsgs_L::iterator lightIter;
  static PoseMsgs_L::iterator pIter;
  // static SkeletonPoseMsgs_L::iterator spIter;
  static JointMsgs_L::iterator jointIter;
  static SensorMsgs_L::iterator sensorIter;

  {
    boost::mutex::scoped_lock lock(*this->receiveMutex);

    // Process incoming messages.
    std::vector<std::string> msgs = this->PopIncomingMessages();

    for (unsigned int i = 0; i < msgs.size(); ++i)
    {
      std::string msg = msgs[i];
      std::string topic = get_value(msg.c_str(), "topic");
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

          /* else if (type == "light")
          {
            gazebo::msgs::Light msg;
            msg.set_name(name);
            gazebo::msgs::Set(msg.mutable_pose(), pose);
            this->lightPub->Publish(msg);
          }*/
        }
        else if (topic == this->factoryTopic)
        {
          gazebo::msgs::Factory factoryMsg;
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
          /*gazebo::math::Pose pose(pos, quat);

          gazebo::sdf::SDFPtr modelSDF;
          modelSDF.reset(new gazebo::sdf::SDF);
          gazebo::sdf::initFile("root.sdf", this->modelSDF);*/

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

          std::stringstream newModelStr;
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

            // Spawn the model in the physics server
            factoryMsg.set_sdf(newModelStr.str());
            this->factoryPub->Publish(factoryMsg);
        }
        else if (topic == this->materialTopic)
        {

          if (this->materialParser)
          {
            std::string msg =
                this->PackOutgoingMsg(this->materialTopic,
                this->materialParser->GetMaterialAsJson());
            this->Send(msg);
          }
        }
      }
    }

    std::string msg = "";
    // Forward the scene messages.
    for (sIter = this->sceneMsgs.begin(); sIter != this->sceneMsgs.end();
        ++sIter)
    {
      msg = this->PackOutgoingMsg(this->sceneTopic, pb2json(*(*sIter).get()));
      this->Send(msg);
    }
    this->sceneMsgs.clear();

    // Forward the model messages.
    for (modelIter = this->modelMsgs.begin(); modelIter != this->modelMsgs.end();
        ++modelIter)
    {
      msg = this->PackOutgoingMsg(this->modelTopic,
          pb2json(*(*modelIter).get()));
      this->Send(msg);
    }
    this->modelMsgs.clear();

    // Forward the sensor messages.
    for (sensorIter = this->sensorMsgs.begin();
        sensorIter != this->sensorMsgs.end(); ++sensorIter)
    {
      msg = this->PackOutgoingMsg(this->sensorTopic,
          pb2json(*(*sensorIter).get()));
      this->Send(msg);
    }
    this->sensorMsgs.clear();

    // Forward the light messages.
    for (lightIter = this->lightMsgs.begin();
        lightIter != this->lightMsgs.end(); ++lightIter)
    {
      msg = this->PackOutgoingMsg(this->lightTopic,
          pb2json(*(*lightIter).get()));
      this->Send(msg);
    }
    this->lightMsgs.clear();

    // Forward the visual messages.
    for (visualIter = this->visualMsgs.begin();
        visualIter != this->visualMsgs.end(); ++visualIter)
    {
      msg = this->PackOutgoingMsg(this->visualTopic,
          pb2json(*(*visualIter).get()));
      this->Send(msg);
    }
    this->visualMsgs.clear();

    // Forward the joint messages.
    for (jointIter = this->jointMsgs.begin();
        jointIter != this->jointMsgs.end(); ++jointIter)
    {
      msg = this->PackOutgoingMsg(this->jointTopic,
          pb2json(*(*jointIter).get()));
      this->Send(msg);
    }
    this->jointMsgs.clear();

    // Forward the request messages
    for (rIter =  this->requestMsgs.begin(); rIter != this->requestMsgs.end();
        ++rIter)
    {
      msg = this->PackOutgoingMsg(this->requestTopic,
          pb2json(*(*rIter).get()));
      this->Send(msg);
    }
    this->requestMsgs.clear();

    // Forward all the pose messages.
    pIter = this->poseMsgs.begin();
    while (pIter != this->poseMsgs.end())
    {
	  msg = this->PackOutgoingMsg(this->poseTopic,
			  pb2json(*pIter));
	  this->Send(msg);
	  ++pIter;
    }
    this->poseMsgs.clear();
  }
}

/////////////////////////////////////////////////
void GazeboInterface::OnModelMsg(ConstModelPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->modelMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
bool GazeboInterface::FilterPoses(const TimedPose &_old,
    const TimedPose &_current)
{
	if(this->messageCount >= this->messageWindowSize)
	{
	  double ratio =  100.0 * this->skippedMsgCount  / this->messageWindowSize;
	  std::cout << "Message filter: " << ratio << " %" << std::endl;
	 // std::cout << "Message count : " << this->skippedMsgCount;
	 // std::cout << " "  << << std::endl;
	  this->skippedMsgCount = 0;
	  this->messageCount = 0;
	}
	this->messageCount++;

	bool has_moved = false;
	bool is_too_early = false;
	bool has_rotated = false;

	gazebo::common::Time mininumTimeElapsed(minimumMsgAge);

	gazebo::common::Time timeDifference =  _current.first - _old.first;
	if (timeDifference < mininumTimeElapsed )
	{

		is_too_early = true;

	}

	gazebo::math::Vector3 posDiff = _current.second.pos - _old.second.pos;
	double translationSquared = posDiff.GetSquaredLength();
	if (translationSquared > minimumDistanceSquared)
	{
		has_moved = true;
	}

	gazebo::math::Quaternion i = _current.second.rot.GetInverse();
	gazebo::math::Quaternion qDiff =  i * _old.second.rot;

	gazebo::math::Vector3 d(qDiff.x, qDiff.y, qDiff.z);
	double rotation = d.GetSquaredLength();
	if (rotation > minimumQuaternionSquared)
	{
		has_rotated = true;
	}


	if (is_too_early)
	{

		this->skippedMsgCount++;
		return true;
	}


	if( (has_moved == false) && (has_rotated == false))
	{

		this->skippedMsgCount++;
		return true;
	}

    return false;
}


/////////////////////////////////////////////////
void GazeboInterface::OnPoseMsg(ConstPosesStampedPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
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

    PoseMsgsFilter_M::iterator it = poseMsgsFilterMap.find(name);

    TimedPose currentPose;
	currentPose.first = time;
	currentPose.second = pose;

    if (it == poseMsgsFilterMap.end())
    {
    	std::pair<PoseMsgsFilter_M::iterator, bool> r;
    	r = poseMsgsFilterMap.insert(make_pair(name, currentPose));
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
void GazeboInterface::OnRequest(ConstRequestPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->requestMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboInterface::OnResponse(ConstResponsePtr &_msg)
{
  if (this->requests.find(_msg->id()) == this->requests.end())
    return;

  gazebo::msgs::Scene sceneMsg;
  sceneMsg.ParseFromString(_msg->serialized_data());
  boost::shared_ptr<gazebo::msgs::Scene> sm(new gazebo::msgs::Scene(sceneMsg));
  this->sceneMsgs.push_back(sm);
  this->requests.erase(_msg->id());
}

/////////////////////////////////////////////////
void GazeboInterface::OnLightMsg(ConstLightPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->lightMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboInterface::OnScene(ConstScenePtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->sceneMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboInterface::OnJointMsg(ConstJointPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->jointMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboInterface::OnSensorMsg(ConstSensorPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->sensorMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboInterface::OnVisualMsg(ConstVisualPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->visualMsgs.push_back(_msg);
}

/////////////////////////////////////////////////
std::string GazeboInterface::PackOutgoingMsg(const std::string &_topic,
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
void GazeboInterface::Send(const std::string &_msg)
{
//  if (this->socketServer)
//    this->socketServer->Write(_msg);
  boost::recursive_mutex::scoped_lock lock(outgoingMutex);
  if (outgoing.size() < MAX_NUM_MSG_SIZE)
    outgoing.push_back(_msg);
}

/*
/////////////////////////////////////////////////
void GazeboInterface::Write(const std::string &_msg)
{
  boost::recursive_mutex::scoped_lock lock(outgoingMutex);
  if (outgoing.size() < MAX_NUM_MSG_SIZE)
    outgoing.push_back(_msg);
}*/

/////////////////////////////////////////////////
std::vector<std::string> GazeboInterface::PopIncomingMessages()
{
  boost::recursive_mutex::scoped_lock lock(incomingMutex);
  std::vector<std::string> in = incoming;
  incoming.clear();
  return in;
}

/////////////////////////////////////////////////
void GazeboInterface::ClearIncomingMessages()
{
  boost::recursive_mutex::scoped_lock lock(incomingMutex);
  incoming.clear();
}

/////////////////////////////////////////////////
std::vector<std::string> GazeboInterface::PopOutgoingMessages()
{
  boost::recursive_mutex::scoped_lock lock(outgoingMutex);
  std::vector<std::string> out = outgoing;
  outgoing.clear();
  return out;
}

/////////////////////////////////////////////////
void GazeboInterface::ClearOutgoingMessages()
{
  boost::recursive_mutex::scoped_lock lock(outgoingMutex);
  outgoing.clear();
}

/////////////////////////////////////////////////
void GazeboInterface::PushRequest(const std::string &_msg)
{
  boost::recursive_mutex::scoped_lock lock(incomingMutex);
  if (incoming.size() < MAX_NUM_MSG_SIZE)
    incoming.push_back(_msg);
}

/////////////////////////////////////////////////
void GazeboInterface::LoadMaterialScripts(const std::string &_path)
{
  if (this->materialParser)
    this->materialParser->Load(_path);
}
