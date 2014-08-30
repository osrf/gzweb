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

///////////////
#include <list>
#include <map>
#include <gazebo/msgs/msgs.hh>
///////////////

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
  cout << "GZPubSub::GZPubSub()" << endl;
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
  tpl->PrototypeTemplate()->Set(String::NewSymbol("subscribe"),
      FunctionTemplate::New(Subscribe)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("unsubscribe"),
      FunctionTemplate::New(Unsubscribe)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("subscriptions"),
      FunctionTemplate::New(Subscriptions)->GetFunction());

/*
  tpl->PrototypeTemplate()->Set(String::NewSymbol("messages"),
      FunctionTemplate::New(GetMessages)->GetFunction());

  tpl->PrototypeTemplate()->Set(String::NewSymbol("advertise"),
      FunctionTemplate::New(Advertise)->GetFunction());

 tpl->PrototypeTemplate()->Set(String::NewSymbol("unadvertise"),
      FunctionTemplate::New(Unadvertise)->GetFunction());

 tpl->PrototypeTemplate()->Set(String::NewSymbol("adverts"),
      FunctionTemplate::New(Adverts)->GetFunction());
*/

  Persistent<Function> constructor1 =
      Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("GZPubSub"), constructor1);


  // Sim
  Local<FunctionTemplate> tp2 = FunctionTemplate::New(New);
    tp2->SetClassName(String::NewSymbol("Sim"));
    tp2->InstanceTemplate()->SetInternalFieldCount(1);

  tp2->PrototypeTemplate()->Set(String::NewSymbol("materials"),
      FunctionTemplate::New(GetMaterials)->GetFunction());

  tp2->PrototypeTemplate()->Set(String::NewSymbol("pause"),
      FunctionTemplate::New(Pause)->GetFunction());

  tp2->PrototypeTemplate()->Set(String::NewSymbol("play"),
      FunctionTemplate::New(Play)->GetFunction());

  tp2->PrototypeTemplate()->Set(String::NewSymbol("publish"),
      FunctionTemplate::New(Publish)->GetFunction());

  tp2->PrototypeTemplate()->Set(String::NewSymbol("spawn"),
      FunctionTemplate::New(Spawn)->GetFunction());

  Persistent<Function> constructor2 =
      Persistent<Function>::New(tp2->GetFunction());
  exports->Set(String::NewSymbol("Sim"), constructor2);

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

//////////////////////////////////////////////////
Handle<Value> GZPubSub::Pause(const Arguments& args)
{
  HandleScope scope;

  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
  obj->gazebo->Pause();
  return scope.Close(Undefined());
}


/////////////////////////////////////////////////
Handle<Value> GZPubSub::Play(const Arguments& args)
{
  HandleScope scope;

  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
  obj->gazebo->Play();
  return scope.Close(Undefined());
}

/////////////////////////////////////////////////
Handle<Value> GZPubSub::Spawn(const Arguments& args)
{
  HandleScope scope;

  // we expect one string argument
  if ( (args.Length() < 1)  || (args.Length() > 1)  )
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong number of arguments")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Type String expected as first argument.")));
    return scope.Close(Undefined());
  }

  if (!args[1]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Name String expected as first argument.")));
    return scope.Close(Undefined());
  }

  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
  obj->gazebo->SpawnModel("box", "hugobox", 0,0,0 0,0,0);
}

/*
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
*/

/////////////////////////////////////////////////
Handle<Value> GZPubSub::GetMaterials(const Arguments& args)
{
  HandleScope scope;

  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());

  std::vector<std::string> msgs = obj->gazebo->GetMaterials();
  Local<Array> arguments = Array::New(msgs.size());
  for (unsigned int i = 0; i < msgs.size(); ++i) {
    arguments->Set(i ,String::New(msgs[i].c_str()));
  }

  return scope.Close(arguments);



//  return scope.Close(
//    string s = "return";
//    String::New( s.c_str() )
//  );
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
  if ( (args.Length() < 1)  || (args.Length() > 2)  )
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong number of arguments")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Topic String expected as first argument.")));
    return scope.Close(Undefined());
  } 

  String::Utf8Value sarg(args[0]->ToString());
  std::string topic(*sarg);

  bool latch = false;
  if(args.Length() >1 )
  {
    if (!args[1]->IsBoolean())
    {
      ThrowException(Exception::TypeError(
          String::New("Wrong argument type. Latch Boolean expected as second arument.")));
      return scope.Close(Undefined());
    }
    latch = *args[1]->ToBoolean();
  }

  try
  {
    cout << "GZPubSub::Subscribe() topic = [" << topic << "]" << endl;  
    GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
    obj->gazebo->Subscribe(topic.c_str(), latch);
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
  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
  obj->gazebo->Unsubscribe(topic.c_str());
  return scope.Close(Undefined());

}


/////////////////////////////////////////////////
Handle<Value> GZPubSub::Publish(const Arguments& args)
{
  HandleScope scope;

  // we expect one string argument
  if ( (args.Length() != 3)  )
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong number of arguments. 3 expected")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Type String expected as first argument.")));
    return scope.Close(Undefined());
  }

  if (!args[1]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Topic String expected as second argument.")));
    return scope.Close(Undefined());
  }

  if (!args[2]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Message String expected as third argument.")));
    return scope.Close(Undefined());
  }

  String::Utf8Value sarg0(args[0]->ToString());
  std::string type(*sarg0);

  String::Utf8Value sarg1(args[1]->ToString());
  std::string topic(*sarg1);

  String::Utf8Value sarg2(args[2]->ToString());
  std::string msg(*sarg2);

  try
  {
    cout << "GZPubSub::Publish()  [" << type << ", " << topic << "]: "  << msg << endl;
    GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
    obj->gazebo->Publish(type.c_str(), topic.c_str(), msg.c_str());
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
NODE_MODULE(gazebo, InitAll)
