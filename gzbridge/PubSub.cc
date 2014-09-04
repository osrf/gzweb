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
#include "PubSub.hh"

#include <algorithm>
#include "json2pb.h"
#include <gazebo/common/SystemPaths.hh>

#define MAX_NUM_MSG_SIZE 1000

using namespace gzscript;
using namespace std;


Subscriber::Subscriber(const char* _type, const char* _topic, bool _latch)
:latch(_latch), type(_type), topic(_topic)
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

void Publisher::Publish(const char *_msg)
{
  cout << "Publisher::Publish: " << _msg << endl;
}

void Subscriber::Callback(const char* _msg)
{
  cout << this->topic << ": " << _msg  <<endl;
}


PubSub::PubSub()
{

}

PubSub::~PubSub()
{

}

void PubSub::AddSubscriber(Subscriber *sub)
{
  this->subs.push_back(sub);
}

void PubSub::Unsubscribe(const char *_topic)
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

std::vector<std::string> PubSub::Subscriptions()
{
  vector<std::string> v;
  for(unsigned int i=0; i < this->subs.size(); ++i)
  {
    v.push_back(this->subs[i]->topic);
  }
  return v;
}


void PubSub::Publish(const char*_type, const char *_topic, const char *_msg)
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
    pub = this->CreatePublisher( _type, _topic);
    this->pubs[t] = pub;
  }
  pub->Publish(_msg);
}



