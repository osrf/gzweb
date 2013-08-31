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

#ifndef _GAZEBO_INTERFACE_HH_
#define _GAZEBO_INTERFACE_HH_

#include <string>
#include <list>
#include <boost/unordered/unordered_map.hpp>

#include <gazebo/gazebo.hh>

namespace boost
{
  class thread;
}

namespace gzweb
{
  class GazeboInterface
  {
    /// \brief Constructor.
    /// \param[in] _server Websocket server.
    public: GazeboInterface();

    /// \brief Destructor.
    public: virtual ~GazeboInterface();

    /// \brief Initialize gazebo interface.
    public: void Init();

    /// \brief Run the gazebo interface in a thread.
    public: void RunThread();

    /// \brief Stop the gazebo interace.
    public: void Fini();

    /// \brief Push a request message to incoming messages buffer.
    /// \return Request message.
    public: void PushRequest(const std::string &_request);

    /// \brief Get incoming messages.
    /// \return Incoming messages.
    public: std::vector<std::string> PopIncomingMessages();

    /// \brief Clear incoming messages
    public: void ClearIncomingMessages();

    /// \brief Get outgoing messages.
    /// \return Outgoing messages.
    public: std::vector<std::string> PopOutgoingMessages();

    /// \brief Clear outgoing messages
    public: void ClearOutgoingMessages();

    /// \brief Receive message from websocket server.
    /// \param[in] _msg Message received.
    public: void Receive(const std::string &_msg);

    /// \brief Pack message in a format that conforms to the client.
    private: std::string PackOutgoingMsg(const std::string &_topic,
        const std::string &_msg);

    /// \brief Send message through websocket server.
    /// \param[in] _msg Message to be sent.
    private: void Send(const std::string &_msg);

    /// \brief Run the gazebo interace.
    private: void Run();

    /// \brief Process the messages.
    private: void ProcessMessages();

    /// \brief Model message callback.
    /// \param[in] _msg The message data.
    private: void OnModelMsg(ConstModelPtr &_msg);

    /// \brief Pose message callback.
    /// \param[in] _msg The message data.
    private: void OnPoseMsg(ConstPosesStampedPtr &_msg);

    /// \brief Request callback
    /// \param[in] _msg The message data.
    private: void OnRequest(ConstRequestPtr &_msg);

    /// \brief Light message callback.
    /// \param[in] _msg The message data.
    private: void OnLightMsg(ConstLightPtr &_msg);

    /// \brief Joint message callback.
    /// \param[in] _msg The message data.
    private: void OnJointMsg(ConstJointPtr &_msg);

    /// \brief Scene message callback.
    /// \param[in] _msg The message data.
    private: void OnSensorMsg(ConstSensorPtr &_msg);

    /// \brief Visual message callback.
    /// \param[in] _msg The message data.
    private: void OnVisualMsg(ConstVisualPtr &_msg);

    /// \brief Called when a scene message is received on the
    /// ~/scene topic
    /// \param[in] _msg The message.
    private: void OnScene(ConstScenePtr &_msg);

    /// \brief Response callback
    /// \param[in] _msg The message data.
    private: void OnResponse(ConstResponsePtr &_msg);


    /// \brief a pose at a specific time
    typedef std::pair<gazebo::common::Time, gazebo::math::Pose > TimedPose;

    /// \brief True if the message is to be ignored because it is either
    /// too old, or too similar
    /// \param[in] _previous The previous pose
    /// \param[in] _current The latest pose
    bool FilterPoses(const TimedPose &_previous, const TimedPose &_current);

    /// \brief Incoming messages.
    public: static std::vector<std::string> incoming;

    /// \brief Outgoing messages.
    public: static std::vector<std::string> outgoing;

    /// \brief Thread to run the main loop.
    private: boost::thread *runThread;

    /// \brief Gazebo transport node.
    private: gazebo::transport::NodePtr node;

    /// \brief Subscribe to model info updates
    private: gazebo::transport::SubscriberPtr modelInfoSub;

