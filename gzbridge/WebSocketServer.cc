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
#ifdef WIN32
#else
#include <syslog.h>
#endif
#include <signal.h>

#ifdef CMAKE_BUILD
#include "lws_config.h"
#endif

#include <boost/thread/recursive_mutex.hpp>

#include <libwebsockets.h>
#include "WebSocketServer.hh"


#define LOCAL_RESOURCE_PATH INSTALL_DATADIR"/libwebsockets-test-server"
#define MAX_NUM_MSG_SIZE 1000

using namespace gzweb;

std::vector<std::string> WebSocketServer::incoming;
std::vector<std::string> WebSocketServer::outgoing;

boost::recursive_mutex incomingMutex;
boost::recursive_mutex outgoingMutex;

/////////////////////////////////////////////////
int WebSocketServer::ServerCallback(struct libwebsocket_context *context,
    struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
    void *user, void *in, size_t len)
{
  struct SessionData *pss = (struct SessionData *)user;

  switch (reason) {

  // when the callback is used for server operations
  case LWS_CALLBACK_SERVER_WRITEABLE:
  {
    std::string out = "";
    {
      boost::recursive_mutex::scoped_lock lock(outgoingMutex);

      if (!outgoing.empty())
      {
        out = outgoing.back();
        outgoing.pop_back();
      }
    }

    if (!out.empty())
    {
      memcpy(&pss->buf[LWS_SEND_BUFFER_PRE_PADDING], out.c_str(),
          out.size());

      int n = libwebsocket_write(wsi, &pss->buf[LWS_SEND_BUFFER_PRE_PADDING],
          out.size(), LWS_WRITE_TEXT);

      std::cerr << out.c_str() << std::endl;
      if (n < 0)
      {
        lwsl_err("ERROR %d writing to socket, hanging up\n", n);
        return 1;
      }
      if (n < out.size())
      {
        lwsl_err("Partial write\n");
        return -1;
      }
    }
    break;

  }
  case LWS_CALLBACK_RECEIVE:
    if (len > MAX_ECHO_PAYLOAD)
    {
      lwsl_err("Server received packet bigger than %u, hanging up\n",
        MAX_ECHO_PAYLOAD);
      return 1;
    }

    {
      boost::recursive_mutex::scoped_lock lock(incomingMutex);
      if (incoming.size() < MAX_NUM_MSG_SIZE)
        incoming.push_back(reinterpret_cast<const char *>(in));

      // test print incoming data.
      //std::cerr << incoming[incoming.size()-1] << std::endl;
    }
    // libwebsocket_callback_on_writable(context, wsi);
    break;

  default:
    break;
  }

  return 0;
}

/////////////////////////////////////////////////
WebSocketServer::WebSocketServer()
{
  this->debugLevel = 7;
  this->port = 7681;
  this->options = 0;
  this->daemonize = false;
  this->useSSL = false;
  this->syslogOptions = LOG_PID | LOG_PERROR;
  this->interface = "";
}

/////////////////////////////////////////////////
WebSocketServer::~WebSocketServer()
{
}

/////////////////////////////////////////////////
void WebSocketServer::RunThread()
{
  this->runThread = new boost::thread(boost::bind(&WebSocketServer::Run, this));
}

/////////////////////////////////////////////////
void WebSocketServer::Write(const std::string &_msg)
{
  boost::recursive_mutex::scoped_lock lock(outgoingMutex);
  if (outgoing.size() < MAX_NUM_MSG_SIZE)
    outgoing.push_back(_msg);
}

/////////////////////////////////////////////////
std::vector<std::string> WebSocketServer::GetIncomingMessages()
{
  boost::recursive_mutex::scoped_lock lock(incomingMutex);
  return std::vector<std::string>(incoming);
}

/////////////////////////////////////////////////
void WebSocketServer::ClearIncomingMessages()
{
  boost::recursive_mutex::scoped_lock lock(incomingMutex);
  incoming.clear();
}

/////////////////////////////////////////////////
void WebSocketServer::Run()
{
  struct libwebsocket_context *context;
  struct lws_context_creation_info info;
  memset(&info, 0, sizeof info);

  struct libwebsocket_protocols protocols[] = {
    {
      // name
      "",
      // callback
      WebSocketServer::ServerCallback,
      // session data size
      sizeof(struct SessionData)
    },
    {
      // End of list
      NULL, NULL, 0
    }
  };

  // normally lock path would be /var/lock/lwsts or similar, to
  // simplify getting started without having to take care about
  // permissions or running as root, set to /tmp/.lwsts-lock
  if (this->daemonize && lws_daemonize("/tmp/.lwstecho-lock"))
  {
    lwsl_notice("Failed to daemonize\n");
    return;
  }

#ifdef WIN32
#else
  if (this->daemonize)
    this->syslogOptions &= ~LOG_PERROR;

  // we will only try to log things according to our debugLevel
  setlogmask(LOG_UPTO (LOG_DEBUG));
  openlog("lwsts", this->syslogOptions, LOG_DAEMON);
  // tell the library what debug level to emit and to send it to syslog
  lws_set_log_level(this->debugLevel, lwsl_emit_syslog);
#endif

  lwsl_notice("Running Websocket Server\n");

  info.port = this->port;
  info.iface = this->interface.c_str();
  info.protocols = protocols;
#ifndef LWS_NO_EXTENSIONS
  info.extensions = libwebsocket_get_internal_extensions();
#endif
  if (this->useSSL)
  {
    info.ssl_cert_filepath =
        LOCAL_RESOURCE_PATH"/libwebsockets-test-server.pem";
    info.ssl_private_key_filepath =
        LOCAL_RESOURCE_PATH"/libwebsockets-test-server.key.pem";
  }
  info.gid = -1;
  info.uid = -1;
  info.options = this->options;
  context = libwebsocket_create_context(&info);

  if (context == NULL) {
	  lwsl_err("libwebsocket init failed\n");
	  return;
  }

  int n = 0;
  while (n >= 0)
  {
    n = libwebsocket_service(context, 10);
    libwebsocket_callback_on_writable_all_protocol(
        &protocols[0]);
  }
  libwebsocket_context_destroy(context);

  lwsl_notice("libwebsockets-test-echo exited cleanly\n");
#ifdef WIN32
#else
  closelog();
#endif
}
