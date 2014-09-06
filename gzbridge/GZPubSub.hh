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

#ifndef _GZPUBSUB_HH_
#define _GZPUBSUB_HH_

#include <node.h>

#include "GazeboPubSub.hh"



namespace gzscript
{

  // inter thread communication data
  class JsCallbackData {
    public: v8::Persistent<v8::Function>* func;
    public: std::string pbData;
  };


  class GazeboJsSubscriber: public GzSubscriber
  {
    public: GazeboJsSubscriber(gazebo::transport::NodePtr &_node, v8::Persistent<v8::Function>& function,  const char* type, const char* topic, bool latch);

    public: virtual ~GazeboJsSubscriber();  

    protected: virtual void Callback(const char* _msg);
   
    private:  static void doCallback(uv_async_t* handle, int status);

    private:  static void close_cb (uv_handle_t* handle);
 
    private: uv_async_t*  handle;

    private: v8::Persistent<v8::Function>  function;
  };

  class GazeboJsPubSub : public GazeboPubSub
  {
    public: void  Subscribe(v8::Persistent<v8::Function>& function, const char* type, const char* topic, bool latch); 

//  public: void  ImageSubscribe(v8::Persistent<v8::Function>& function, const char* type, const char* topic, bool compressed);
  };

  class GZPubSub : public node::ObjectWrap
  {
    public: static void Init(v8::Handle<v8::Object> exports);

    private: GZPubSub();

    private: ~GZPubSub();

    private: static v8::Handle<v8::Value> New(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Subscribe(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Subscriptions(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Unsubscribe(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        GetMaterials(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Publish(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Pause(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Play(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Spawn(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        GetModelFile(const v8::Arguments& args);
  
    private: GazeboJsPubSub* gazebo;

  };
}

#endif
