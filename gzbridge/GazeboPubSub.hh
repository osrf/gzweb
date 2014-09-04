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

#include "PubSub.hh"
#include <gazebo/transport/TransportIface.hh>


namespace gzweb
{
  class OgreMaterialParser;
}


namespace gzscript
{

  class GzPublisher: public Publisher
  {
    public: GzPublisher(gazebo::transport::NodePtr &_node, const char* _type, const char* _topic);

    public: virtual ~GzPublisher();

    public: virtual void Publish(const char *msg);

    private: gazebo::transport::PublisherPtr pub;
     
  };


  class GzSubscriber: public Subscriber
  {
    public: GzSubscriber(gazebo::transport::NodePtr &_node, const char* _type, const char* _topic, bool _latch);

    public: virtual ~GzSubscriber();

    private: void GzCallback(const std::string &_msg);

    private: gazebo::transport::SubscriberPtr sub;

  };


  class GazeboPubSub : public PubSub
  {
    public: GazeboPubSub();

    public: virtual ~GazeboPubSub();

    // public: void Subscribe(const char * type, const char *topic, bool latch);

    protected: virtual Publisher  *CreatePublisher(const char* type, const char *topic);

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

    public: std::vector<std::string> GetMaterials();
 
    /// \brief Gazebo transport node.
    protected: gazebo::transport::NodePtr node;

    /// \brief Ogre material parser.
    private: gzweb::OgreMaterialParser *materialParser;

    /// \brief lots of spawn 
    private: gazebo::transport::PublisherPtr factoryPub;

    /// \brief Publish world control messages
    private: gazebo::transport::PublisherPtr worldControlPub;

  };


}


#endif
