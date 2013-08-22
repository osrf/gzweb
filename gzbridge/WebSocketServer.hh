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

    /// \brief Check if server is initialized.
    /// return True if initialized.
    public: bool IsInit();

    /// \brief Set custom protocol to used
    /// \param[in] _protocols libwebsocket protocols.
    public: void SetProtocol(struct libwebsocket_protocols _protocol);

    /// \brief Run websocket server.
    private: void Run();

    /// \brief Default libwebsocket protocol callback
    public: static int ServerCallback(struct libwebsocket_context *context,
      struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
      void *user, void *in, size_t len);

    /// \brief Incoming messages.
    public: static std::vector<std::string> incoming;

    /// \brief Outgoing messages.
    public: static std::vector<std::string> outgoing;

    /// \brief Websocket server port.
    protected: int port;

    /// \brief True to enable SSL.
    protected: bool useSSL;

    /// \brief Debug level.
    protected: int debugLevel;

    /// \brief Websocket server options.
    protected: int options;

    /// \brief True to fork into the background and log to syslog.
    protected: bool daemonize;

    /// \brief Syslog options. LOG_PID, LOG_PERROR.
    protected: int syslogOptions;

    /// \brief Interface name.
    protected: std::string interface;

    /// \brief Invoke libwebsockets write callback in loop.
    protected: bool writeLoop;

    /// \brief Thread to run the main loop.
    private: boost::thread *runThread;

    /// \brief libwebsockets protocols
    private: struct libwebsocket_protocols protocols[2];

    /// \brief True if server is initialized.
    private: bool initialized;

  };
}

#endif
