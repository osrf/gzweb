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
#include "WebSocketServer.hh"
#include "GazeboInterface.hh"

using namespace gzweb;


struct VisualMessageLess {
    bool operator() (boost::shared_ptr<gazebo::msgs::Visual const> _i,
                     boost::shared_ptr<gazebo::msgs::Visual const> _j)
    {
      return _i->name().size() < _j->name().size();
    }
} VisualMessageLessOp;


/////////////////////////////////////////////////
GazeboInterface::GazeboInterface(WebSocketServer *_server)
{
  this->socketServer = _server;
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
//  this->requestSub = this->node->Subscribe(this->requestTopic,
//      &GazeboInterface::OnRequest, this);

  // For lights
  this->lightSub = this->node->Subscribe(this->lightTopic,
      &GazeboInterface::OnLightMsg, this);

  this->sceneSub = this->node->Subscribe(this->sceneTopic,
      &GazeboInterface::OnScene, this);

  // For getting scene info on connect
  this->requestPub =
      this->node->Advertise<gazebo::msgs::Request>(this->requestTopic);

  this->responseSub = this->node->Subscribe("~/response",
      &GazeboInterface::OnResponse, this);
}

/////////////////////////////////////////////////
GazeboInterface::GazeboInterface()
{
  GazeboInterface(NULL);
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

  delete this->receiveMutex;
  delete this->requestMsg;
}

/////////////////////////////////////////////////
void GazeboInterface::Init()
{
  this->requestPub->WaitForConnection();
  this->requestMsg = gazebo::msgs::CreateRequest("scene_info");
  this->requestPub->Publish(*this->requestMsg);
}

/////////////////////////////////////////////////
void GazeboInterface::SetWebSocketServer(WebSocketServer *_server)
{
  this->socketServer = _server;
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
    if (this->socketServer)
    {
      std::vector<std::string> msgs =
          this->socketServer->GetIncomingMessages();

      for (unsigned int i = 0; i < msgs.size(); ++i)
      {
        std::string msg = msgs[i];
        std::string topic = get_value(msg.c_str(), "topic");
        if (!topic.empty())
        {
          if (topic == this->sceneTopic)
          {
            delete this->requestMsg;
            this->requestMsg = gazebo::msgs::CreateRequest("scene_info");
            this->requestPub->Publish(*this->requestMsg);
          }
          else if (topic == this->poseTopic)
          {

          }
        }
        this->socketServer->ClearIncomingMessages();
      }
    }

    std::string msg = "";
    // Process the scene messages. DO THIS FIRST
    for (sIter = this->sceneMsgs.begin(); sIter != this->sceneMsgs.end();
        ++sIter)
    {
      msg = this->PackOutgoingMsg(this->sceneTopic, pb2json(*(*sIter).get()));
      this->Send(msg);
    }
    this->sceneMsgs.clear();

    // Process the model messages.
    for (modelIter = this->modelMsgs.begin(); modelIter != this->modelMsgs.end();
        ++modelIter)
    {
      msg = this->PackOutgoingMsg(this->modelTopic,
          pb2json(*(*modelIter).get()));
      this->Send(msg);
    }
    this->modelMsgs.clear();

    // Process the sensor messages.
    for (sensorIter = this->sensorMsgs.begin();
        sensorIter != this->sensorMsgs.end(); ++sensorIter)
    {
      msg = this->PackOutgoingMsg(this->sensorTopic,
          pb2json(*(*sensorIter).get()));
      this->Send(msg);
    }
    this->sensorMsgs.clear();

    // Process the light messages.
    for (lightIter = this->lightMsgs.begin();
        lightIter != this->lightMsgs.end(); ++lightIter)
    {
      msg = this->PackOutgoingMsg(this->lightTopic,
          pb2json(*(*lightIter).get()));
      this->Send(msg);
    }
    this->lightMsgs.clear();

    // Process the visual messages.
    for (visualIter = this->visualMsgs.begin();
        visualIter != this->visualMsgs.end(); ++visualIter)
    {
      msg = this->PackOutgoingMsg(this->visualTopic,
          pb2json(*(*visualIter).get()));
      this->Send(msg);
    }
    this->visualMsgs.clear();

    // Process the joint messages.
    for (jointIter = this->jointMsgs.begin();
        jointIter != this->jointMsgs.end(); ++jointIter)
    {
      msg = this->PackOutgoingMsg(this->jointTopic,
          pb2json(*(*jointIter).get()));
      this->Send(msg);
    }
    this->jointMsgs.clear();

    // Process the request messages
    for (rIter =  this->requestMsgs.begin(); rIter != this->requestMsgs.end();
        ++rIter)
    {
      msg = this->PackOutgoingMsg(this->requestTopic,
          pb2json(*(*rIter).get()));
      this->Send(msg);
      /*this->ProcessRequestMsg(*rIter);
      if (_msg->request() == "entity_delete")
      {
        // _msg->data() has the name;
      }*/
    }
    this->requestMsgs.clear();

    // Process all the pose messages last. Remove pose message from the list
    // only when a corresponding visual exits. We may receive pose updates
    // over the wire before  we recieve the visual
    pIter = this->poseMsgs.begin();
    while (pIter != this->poseMsgs.end())
    {
      msg = this->PackOutgoingMsg(this->poseTopic,
          pb2json(*pIter));
      this->Send(msg);
      ++pIter;
      /*Visual_M::iterator iter = this->visuals.find((*pIter).name());
      if (iter != this->visuals.end() && iter->second)
      {
        // If an object is selected, don't let the physics engine move it.
        if (!this->selectedVis || this->selectionMode != "move" ||
            iter->first.find(this->selectedVis->GetName()) == std::string::npos)
        {
          math::Pose pose = gazebo::msgs::Convert(*pIter);
          GZ_ASSERT(iter->second, "Visual pointer is NULL");
          iter->second->SetPose(pose);
          PoseMsgs_L::iterator prev = pIter++;
          this->poseMsgs.erase(prev);
        }
        else
          ++pIter;
      }
      else
        ++pIter;*/
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
    this->poseMsgs.push_back(_msg->pose(i));
  }
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
  if (!this->requestMsg || _msg->id() != this->requestMsg->id())
    return;

  gazebo::msgs::Scene sceneMsg;
  sceneMsg.ParseFromString(_msg->serialized_data());
  boost::shared_ptr<gazebo::msgs::Scene> sm(new gazebo::msgs::Scene(sceneMsg));
  this->sceneMsgs.push_back(sm);
  this->requestMsg = NULL;
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
  if (this->socketServer)
    this->socketServer->Write(_msg);


}
