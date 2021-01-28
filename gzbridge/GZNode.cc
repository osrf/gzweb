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

#include <node.h>
#include "GZNode.hh"

#include "GazeboInterface.hh"
#include "OgreMaterialParser.hh"

using namespace v8;
using namespace gzweb;

/////////////////////////////////////////////////
GZNode::GZNode()
{
  if (!gazebo::transport::init()) {
    return;
  }

  this->isGzServerConnected = true;
  gazebo::transport::run();

  this->gzIface = new GazeboInterface();
  this->gzIface->Init();
  this->gzIface->RunThread();
};

/////////////////////////////////////////////////
GZNode::~GZNode()
{
  // Make sure to shut everything down.
  gazebo::transport::fini();
};

/////////////////////////////////////////////////
void GZNode::Init(Local<Object> exports)
{
  Isolate* isolate = exports->GetIsolate();
  // Prepare constructor template
  Local<String> class_name = String::NewFromUtf8(isolate, "GZNode",
      NewStringType::kInternalized).ToLocalChecked();

  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);

  tpl->SetClassName(class_name);
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "loadMaterialScripts", LoadMaterialScripts);

  NODE_SET_PROTOTYPE_METHOD(tpl, "setConnected", SetConnected);

  NODE_SET_PROTOTYPE_METHOD(tpl, "setPoseMsgFilterMinimumDistanceSquared", SetPoseMsgFilterMinimumDistanceSquared);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getPoseMsgFilterMinimumDistanceSquared", GetPoseMsgFilterMinimumDistanceSquared);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setPoseMsgFilterMinimumQuaternionSquared", SetPoseMsgFilterMinimumQuaternionSquared);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getPoseMsgFilterMinimumQuaternionSquared", GetPoseMsgFilterMinimumQuaternionSquared);

  NODE_SET_PROTOTYPE_METHOD(tpl, "getPoseMsgFilterMinimumAge",
      GetPoseMsgFilterMinimumAge);

  NODE_SET_PROTOTYPE_METHOD(tpl, "setPoseMsgFilterMinimumAge",
      SetPoseMsgFilterMinimumAge);

  NODE_SET_PROTOTYPE_METHOD(tpl, "getMessages", GetMessages);

  NODE_SET_PROTOTYPE_METHOD(tpl, "request", Request);

  NODE_SET_PROTOTYPE_METHOD(tpl, "getIsGzServerConnected",
      GetIsGzServerConnected);

  NODE_SET_PROTOTYPE_METHOD(tpl, "getMaterialScriptsMessage",
      GetMaterialScriptsMessage);

  Local<Context> context = isolate->GetCurrentContext();
  exports->Set(context, class_name, tpl->GetFunction(context).ToLocalChecked()).Check();
}

/////////////////////////////////////////////////
void GZNode::New(const FunctionCallbackInfo<Value>& args)
{
  if (args.IsConstructCall()) {
    // Invoked as constructor: `new MyObject(...)`
    GZNode* obj = new GZNode();
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  }
}

