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


#ifndef _GAZEBO_PUBSUB_HH_
#define _GAZEBO_PUBSUB_HH_

#include <string>
#include <stdexcept>
#include <vector>

#include <gazebo/transport/TransportIface.hh>

namespace boost
{
  class thread;
}

namespace gzweb
{
  class OgreMaterialParser;
}

namespace gzscript
{

  class PubSubException : public std::runtime_error
  {
    /// \brief Constructor
    /// param[in] m the exception message 
    public: PubSubException(const char*m) :std::runtime_error(m){}
  };


  class Publisher
  {
    public: Publisher(const char* type, const char* topic);
    public: virtual ~Publisher();
    public: virtual void Publish(const char* msg);
    
    public: std::string type;
    public: std::string topic;
  };

  class Subscriber
  {
    public: Subscriber(const char* topic, bool latch);
    public: virtual ~Subscriber();

    public: virtual void Callback(const char *msg);
    public: std::string topic;
  };

  class GazeboPubSub
  {

    std::map<std::string, Publisher*> pubs;
    std::vector<Subscriber*> subs;

    public: void Subscribe(const char *topic, bool latch);
    public: void Unsubscribe(const char* topic);

//  public: void Advertiise(const char *topic, const char* type);
//  public: void Unadvertise(const char *topic);
//  public: std::vector<std::string> Adverts();

    public: std::vector<std::string> GetTopics(); // gz topic list
    public: void Publish(const char* type, const char *topic, const char *msg);

    public: std::vector<std::string> GetMaterials();
    public: std::vector<std::string> Subscriptions();
    public: void Pause();
    public: void Play(); 
    public: void SpawnModel(const char *_type,
                         const char *_name,
                         double x,
                         double y,
                         double z,
                         double rx,
                         double ry,
                         double rz);

    /// \brief Constructor.
    /// \param[in] _server Websocket server.
    public: GazeboPubSub();

    /// \brief Destructor.
    public: virtual ~GazeboPubSub();

    /// \brief the list ofi available  message types
    private: std::vector<std::string> messageTypes;

    /// \brief Ogre material parser.
    private: gzweb::OgreMaterialParser *materialParser;

    /// \brief Gazebo transport node.
    private: gazebo::transport::NodePtr node;

    /// \brief lots of spawn 
    private: gazebo::transport::PublisherPtr factoryPub;

    /// \brief Publish world control messages
    private: gazebo::transport::PublisherPtr worldControlPub;

  };
}

#endif
