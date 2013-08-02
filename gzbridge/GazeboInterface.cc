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
GazeboInterface::GazeboInterface()
{
  this->receiveMutex = new boost::mutex();

  // Create our node for communication
  this->node.reset(new gazebo::transport::Node());
  this->node->Init();

  // Listen to Gazebo topics

  this->sensorSub = this->node->Subscribe("~/sensor",
      &GazeboInterface::OnSensorMsg, this, true);

  this->visSub = this->node->Subscribe("~/visual",
      &GazeboInterface::OnVisualMsg, this);

  // this->lightPub = this->node->Advertise<gazebo::msgs::Light>("~/light");

  this->jointSub = this->node->Subscribe("~/joint",
      &GazeboInterface::OnJointMsg, this);

  // For entity creation
  this->modelInfoSub = node->Subscribe("~/model/info",
      &GazeboInterface::OnModelMsg, this);

  // For entity update
  this->poseSub = this->node->Subscribe("~/pose/info",
      &GazeboInterface::OnPoseMsg, this);

  // For entity delete
  this->requestSub = this->node->Subscribe("~/request",
      &GazeboInterface::OnRequest, this);

  // For lights
  this->lightSub = this->node->Subscribe("~/light",
      &GazeboInterface::OnLightMsg, this);

  this->sceneSub = this->node->Subscribe("~/scene",
      &GazeboInterface::OnScene, this);
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
  this->linkMsgs.clear();
  this->sensorMsgs.clear();

  delete this->receiveMutex;
}

/////////////////////////////////////////////////
void GazeboInterface::RunThread()
{
  this->runThread = new boost::thread(boost::bind(&GazeboInterface::Run, this));
}

/////////////////////////////////////////////////
void GazeboInterface::Run()
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
  static LinkMsgs_L::iterator linkIter;

  SceneMsgs_L sceneMsgsCopy;
  ModelMsgs_L modelMsgsCopy;
  SensorMsgs_L sensorMsgsCopy;
  LightMsgs_L lightMsgsCopy;
  VisualMsgs_L visualMsgsCopy;
  JointMsgs_L jointMsgsCopy;
  LinkMsgs_L linkMsgsCopy;
  RequestMsgs_L requestMsgsCopy;

  {
    boost::mutex::scoped_lock lock(*this->receiveMutex);

    std::copy(this->sceneMsgs.begin(), this->sceneMsgs.end(),
              std::back_inserter(sceneMsgsCopy));
    this->sceneMsgs.clear();

    std::copy(this->modelMsgs.begin(), this->modelMsgs.end(),
              std::back_inserter(modelMsgsCopy));
    this->modelMsgs.clear();

    std::copy(this->sensorMsgs.begin(), this->sensorMsgs.end(),
              std::back_inserter(sensorMsgsCopy));
    this->sensorMsgs.clear();

    std::copy(this->lightMsgs.begin(), this->lightMsgs.end(),
              std::back_inserter(lightMsgsCopy));
    this->lightMsgs.clear();

    this->visualMsgs.sort(VisualMessageLessOp);
    std::copy(this->visualMsgs.begin(), this->visualMsgs.end(),
              std::back_inserter(visualMsgsCopy));
    this->visualMsgs.clear();

    std::copy(this->jointMsgs.begin(), this->jointMsgs.end(),
              std::back_inserter(jointMsgsCopy));
    this->jointMsgs.clear();

    std::copy(this->linkMsgs.begin(), this->linkMsgs.end(),
              std::back_inserter(linkMsgsCopy));
    this->linkMsgs.clear();
  }

  // Process the scene messages. DO THIS FIRST
  for (sIter = sceneMsgsCopy.begin(); sIter != sceneMsgsCopy.end();)
  {
    if (this->ProcessSceneMsg(*sIter))
      sceneMsgsCopy.erase(sIter++);
    else
      ++sIter;
  }

  // Process the model messages.
  for (modelIter = modelMsgsCopy.begin(); modelIter != modelMsgsCopy.end();)
  {
    if (this->ProcessModelMsg(**modelIter))
      modelMsgsCopy.erase(modelIter++);
    else
      ++modelIter;
  }

  // Process the sensor messages.
  for (sensorIter = sensorMsgsCopy.begin(); sensorIter != sensorMsgsCopy.end();)
  {
    if (this->ProcessSensorMsg(*sensorIter))
      sensorMsgsCopy.erase(sensorIter++);
    else
      ++sensorIter;
  }

  // Process the light messages.
  for (lightIter = lightMsgsCopy.begin(); lightIter != lightMsgsCopy.end();)
  {
    if (this->ProcessLightMsg(*lightIter))
      lightMsgsCopy.erase(lightIter++);
    else
      ++lightIter;
  }

  // Process the visual messages.
  for (visualIter = visualMsgsCopy.begin(); visualIter != visualMsgsCopy.end();)
  {
    if (this->ProcessVisualMsg(*visualIter))
      visualMsgsCopy.erase(visualIter++);
    else
      ++visualIter;
  }

  // Process the joint messages.
  for (jointIter = jointMsgsCopy.begin(); jointIter != jointMsgsCopy.end();)
  {
    if (this->ProcessJointMsg(*jointIter))
      jointMsgsCopy.erase(jointIter++);
    else
      ++jointIter;
  }

  // Process the link messages.
  for (linkIter = linkMsgsCopy.begin(); linkIter != linkMsgsCopy.end();)
  {
    if (this->ProcessLinkMsg(*linkIter))
      linkMsgsCopy.erase(linkIter++);
    else
      ++linkIter;
  }

  // Process the request messages
  for (rIter =  this->requestMsgs.begin();
       rIter != this->requestMsgs.end(); ++rIter)
  {
    this->ProcessRequestMsg(*rIter);
  }
  this->requestMsgs.clear();

  {
    boost::mutex::scoped_lock lock(*this->receiveMutex);

    std::copy(sceneMsgsCopy.begin(), sceneMsgsCopy.end(),
        std::front_inserter(this->sceneMsgs));

    std::copy(modelMsgsCopy.begin(), modelMsgsCopy.end(),
        std::front_inserter(this->modelMsgs));

    std::copy(sensorMsgsCopy.begin(), sensorMsgsCopy.end(),
        std::front_inserter(this->sensorMsgs));

    std::copy(lightMsgsCopy.begin(), lightMsgsCopy.end(),
        std::front_inserter(this->lightMsgs));

    std::copy(visualMsgsCopy.begin(), visualMsgsCopy.end(),
        std::front_inserter(this->visualMsgs));

    std::copy(jointMsgsCopy.begin(), jointMsgsCopy.end(),
        std::front_inserter(this->jointMsgs));

    std::copy(linkMsgsCopy.begin(), linkMsgsCopy.end(),
        std::front_inserter(this->linkMsgs));
  }

  {
    boost::mutex::scoped_lock lock(*this->receiveMutex);

    // Process all the model messages last. Remove pose message from the list
    // only when a corresponding visual exits. We may receive pose updates
    // over the wire before  we recieve the visual
    pIter = this->poseMsgs.begin();
    while (pIter != this->poseMsgs.end())
    {
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
  }
}

