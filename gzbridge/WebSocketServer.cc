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

struct serveable {
  const char *urlpath;
  const char *mimetype;
};

static const struct serveable whitelist[] = {
  // last one is the default served if no match
  { "/gz3d.html", "text/html" },
};

/////////////////////////////////////////////////
int WebSocketServer::HttpCallback(struct libwebsocket_context *context,
    struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
    void *user, void *in, size_t len)
{
#if 0
  char client_name[128];
  char client_ip[128];
#endif
//  char buf[256];
  std::string  buf;
  char leaf_path[1024];
  int n, m;
  unsigned char *p;
  static unsigned char buffer[4096];
  struct HttpSessionData *pss = (struct HttpSessionData *)user;
#ifdef EXTERNAL_POLL
  int fd = (int)(long)in;
#endif

  switch (reason)
  {
  case LWS_CALLBACK_HTTP:


    for (n = 0; n < (sizeof(whitelist) / sizeof(whitelist[0]) - 1); n++)
      if (in && strcmp((const char *)in, whitelist[n].urlpath) == 0)
        break;

    buf = std::string("../../gz3d/client") + whitelist[n].urlpath;

    if (libwebsockets_serve_http_file(context, wsi, buf.c_str(),
        whitelist[n].mimetype))
      return -1;
    break;

  case LWS_CALLBACK_HTTP_FILE_COMPLETION:
	  // kill the connection after we sent one file
	  return -1;

  case LWS_CALLBACK_HTTP_WRITEABLE:

    do {
      n = read(pss->fd, buffer, sizeof buffer);
      // problem reading, close conn
      if (n < 0)
        goto bail;
      // sent it all, close conn
      if (n == 0)
        goto bail;
      // because it's HTTP and not websocket, don't need to take
      // care about pre and postamble
      m = libwebsocket_write(wsi, buffer, n, LWS_WRITE_HTTP);
      if (m < 0)
        // write failed, close conn
        goto bail;
      if (m != n)
        // partial write, adjust
        lseek(pss->fd, m - n, SEEK_CUR);

    } while (!lws_send_pipe_choked(wsi));
    libwebsocket_callback_on_writable(context, wsi);
    break;

  bail:
    close(pss->fd);
    return -1;

  /*
   * callback for confirming to continue with client IP appear in
   * protocol 0 callback since no websocket protocol has been agreed
   * yet.  You can just ignore this if you won't filter on client IP
   * since the default uhandled callback return is 0 meaning let the
   * connection continue.
   */

  case LWS_CALLBACK_FILTER_NETWORK_CONNECTION:
  #if 0
	  libwebsockets_get_peer_addresses(context, wsi, (int)(long)in, client_name,
		       sizeof(client_name), client_ip, sizeof(client_ip));

	  fprintf(stderr, "Received network connect from %s (%s)\n",
						  client_name, client_ip);
  #endif
	  /* if we returned non-zero from here, we kill the connection */
	  break;

#ifdef EXTERNAL_POLL

  // callbacks for managing the external poll() array appear in
  // protocol 0 callback_echo

  case LWS_CALLBACK_ADD_POLL_FD:

    if (count_pollfds >= max_poll_elements)
    {
      lwsl_err("LWS_CALLBACK_ADD_POLL_FD: too many sockets to track\n");
      return 1;
    }

    fd_lookup[fd] = count_pollfds;
    pollfds[count_pollfds].fd = fd;
    pollfds[count_pollfds].events = (int)(long)len;
    pollfds[count_pollfds++].revents = 0;
    break;

  case LWS_CALLBACK_DEL_POLL_FD:
    if (!--count_pollfds)
	    break;
    m = fd_lookup[fd];
    /* have the last guy take up the vacant slot */
    pollfds[m] = pollfds[count_pollfds];
    fd_lookup[pollfds[count_pollfds].fd] = m;
    break;

  case LWS_CALLBACK_SET_MODE_POLL_FD:
    pollfds[fd_lookup[fd]].events |= (int)(long)len;
    break;

  case LWS_CALLBACK_CLEAR_MODE_POLL_FD:
    pollfds[fd_lookup[fd]].events &= ~(int)(long)len;
    break;
#endif

  default:
	  break;
  }

  return 0;
}


/////////////////////////////////////////////////
int WebSocketServer::ServerCallback(struct libwebsocket_context *context,
    struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
    void *user, void *in, size_t len)
{
  struct SessionData *pss = (struct SessionData *)user;

  switch (reason)
  {

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
      "http",
      // callback
      WebSocketServer::HttpCallback,
      // session data size
      sizeof(struct SessionData)
    },
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
        &protocols[1]);
  }
  libwebsocket_context_destroy(context);

  lwsl_notice("libwebsockets-test-echo exited cleanly\n");
#ifdef WIN32
#else
  closelog();
#endif
}
