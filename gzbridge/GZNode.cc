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

using namespace v8;
using namespace gzweb;

/////////////////////////////////////////////////
GZNode::GZNode()
{
  if (!gazebo::transport::init())
    return;

  gazebo::transport::run();

  this->gzIface = new GazeboInterface();
  this->gzIface->Init();
//  this->gzIface->RunThread();

  connected = false;
};

/////////////////////////////////////////////////
GZNode::~GZNode()
{
  // Make sure to shut everything down.
  gazebo::transport::fini();
};

/////////////////////////////////////////////////
void GZNode::Init(Handle<Object> exports)
{
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("GZNode"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  // Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("loadMaterialScripts"),
      FunctionTemplate::New(LoadMaterialScripts)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("setCallback"),
      FunctionTemplate::New(Callback)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("request"),
      FunctionTemplate::New(Request)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("getMessages"),
      FunctionTemplate::New(GetMessages)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("getPoseMsgFilterMinimumAge"),
      FunctionTemplate::New(GetPoseMsgFilterMinimumAge)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("setPoseMsgFilterMinimumAge"),
      FunctionTemplate::New(SetPoseMsgFilterMinimumAge)->GetFunction());

  tpl->PrototypeTemplate()->Set(
		  String::NewSymbol("getPoseMsgFilterMinimumDistanceSquared"),
      FunctionTemplate::New(
    		  GetPoseMsgFilterMinimumDistanceSquared)->GetFunction());

  tpl->PrototypeTemplate()->Set(
		  String::NewSymbol("setPoseMsgFilterMinimumDistanceSquared"),
      FunctionTemplate::New(
    		  SetPoseMsgFilterMinimumDistanceSquared)->GetFunction());

  tpl->PrototypeTemplate()->Set(
		  String::NewSymbol("getPoseMsgFilterMinimumQuaternionSquared"),
      FunctionTemplate::New(
    	  GetPoseMsgFilterMinimumQuaternionSquared)->GetFunction());

  tpl->PrototypeTemplate()->Set(
		  String::NewSymbol("setPoseMsgFilterMinimumQuaternionSquared"),
      FunctionTemplate::New(
    	  SetPoseMsgFilterMinimumQuaternionSquared)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("setIsConnected"), FunctionTemplate::New(
    	  SetIsConnected)->GetFunction());

    Persistent<Function> constructor =
      Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("GZNode"), constructor);
}

/////////////////////////////////////////////////
Handle<Value> GZNode::New(const Arguments& args)
{
  HandleScope scope;

  GZNode* obj = new GZNode();
  obj->Wrap(args.This());

  return args.This();
}

/////////////////////////////////////////////////
Handle<Value> GZNode::LoadMaterialScripts(const Arguments& args)
{
  HandleScope scope;

  if (args.Length() < 1)
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong number of arguments")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. String expected.")));
    return scope.Close(Undefined());
  }

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());

  String::Utf8Value path(args[0]->ToString());
  obj->gzIface->LoadMaterialScripts(std::string(*path));

  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<Value> GZNode::Request(const Arguments& args)
{
  HandleScope scope;

  if (args.Length() < 1)
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong number of arguments")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. String expected.")));
    return scope.Close(Undefined());
  }

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());

  String::Utf8Value request(args[0]->ToString());
  obj->gzIface->PushRequest(std::string(*request));

  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<Value> GZNode::Callback(const Arguments& args) {
  HandleScope scope;

  v8::Local<v8::Function> cb = Local<Function>::Cast(args[0]);
  const unsigned argc = 1;
  Local<Value> argv[argc] = { Local<Value>::New(String::New("hello world")) };
  cb->Call(Context::GetCurrent()->Global(), argc, argv);

  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<v8::Value> GZNode::SetPoseMsgFilterMinimumAge(const v8::Arguments& args)
{
  HandleScope scope;

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  Local<Number> v = Local<Number>::Cast(args[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumMsgAge(value);

  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<v8::Value> GZNode::GetPoseMsgFilterMinimumAge(const \
														v8::Arguments& args)
{
  HandleScope scope;
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  double value  = obj->gzIface->GetPoseFilterMinimumMsgAge();
  return scope.Close(Number::New(value));
}

/////////////////////////////////////////////////
Handle<v8::Value> GZNode::SetPoseMsgFilterMinimumDistanceSquared(const \
    v8::Arguments& args)
{
  HandleScope scope;

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  Local<Number> v = Local<Number>::Cast(args[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumDistanceSquared(value);

  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<v8::Value> GZNode::GetPoseMsgFilterMinimumDistanceSquared(const \
    v8::Arguments& args)
{
  HandleScope scope;
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  double value  = obj->gzIface->GetPoseFilterMinimumDistanceSquared();
  return scope.Close(Number::New(value));
}

/////////////////////////////////////////////////
Handle<v8::Value> GZNode::SetPoseMsgFilterMinimumQuaternionSquared(const \
    v8::Arguments& args)
{
  HandleScope scope;

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  Local<Number> v = Local<Number>::Cast(args[0]);
  double value = v->Value();
  obj->gzIface->SetPoseFilterMinimumQuaternionSquared(value);

  return scope.Close(Undefined());
}

Handle<v8::Value> GZNode::SetIsConnected(const v8::Arguments& args)
{
  HandleScope scope;

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  bool value = args[0]->BooleanValue();
  obj->gzIface->SetIsConnected(value);

  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<v8::Value> GZNode::GetPoseMsgFilterMinimumQuaternionSquared(const \
    v8::Arguments& args)
{
  HandleScope scope;
  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());
  double value  = obj->gzIface->GetPoseFilterMinimumQuaternionSquared();
  return scope.Close(Number::New(value));
}

/////////////////////////////////////////////////
Handle<Value> GZNode::GetMessages(const Arguments& args)
{
  HandleScope scope;

  GZNode* obj = ObjectWrap::Unwrap<GZNode>(args.This());

  std::vector<std::string> msgs = obj->gzIface->PopOutgoingMessages();
  Local<Array> arguments = Array::New(msgs.size());
  for (unsigned int i = 0; i < msgs.size(); ++i) {
    arguments->Set(i ,String::New(msgs[i].c_str()));
  }

  return scope.Close(arguments);
}

/////////////////////////////////////////////////
void InitAll(Handle<Object> exports)
{
  GZNode::Init(exports);
}

/////////////////////////////////////////////////
NODE_MODULE(gzbridge, InitAll)