    /// \brief Subscribe to pose updates
    private: gazebo::transport::SubscriberPtr poseSub;

    /// \brief Subscribe to the request topic
    private: gazebo::transport::SubscriberPtr requestSub;

    /// \brief Subscribe to light topics
    private: gazebo::transport::SubscriberPtr lightSub;

    /// \brief Subscribe to sensor topic
    private: gazebo::transport::SubscriberPtr sensorSub;

    /// \brief Subscribe to scene topic
    private: gazebo::transport::SubscriberPtr sceneSub;

    /// \brief Subscribe to visual topic
    private: gazebo::transport::SubscriberPtr visSub;

    /// \brief Subscribe to joint updates.
    private: gazebo::transport::SubscriberPtr jointSub;

    /// \brief Publish requests
    private: gazebo::transport::PublisherPtr requestPub;

    /// \brief Publish model modify messages
    private: gazebo::transport::PublisherPtr modelPub;

    /// \brief Publish light modify messages
    private: gazebo::transport::PublisherPtr lightPub;

    /// \brief Subscribe to reponses.
    private: gazebo::transport::SubscriberPtr responseSub;

    /// \brief Request message for getting initial scene info.
    private: std::map<int, gazebo::msgs::Request *> requests;

    /// \brief Mutex to lock the various message buffers.
    private: boost::mutex *receiveMutex;

    /// \def ModelMsgs_L
    /// \brief List of model messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Model const> >
        ModelMsgs_L;

    /// \brief List of model message to process.
    private: ModelMsgs_L modelMsgs;

    /// \def RequestMsgs_L
    /// \brief List of request messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Request const> >
        RequestMsgs_L;
    /// \brief List of request message to process.
    private: RequestMsgs_L requestMsgs;

    /// \def PoseMsgs_L.
    /// \brief List of messages.
    typedef std::list<gazebo::msgs::Pose> PoseMsgs_L;

    /// \brief List of pose message to process.
    private: PoseMsgs_L poseMsgs;

    /// \def LightMsgs_L.
    /// \brief List of light messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Light const> >
        LightMsgs_L;

    /// \brief List of light message to process.
    private: LightMsgs_L lightMsgs;

    /// \def SensorMsgs_L
    /// \brief List of sensor messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Sensor const> >
        SensorMsgs_L;

    /// \brief List of sensor message to process.
    private: SensorMsgs_L sensorMsgs;

    /// \def VisualMsgs_L
    /// \brief List of visual messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Visual const> >
        VisualMsgs_L;

    /// \brief List of visual messages to process.
    private: VisualMsgs_L visualMsgs;

    /// \def JointMsgs_L
    /// \brief List of joint messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Joint const> >
        JointMsgs_L;

    /// \brief List of joint message to process.
    private: JointMsgs_L jointMsgs;

    /// \def SceneMsgs_L
    /// \brief List of scene messages.
    typedef std::list<boost::shared_ptr<gazebo::msgs::Scene const> >
        SceneMsgs_L;


    /// \def PoseMsgsFilter_M
    /// \brief Map of last pose messages used for filtering
    typedef boost::unordered_map< std::string, TimedPose> PoseMsgsFilter_M;

    private: PoseMsgsFilter_M poseMsgsFilterMap;

    /// \brief List of scene message to process.
    private: SceneMsgs_L sceneMsgs;

    /// \brief True to stop the interface.
    private: bool stop;

    /// \brief Name of sensor topic.
    private: std::string sensorTopic;

    /// \brief Name of visual topic.
    private: std::string visualTopic;

    /// \brief Name of joint topic.
    private: std::string jointTopic;

    /// \brief Name of model topic.
    private: std::string modelTopic;

    /// \brief Name of pose topic.
    private: std::string poseTopic;

    /// \brief Name of request topic.
    private: std::string requestTopic;

    /// \brief Name of light topic.
    private: std::string lightTopic;

    /// \brief Name of scene topic.
    private: std::string sceneTopic;

    /// \brief Name of model modify topic.
    private: std::string modelModifyTopic;
  };
}

#endif