/////////////////////////////////////////////////
void GazeboInterface::OnModelMsg(ConstModelPtr &_msg)
{
  boost::mutex::scoped_lock lock(*this->receiveMutex);
  this->modelMsgs.push_back(_msg);
}

//////////////////////////////////////////////////
bool GazeboInterface::ProcessModelMsg(const gazebo::msgs::Model &_msg)
{
  std::string modelName, linkName;

  modelName = _msg.name() + "::";
  for (int j = 0; j < _msg.visual_size(); j++)
  {
    boost::shared_ptr<gazebo::msgs::Visual> vm(new gazebo::msgs::Visual(
          _msg.visual(j)));
    if (_msg.has_scale())
    {
//      gazebo::msgs::Set(vm->mutable_scale(), _msg.scale());
      vm->mutable_scale()->set_x(_msg.scale().x());
      vm->mutable_scale()->set_y(_msg.scale().y());
      vm->mutable_scale()->set_z(_msg.scale().z());
    }
    this->visualMsgs.push_back(vm);
  }

  for (int j = 0; j < _msg.joint_size(); j++)
  {
    boost::shared_ptr<gazebo::msgs::Joint> jm(new gazebo::msgs::Joint(
          _msg.joint(j)));
    this->jointMsgs.push_back(jm);

    for (int k = 0; k < _msg.joint(j).sensor_size(); k++)
    {
      boost::shared_ptr<gazebo::msgs::Sensor> sm(new gazebo::msgs::Sensor(
            _msg.joint(j).sensor(k)));
      this->sensorMsgs.push_back(sm);
    }
  }

  for (int j = 0; j < _msg.link_size(); j++)
  {
    linkName = modelName + _msg.link(j).name();
    this->poseMsgs.push_front(_msg.link(j).pose());
    this->poseMsgs.front().set_name(linkName);

    if (_msg.link(j).has_inertial())
    {
      boost::shared_ptr<gazebo::msgs::Link> lm(new gazebo::msgs::Link(_msg.link(j)));
      this->linkMsgs.push_back(lm);
    }

    for (int k = 0; k < _msg.link(j).visual_size(); k++)
    {
      boost::shared_ptr<gazebo::msgs::Visual> vm(new gazebo::msgs::Visual(
            _msg.link(j).visual(k)));
      this->visualMsgs.push_back(vm);
    }

    for (int k = 0; k < _msg.link(j).collision_size(); k++)
    {
      for (int l = 0;
          l < _msg.link(j).collision(k).visual_size(); l++)
      {
        boost::shared_ptr<gazebo::msgs::Visual> vm(new gazebo::msgs::Visual(
              _msg.link(j).collision(k).visual(l)));
        this->visualMsgs.push_back(vm);
      }
    }

    for (int k = 0; k < _msg.link(j).sensor_size(); k++)
    {
      boost::shared_ptr<gazebo::msgs::Sensor> sm(new gazebo::msgs::Sensor(
            _msg.link(j).sensor(k)));
      this->sensorMsgs.push_back(sm);
    }
  }

  return true;
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
void GazeboInterface::ProcessRequestMsg(ConstRequestPtr &_msg)
{
  if (_msg->request() == "entity_delete")
  {
    // _msg->data() has the name;
  }
}

/////////////////////////////////////////////////
bool GazeboInterface::ProcessLightMsg(ConstLightPtr &_msg)
{
  // _msg->name()

  return true;
}


/////////////////////////////////////////////////
bool GazeboInterface::ProcessLinkMsg(ConstLinkPtr &_msg)
{

  // _msg->name()

  return true;
}


/////////////////////////////////////////////////
bool GazeboInterface::ProcessSceneMsg(ConstScenePtr &_msg)
{
  for (int i = 0; i < _msg->model_size(); i++)
  {
    this->poseMsgs.push_front(_msg->model(i).pose());
    this->poseMsgs.front().set_name(_msg->model(i).name());

    this->ProcessModelMsg(_msg->model(i));
  }

  for (int i = 0; i < _msg->light_size(); i++)
  {
    boost::shared_ptr<gazebo::msgs::Light> lm(
        new gazebo::msgs::Light(_msg->light(i)));
    this->lightMsgs.push_back(lm);
  }

  for (int i = 0; i < _msg->joint_size(); i++)
  {
    boost::shared_ptr<gazebo::msgs::Joint> jm(
        new gazebo::msgs::Joint(_msg->joint(i)));
    this->jointMsgs.push_back(jm);
  }

/*  if (_msg->has_ambient())
    this->SetAmbientColor(msgs::Convert(_msg->ambient()));

  if (_msg->has_background())
    this->SetBackgroundColor(msgs::Convert(_msg->background()));

  if (_msg->has_shadows())
    this->SetShadowsEnabled(_msg->shadows());

  if (_msg->has_grid())
    this->SetGrid(_msg->grid());

  if (_msg->has_fog())
  {
    sdf::ElementPtr elem = this->sdf->GetElement("fog");

    if (_msg->fog().has_color())
      elem->GetElement("color")->Set(
          msgs::Convert(_msg->fog().color()));

    if (_msg->fog().has_density())
      elem->GetElement("density")->Set(_msg->fog().density());

    if (_msg->fog().has_start())
      elem->GetElement("start")->Set(_msg->fog().start());

    if (_msg->fog().has_end())
      elem->GetElement("end")->Set(_msg->fog().end());

    if (_msg->fog().has_type())
    {
      std::string type;
      if (_msg->fog().type() == msgs::Fog::LINEAR)
        type = "linear";
      else if (_msg->fog().type() == msgs::Fog::EXPONENTIAL)
        type = "exp";
      else if (_msg->fog().type() == msgs::Fog::EXPONENTIAL2)
        type = "exp2";
      else
        type = "none";

      elem->GetElement("type")->Set(type);
    }

    this->SetFog(elem->Get<std::string>("type"),
                 elem->Get<common::Color>("color"),
                 elem->Get<double>("density"),
                 elem->Get<double>("start"),
                 elem->Get<double>("end"));
  }*/

  return true;
}

/////////////////////////////////////////////////
bool GazeboInterface::ProcessVisualMsg(ConstVisualPtr &_msg)
{
  //_msg->name()

  return true;
}

/////////////////////////////////////////////////
bool GazeboInterface::ProcessJointMsg(ConstJointPtr &_msg)
{
  //_msg->name()

  return true;
}

/////////////////////////////////////////////////
bool GazeboInterface::ProcessSensorMsg(ConstSensorPtr &_msg)
{
  // _msg->type(), _msg->visualize(), msg->topic()
  return true;
}
