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

#include <nan.h>
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
  Nan::SetPrototypeMethod(tpl, "loadMaterialScripts", LoadMaterialScripts);

  Nan::SetPrototypeMethod(tpl, "setConnected", SetConnected);

  Nan::SetPrototypeMethod(tpl, "setPoseMsgFilterMinimumDistanceSquared", SetPoseMsgFilterMinimumDistanceSquared);
  Nan::SetPrototypeMethod(tpl, "getPoseMsgFilterMinimumDistanceSquared", GetPoseMsgFilterMinimumDistanceSquared);
  Nan::SetPrototypeMethod(tpl, "setPoseMsgFilterMinimumQuaternionSquared", SetPoseMsgFilterMinimumQuaternionSquared);
  Nan::SetPrototypeMethod(tpl, "getPoseMsgFilterMinimumQuaternionSquared", GetPoseMsgFilterMinimumQuaternionSquared);

  Nan::SetPrototypeMethod(tpl, "getPoseMsgFilterMinimumAge",
      GetPoseMsgFilterMinimumAge);

  Nan::SetPrototypeMethod(tpl, "setPoseMsgFilterMinimumAge",
      SetPoseMsgFilterMinimumAge);

  Nan::SetPrototypeMethod(tpl, "getMessages", GetMessages);

  Nan::SetPrototypeMethod(tpl, "request", Request);

  Nan::SetPrototypeMethod(tpl, "getIsGzServerConnected",
      GetIsGzServerConnected);

  Nan::SetPrototypeMethod(tpl, "getMaterialScriptsMessage",
      GetMaterialScriptsMessage);

  Local<Context> context = isolate->GetCurrentContext();
  exports->Set(context, class_name, tpl->GetFunction(context).ToLocalChecked()).ToChecked();
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::New)
{
  if (info.IsConstructCall()) {
    // Invoked as constructor: `new MyObject(...)`
    GZNode* obj = new GZNode();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  }else{
    return Nan::ThrowTypeError("GZNode::New - called without new keyword");
  }
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::LoadMaterialScripts)
{
  Isolate* isolate = info.GetIsolate();

  if (info.Length() < 1)
  {
    return Nan::ThrowTypeError("GZNode::LoadMaterialScripts - Wrong number of arguments. One arg expected");
  }

  if (!info[0]->IsString())
  {
    return Nan::ThrowTypeError("GZNode::LoadMaterialScripts - Wrong argument type. String expected.");
  }

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(info.This());

  String::Utf8Value path(isolate, info[0]);
  obj->gzIface->LoadMaterialScripts(std::string(*path));

  return;
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::SetConnected)
{
  Isolate* isolate = info.GetIsolate();

  GZNode *obj = ObjectWrap::Unwrap<GZNode>(info.This());

#if NODE_MAJOR_VERSION<=10
  Local<Context> context = isolate->GetCurrentContext();
  bool value = info[0]->BooleanValue(context).ToChecked();
#else
  bool value = info[0]->BooleanValue(isolate);
#endif
  obj->gzIface->SetConnected(value);

  return;
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::GetIsGzServerConnected)
{
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(info.This());
  bool value = obj->isGzServerConnected;

  info.GetReturnValue().Set(value);
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::GetMaterialScriptsMessage)
{
  Isolate* isolate = info.GetIsolate();

  if (info.Length() < 1)
  {
    return Nan::ThrowTypeError("GZNode::GetMaterialScriptsMessage - Wrong number of arguments. One arg expected.");
  }

  if (!info[0]->IsString())
  {
    return Nan::ThrowTypeError("GZNode::GetMaterialScriptsMessage - Wrong argument type. String expected.");
  }

  String::Utf8Value path(isolate, info[0]);

  OgreMaterialParser materialParser;
  materialParser.Load(std::string(*path));
  std::string topic = "~/material";
  std::string materialJson = materialParser.GetMaterialAsJson();
  std::string msg;
  msg += "{\"op\":\"publish\",\"topic\":\"" + topic + "\", \"msg\":";
  msg += materialJson;
  msg += "}";

  info.GetReturnValue().Set(
    String::NewFromUtf8(isolate,
      msg.c_str(), 
      NewStringType::kNormal).ToLocalChecked());
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::SetPoseMsgFilterMinimumDistanceSquared)
{
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(info.This());

  Local<Number> v = Local<Number>::Cast(info[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumDistanceSquared(value);

  return;
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::GetPoseMsgFilterMinimumDistanceSquared)
{
  Isolate* isolate = info.GetIsolate();
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(info.This());
  double value  = obj->gzIface->GetPoseFilterMinimumDistanceSquared();
  info.GetReturnValue().Set(Number::New(isolate ,value));
}

/////////////////////////////////////////////////////
NAN_METHOD(GZNode::SetPoseMsgFilterMinimumQuaternionSquared)
{
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(info.This());
  Local<Number> v = Local<Number>::Cast(info[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumQuaternionSquared(value);

  return;
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::GetPoseMsgFilterMinimumQuaternionSquared)
{
  Isolate* isolate = info.GetIsolate();
  GZNode *obj = ObjectWrap::Unwrap<GZNode>(info.This());
  double value  = obj->gzIface->GetPoseFilterMinimumQuaternionSquared();
  info.GetReturnValue().Set(Number::New(isolate ,value));
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::GetMessages)
{
  Isolate* isolate = info.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(info.This());

  std::vector<std::string> msgs = obj->gzIface->PopOutgoingMessages();
  // info.GetReturnValue().Set(Number::New(isolate ,msgs.size()));
  Local<Array> arguments = Array::New(isolate, msgs.size());
  for (unsigned int i = 0; i < msgs.size(); ++i) {
    MaybeLocal<String> v8_msg = String::NewFromUtf8(isolate, msgs[i].c_str(), NewStringType::kNormal);
    bool sucess = arguments->Set(context, i, v8_msg.ToLocalChecked()).FromJust();
    if(!sucess){
      //TODO handle failure
      return;
    }
  }

  info.GetReturnValue().Set(arguments);
}


////////////////////////////////////////////////
NAN_METHOD(GZNode::Request)
{
  Isolate* isolate = info.GetIsolate();

  if (info.Length() < 1)
  {
    return Nan::ThrowTypeError("GZNode::Request - Wrong number of arguments. One arg expected.");
  }

  if (!info[0]->IsString())
  {
    return Nan::ThrowTypeError("GZNode::Request - Wrong argument type. String expected.");
  }

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(info.This());

  String::Utf8Value request(isolate, info[0]);
  obj->gzIface->PushRequest(std::string(*request));

  return;
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::SetPoseMsgFilterMinimumAge)
{
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(info.This());
  Local<Number> v = Local<Number>::Cast(info[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumMsgAge(value);

  return;
}

/////////////////////////////////////////////////
NAN_METHOD(GZNode::GetPoseMsgFilterMinimumAge)
{
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(info.This());
  double value  = obj->gzIface->GetPoseFilterMinimumMsgAge();
  info.GetReturnValue().Set(value);
}

/////////////////////////////////////////////////
void InitAll(Local<Object> exports, Local<Value> module, void* priv)
{
  GZNode::Init(exports);
}

/////////////////////////////////////////////////
NODE_MODULE(gzbridge, InitAll)
