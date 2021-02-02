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

#ifndef GZBRIDGE_GZNODE_HH_
#define GZBRIDGE_GZNODE_HH_

#include <nan.h>

namespace gzweb
{
  using v8::FunctionCallbackInfo;
  using v8::Value;
  using v8::FunctionTemplate;
  using v8::Object;
  using v8::Persistent;

  class GazeboInterface;

  class GZNode : public Nan::ObjectWrap
  {
    public: static NAN_MODULE_INIT(Init);

    private: GZNode();

    private: ~GZNode();

    private: static NAN_METHOD(New);

    private: static NAN_METHOD(LoadMaterialScripts);

    private: static NAN_METHOD(SetConnected);

    private: static NAN_METHOD(GetIsGzServerConnected);

    private: static NAN_METHOD(GetMaterialScriptsMessage);

    private: static NAN_METHOD(SetPoseMsgFilterMinimumDistanceSquared);

    private: static NAN_METHOD(GetPoseMsgFilterMinimumDistanceSquared);

    private: static NAN_METHOD(SetPoseMsgFilterMinimumQuaternionSquared);

    private: static NAN_METHOD(GetPoseMsgFilterMinimumQuaternionSquared);

    private: static NAN_METHOD(GetMessages);

    private: static NAN_METHOD(Request);

    private: static NAN_METHOD(SetPoseMsgFilterMinimumAge);

    private: static NAN_METHOD(GetPoseMsgFilterMinimumAge);

    private: GazeboInterface* gzIface = nullptr;

    private: bool isGzServerConnected = false;

  };
}

#endif
