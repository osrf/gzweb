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

#ifndef _GZNODE_HH_
#define _GZNODE_HH_

#include <node.h>

namespace gzweb
{
  class GazeboInterface;

  class GZNode : public node::ObjectWrap
  {
    public: static void Init(v8::Handle<v8::Object> exports);

    private: GZNode();

    private: ~GZNode();

    private: static v8::Handle<v8::Value> New(const v8::Arguments& args);

    //private: static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);

    private: static v8::Handle<v8::Value> Callback(const v8::Arguments& args);

    private: static v8::Handle<v8::Value> Request(const v8::Arguments& args);

    private: static v8::Handle<v8::Value> SetPoseMsgFilterMinimumAge(const \
      v8::Arguments& args);

    private: static v8::Handle<v8::Value> GetPoseMsgFilterMinimumAge(const \
      v8::Arguments& args);

    private:
      static v8::Handle<v8::Value> SetPoseMsgFilterMinimumDistanceSquared(\
      const v8::Arguments& args);

    private:
      static v8::Handle<v8::Value> GetPoseMsgFilterMinimumDistanceSquared(\
      const v8::Arguments& args);

    private:
      static v8::Handle<v8::Value> SetPoseMsgFilterMinimumQuaternionSquared(\
      const v8::Arguments& args);

    private: static v8::Handle<v8::Value> SetIsConnected(const v8::Arguments& args);

    private:
      static v8::Handle<v8::Value> GetPoseMsgFilterMinimumQuaternionSquared(\
      const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        GetMessages(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        LoadMaterialScripts(const v8::Arguments& args);

    //private: double counter_;

    private: GazeboInterface* gzIface;

    private: bool connected;


  };
}

#endif
