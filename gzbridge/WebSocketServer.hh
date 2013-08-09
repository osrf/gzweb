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
#ifndef _WEB_SOCKET_HH_
#define _WEB_SOCKET_HH_

#include <string>
#include <vector>
#include <boost/thread.hpp>

#include <libwebsockets.h>

#define MAX_ECHO_PAYLOAD 32768

namespace gzweb
{
  struct SessionData
  {
    public: unsigned char buf[LWS_SEND_BUFFER_PRE_PADDING +
        MAX_ECHO_PAYLOAD + LWS_SEND_BUFFER_POST_PADDING];
  };

  class WebSocketServer
  {
    /// \brief Constructor.
    public: WebSocketServer();

    /// \brief Destructor.
    public: virtual ~WebSocketServer();

    /// \brief Run websocket server in a thread.
    public: void RunThread();

    /// \brief Write message to socket.
    /// \param[in] _msg Message to write.
    public: void Write(const std::string &_msg);

    /// \brief Get incoming messages.
    /// \return Incoming messages.
    public: std::vector<std::string> GetIncomingMessages();

    /// \brief Clear incoming messages
    public: void ClearIncomingMessages();

    /// \brief Run websocket server.
    private: void Run();

    public: static int ServerCallback(struct libwebsocket_context *context,
      struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
      void *user, void *in, size_t len);

    /// \brief Websocket server port.
    private: int port;

    /// \brief True to enable SSL.
    private: bool useSSL;

    /// \brief Debug level.
    private: int debugLevel;

    /// \brief Websocket server options.
    private: int options;

    /// \brief True to fork into the background and log to syslog.
    private: bool daemonize;

    /// \brief Syslog options. LOG_PID, LOG_PERROR.
    private: int syslogOptions;

    /// \brief Interface name.
    private: std::string interface;

    /// \brief Thread to run the main loop.
    private: boost::thread *runThread;

    /// \brief Incoming messages.
    public: static std::vector<std::string> incoming;

    /// \brief Outgoing messages.
    public: static std::vector<std::string> outgoing;
  };
}

#endif