/////////////////////////////////////////////////
void GZNode::LoadMaterialScripts(const FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();

  if (args.Length() < 1)
  {
    isolate->ThrowException(Exception::TypeError(
      String::NewFromUtf8(isolate, 
        "Wrong number of arguments", 
        NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  if (!args[0]->IsString())
  {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, 
          "Wrong argument type. String expected.", 
          NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());

  String::Utf8Value path(isolate, args[0]);
  obj->gzIface->LoadMaterialScripts(std::string(*path));

  return;
}

/////////////////////////////////////////////////
void GZNode::SetConnected(const FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();

  GZNode *obj = ObjectWrap::Unwrap<GZNode>(args.This());
  bool value = args[0]->BooleanValue(isolate);
  obj->gzIface->SetConnected(value);

  return;
}

/////////////////////////////////////////////////
void GZNode::GetIsGzServerConnected(const FunctionCallbackInfo<Value>& args)
{
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(args.This());
  bool value = obj->isGzServerConnected;

  args.GetReturnValue().Set(value);
}

/////////////////////////////////////////////////
void GZNode::GetMaterialScriptsMessage(const FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();

  if (args.Length() < 1)
  {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, 
          "Wrong number of arguments", 
          NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  if (!args[0]->IsString())
  {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, 
          "Wrong argument type. String expected.",
          NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  String::Utf8Value path(isolate, args[0]);

  OgreMaterialParser materialParser;
  materialParser.Load(std::string(*path));
  std::string topic = "~/material";
  std::string materialJson = materialParser.GetMaterialAsJson();
  std::string msg;
  msg += "{\"op\":\"publish\",\"topic\":\"" + topic + "\", \"msg\":";
  msg += materialJson;
  msg += "}";

  args.GetReturnValue().Set(
    String::NewFromUtf8(isolate,
      msg.c_str(), 
      NewStringType::kNormal).ToLocalChecked());
}

/////////////////////////////////////////////////
void GZNode::SetPoseMsgFilterMinimumDistanceSquared(const
    FunctionCallbackInfo<Value>& args)
{
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(args.This());

  Local<Number> v = Local<Number>::Cast(args[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumDistanceSquared(value);

  return;
}

/////////////////////////////////////////////////
void GZNode::GetPoseMsgFilterMinimumDistanceSquared(const
    FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(args.This());
  double value  = obj->gzIface->GetPoseFilterMinimumDistanceSquared();
  args.GetReturnValue().Set(Number::New(isolate ,value));
}

/////////////////////////////////////////////////////
void GZNode::SetPoseMsgFilterMinimumQuaternionSquared(const
    FunctionCallbackInfo<Value>& args)
{
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(args.This());
  Local<Number> v = Local<Number>::Cast(args[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumQuaternionSquared(value);

  return;
}

/////////////////////////////////////////////////
void GZNode::GetPoseMsgFilterMinimumQuaternionSquared(const
    FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(args.This());
  double value  = obj->gzIface->GetPoseFilterMinimumQuaternionSquared();
  args.GetReturnValue().Set(Number::New(isolate ,value));
}

/////////////////////////////////////////////////
void GZNode::GetMessages(const FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());

  std::vector<std::string> msgs = obj->gzIface->PopOutgoingMessages();
  // args.GetReturnValue().Set(Number::New(isolate ,msgs.size()));
  Local<Array> arguments = Array::New(isolate, msgs.size());
  for (unsigned int i = 0; i < msgs.size(); ++i) {
    MaybeLocal<String> v8_msg = String::NewFromUtf8(isolate, msgs[i].c_str(), NewStringType::kNormal);
    bool sucess = arguments->Set(context, i, v8_msg.ToLocalChecked()).FromJust();
    if(!sucess){
      //TODO handle failure
      return;
    }
  }

  args.GetReturnValue().Set(arguments);
}


////////////////////////////////////////////////
void GZNode::Request(const FunctionCallbackInfo<Value>& args)
{
  Isolate* isolate = args.GetIsolate();

  if (args.Length() < 1)
  {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, 
          "Wrong number of arguments", 
          NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  if (!args[0]->IsString())
  {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, 
          "Wrong argument type. String expected.",
          NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());

  String::Utf8Value request(isolate, args[0]);
  obj->gzIface->PushRequest(std::string(*request));

  return;
}

/////////////////////////////////////////////////
void GZNode::SetPoseMsgFilterMinimumAge(const
    FunctionCallbackInfo<Value>& args)
{
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  Local<Number> v = Local<Number>::Cast(args[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumMsgAge(value);

  return;
}

/////////////////////////////////////////////////
void GZNode::GetPoseMsgFilterMinimumAge(const
    FunctionCallbackInfo<Value>& args)
{
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  double value  = obj->gzIface->GetPoseFilterMinimumMsgAge();
  args.GetReturnValue().Set(value);
}

/////////////////////////////////////////////////
void InitAll(Local<Object> exports, Local<Value> module, void* priv)
{
  GZNode::Init(exports);
}

/////////////////////////////////////////////////
NODE_MODULE(gzbridge, InitAll)
