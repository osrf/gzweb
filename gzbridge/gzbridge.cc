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


#include <gazebo/gazebo.hh>

#include "GazeboInterface.hh"
#include "HttpWebSocketServer.hh"
#include "WebSocketServer.hh"

#include <iostream>

/////////////////////////////////////////////////
bool run(int _argc, char **_argv)
{
  // Load gazebo
//  gazebo::load(_argc, _argv);
//  gazebo::run();

  if (!gazebo::transport::init())
    return false;

  gazebo::transport::run();

  // run http server
/*  gzweb::HttpWebSocketServer httpServer;
  httpServer.RunThread();

  int timeout = 0;
  while (!httpServer.IsInit() && timeout < 300)
  {
    gazebo::common::Time::MSleep(10);
    timeout++;
  }
  if (timeout == 300)
    gzerr << "http server timed out" << std::endl;*/

  // run webserver;
  gzweb::WebSocketServer server;
  server.RunThread();

  gzweb::GazeboInterface gzIface(&server);
  gzIface.Init();
  gzIface.RunThread();


  // Busy wait loop...replace with your own code as needed.
  while (true)
    gazebo::common::Time::MSleep(10);

//  gzIface.Fini();

  // Make sure to shut everything down.
  gazebo::transport::fini();
}


/////////////////////////////////////////////////
int main(int _argc, char **_argv)
{
  if (!run(_argc, _argv))
    return -1;
}
