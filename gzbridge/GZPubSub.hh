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


namespace gzscript
{
  class GazeboPubSub;

  class GZPubSub : public node::ObjectWrap
  {
    public: static void Init(v8::Handle<v8::Object> exports);

    private: GZPubSub();

    private: ~GZPubSub();

    private: static v8::Handle<v8::Value> New(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        GetMessages(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Subscribe(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Subscriptions(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Unsubscribe(const v8::Arguments& args);
/*
    private: static v8::Handle<v8::Value>
        Advertise(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Unadvertise(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Adverts(const v8::Arguments& args);
*/
    private: static v8::Handle<v8::Value>
        GetMaterials(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Publish(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Pause(const v8::Arguments& args);

    private: static v8::Handle<v8::Value>
        Play(const v8::Arguments& args);

   private: GazeboPubSub* gazebo;

  };
}

#endif
