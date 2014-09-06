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

#include <v8.h>
#include <uv.h>
//#include <unistd.h>
//#include <sys/syscall.h>


///////////////
#include <list>
#include <map>
#include <gazebo/msgs/msgs.hh>
///////////////

#include "GZPubSub.hh"
#include "GazeboPubSub.hh"

#include <gazebo/common/ModelDatabase.hh>


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
  this->gazebo = new GazeboJsPubSub();
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

  tpl->PrototypeTemplate()->Set(String::NewSymbol("publish"),
      FunctionTemplate::New(Publish)->GetFunction());
  
  // export the template
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

  tp2->PrototypeTemplate()->Set(String::NewSymbol("spawn"),
      FunctionTemplate::New(Spawn)->GetFunction());

  tp2->PrototypeTemplate()->Set(String::NewSymbol("modelFile"),
      FunctionTemplate::New(GetModelFile)->GetFunction());

  // export the template
  Persistent<Function> constructor2 =
      Persistent<Function>::New(tp2->GetFunction());
  exports->Set(String::NewSymbol("Sim"), constructor2);


  // 

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
Handle<Value> GZPubSub::GetModelFile(const Arguments& args)
{
  HandleScope scope;

  if ( args.Length() != 1 )
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong number of arguments. 1 expected")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsString())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Uri String model name expected.")));
    return scope.Close(Undefined());
  }

  String::Utf8Value sarg0(args[0]->ToString());
  std::string uri(*sarg0);
  std::string model = gazebo::common::ModelDatabase::Instance()->GetModelFile(uri);

  return scope.Close(String::New(model.c_str()));
}

/////////////////////////////////////////////////
Handle<Value> GZPubSub::Spawn(const Arguments& args)
{
  HandleScope scope;

  // we expect one string argument
  if ( (args.Length() < 2)  || (args.Length() > 8)  )
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

  double pose[6];
  for(unsigned int i = 0; i < 6; ++i)
  {
    // verify that arguments 3 to 8 are numbers or undefined
    pose[i] = 0;
    unsigned int argIndex = i +2;
    if ((unsigned int)args.Length() > argIndex)
    {
      if (!args[argIndex]->IsNumber())
      {
        ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Number expected.")));
        return scope.Close(Undefined());
      }
      pose[i] = args[argIndex]->ToNumber()->NumberValue();
      
    }
  }

  String::Utf8Value sarg0(args[0]->ToString());
  std::string type(*sarg0);
  String::Utf8Value sarg1(args[1]->ToString());
  std::string name(*sarg1);
  GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());

  obj->gazebo->SpawnModel(type.c_str(), name.c_str(),  pose[0], pose[1], pose[2], pose[3], pose[4], pose[5]);

  return scope.Close(Undefined());
}


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
  if ( (args.Length() < 3)  || (args.Length() > 4)  )
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
        String::New("Wrong argument type. Topic String expected as second argument.")));
    return scope.Close(Undefined());
  } 

  if (!args[2]->IsFunction())
  {
    ThrowException(Exception::TypeError(
        String::New("Wrong argument type. Function  expected as third argument.")));
    return scope.Close(Undefined());
  }

  bool latch = false;
  if(args.Length() > 3 )
  {
    if (!args[3]->IsBoolean())
    {
      ThrowException(Exception::TypeError(
          String::New("Wrong argument type. Latch Boolean expected as third arument.")));
      return scope.Close(Undefined());
    }
    latch = *args[3]->ToBoolean();
  }


  String::Utf8Value sarg0(args[0]->ToString());
  std::string type(*sarg0);

  String::Utf8Value sarg1(args[1]->ToString());
  std::string topic(*sarg1);

  v8::Persistent<v8::Function> cb = v8::Persistent<v8::Function>::New(v8::Local<v8::Function>::Cast(args[2]));

  try
  {
    // cout << "GZPubSub::Subscribe() topic = [" << topic << "]" << endl;  
    GZPubSub* obj = ObjectWrap::Unwrap<GZPubSub>(args.This());
    obj->gazebo->Subscribe(cb, type.c_str(), topic.c_str(), latch);
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
void GazeboJsPubSub::Subscribe(v8::Persistent<v8::Function>& _function, const char* _type, const char* _topic, bool _latch)
{
  Subscriber *sub = new GazeboJsSubscriber(this->node, _function, _type, _topic, _latch);
  this->AddSubscriber(sub);
}

/////////////////////////////////////////////////
GazeboJsSubscriber::GazeboJsSubscriber(gazebo::transport::NodePtr &_node, v8::Persistent<v8::Function>& _function,  const char* _type, const char* _topic, bool _latch)
  :GzSubscriber(_node, _type, _topic, _latch), function(_function)
{
  // setup the inter thread notification handle (from the main script engine thread)
  this->handle = (uv_async_t*)malloc(sizeof(uv_async_t));
  uv_async_init(uv_default_loop(), this->handle, GazeboJsSubscriber::doCallback);
}


/////////////////////////////////////////////////
GazeboJsSubscriber::~GazeboJsSubscriber()
{
  // tear down the inter thread communication
  uv_close((uv_handle_t*)this->handle, close_cb);
}


/////////////////////////////////////////////////
void GazeboJsSubscriber::close_cb(uv_handle_t* _handle)
{
  free(_handle);
}


/////////////////////////////////////////////////
void GazeboJsSubscriber::doCallback(uv_async_t* _handle, int _status)
{
  v8::HandleScope scope;
  const unsigned argc = 2;
  JsCallbackData* p = (JsCallbackData*)_handle->data;
  v8::Handle<v8::Value> argv[argc] = {
    v8::Local<Value>::New(Null()),    
    v8::Local<v8::Value>::New(v8::String::New(p->pbData.c_str()))
  };

  v8::TryCatch try_catch;
  (*p->func)->Call(v8::Context::GetCurrent()->Global(), argc, argv);

  delete p;

  if (try_catch.HasCaught()) {
    node::FatalException(try_catch);
  }

}


/////////////////////////////////////////////////
void  GazeboJsSubscriber::Callback(const char *_msg)
{
  JsCallbackData* p = new JsCallbackData();
  p->func = &function;
  p->pbData = _msg;
  //  fprintf(stderr, "receiving message (thread::%d) ->\n", thread_id());
  this->handle->data = (void *)p;
  uv_async_send(handle);
}


/////////////////////////////////////////////////
NODE_MODULE(gazebo, InitAll)
