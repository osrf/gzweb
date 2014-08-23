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

#include <iostream>

#include <node.h>
#include "GZPubSub.hh"

#include "GazeboPubSub.hh"

using namespace v8;
using namespace gzscript;
using namespace std;


/////////////////////////////////////////////////
void InitAll(Handle<Object> exports)
{
  GZPubSub::Init(exports);
}

/////////////////////////////////////////////////
GZPubSub::GZPubSub()
{
  this->gazebo = new GazeboPubSub();
};

/////////////////////////////////////////////////
GZPubSub::~GZPubSub()
{
  // Make sure to shut everything down.
  gazebo::transport::fini();
};

/////////////////////////////////////////////////
void GZPubSub::Init(Handle<Object> exports)
{

  // cout << "GZPubSub::Init() " << endl;

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("GZPubSub"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("messages"),
      FunctionTemplate::New(GetMessages)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("subscribe"),
      FunctionTemplate::New(Subscribe)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("unsubscribe"),
      FunctionTemplate::New(Unsubscribe)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("subscriptions"),
      FunctionTemplate::New(Subscriptions)->GetFunction());

  Persistent<Function> constructor =
      Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("GZPubSub"), constructor);

 //  cout << "GZPubSub::Init() done " << endl;

}


/////////////////////////////////////////////////
Handle<Value> GZPubSub::New(const Arguments& args)
{
  HandleScope scope;

 GZPubSub* obj = new GZPubSub();
  obj->Wrap(args.This());

  return args.This();
}


/////////////////////////////////////////////////
Handle<Value> GZPubSub::GetMessages(const Arguments& args)
{
  HandleScope scope;

  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());

  std::vector<std::string> msgs = obj->gazebo->PopOutgoingMessages();
  Local<Array> arguments = Array::New(msgs.size());
  for (unsigned int i = 0; i < msgs.size(); ++i) {
    arguments->Set(i ,String::New(msgs[i].c_str()));
  }

  return scope.Close(arguments);
}

/////////////////////////////////////////////////
Handle<Value> GZPubSub::Subscriptions(const Arguments& args)
{
  HandleScope scope;

  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());

  std::vector<std::string> v = obj->gazebo->Subscriptions();
  Local<Array> arguments = Array::New(v.size());
  for (unsigned int i = 0; i < v.size(); ++i) {
    arguments->Set(i ,String::New(v[i].c_str()));
  }

  return scope.Close(arguments);
}


/////////////////////////////////////////////////
Handle<Value> GZPubSub::Subscribe(const Arguments& args)
{
  HandleScope scope;

  // we expect one string argument
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

  String::Utf8Value sarg(args[0]->ToString());
  std::string topic(*sarg);

  try
  {
    cout << "GZPubSub::Subscribe() topic = [" << topic << "]" << endl;  
    GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
    obj->gazebo->Subscribe(topic.c_str());
  }
  catch(PubSubException &x)
  {
    ThrowException(Exception::TypeError(
        String::New(x.what() )));
    return scope.Close(Undefined());
  }
 
  return scope.Close(Undefined());
}


/////////////////////////////////////////////////
Handle<Value> GZPubSub::Unsubscribe(const Arguments& args)
{
  HandleScope scope;

  // we expect one string argument
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

  String::Utf8Value sarg(args[0]->ToString());
  std::string topic(*sarg);

  cout << "GZPubSub::Unsubscribe() topic = [" << topic << "]" << endl;

  return scope.Close(Undefined());


}



/////////////////////////////////////////////////
NODE_MODULE(gazebo, InitAll)
