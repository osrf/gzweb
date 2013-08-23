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

#include <boost/filesystem.hpp>
#include <functional>

#include "HttpWebSocketServer.hh"


using namespace gzweb;

class file_name_equal:
    public std::unary_function<boost::filesystem::path, bool>
{
public:
  explicit file_name_equal(const boost::filesystem::path& fname)
    : file_name(fname) {}

  bool operator()(const boost::filesystem::directory_entry& entry) const
  {
    return entry.path().filename() == file_name;
  }

private:
  boost::filesystem::path file_name;
};

bool find_file(const boost::filesystem::path &dir_path,
    const boost::filesystem::path &file_name,
    boost::filesystem::path &path_found)
{
  const boost::filesystem::recursive_directory_iterator end;
  const boost::filesystem::recursive_directory_iterator it =
    std::find_if(boost::filesystem::recursive_directory_iterator(dir_path), end,
            file_name_equal(file_name));
  if (it == end)
  {
    return false;
  }
  else
  {
    path_found = it->path();
    return true;
  }
}

/////////////////////////////////////////////////
int HttpWebSocketServer::HttpCallback(struct libwebsocket_context *context,
    struct libwebsocket *wsi, enum libwebsocket_callback_reasons reason,
    void *user, void *in, size_t len)
{
  static unsigned char buffer[MAX_ECHO_PAYLOAD];
  struct HttpSessionData *httpPss = (struct HttpSessionData *)user;

  switch (reason)
  {
  case LWS_CALLBACK_HTTP:
  {
    if (in)
    {
      int n = 0;
      std::string inStr(reinterpret_cast<const char *>(in));
      std::string ext = inStr.substr(inStr.find_last_of(".") + 1);

      boost::filesystem::path path("../../gz3d/");
      boost::filesystem::path pathFound;
      std::string  buf;
      std::string mime;
      if (find_file(path,
          boost::filesystem::path((const char *)in).filename(),
          pathFound))
      {
        if (ext == "js")
          mime = "application/javascript";
        else if (ext == "html")
          mime = "text/html";
        else if (ext == "ico")
          mime = "image/x-icon";
        buf = pathFound.string();
      }
      else
      {
        mime = "text/html";
        buf = std::string("../../gz3d/client/index.html");

      }
      if (libwebsockets_serve_http_file(context, wsi, buf.c_str(),
          mime.c_str()))
      {
        return -1;
      }
    }
    break;
  }
  case LWS_CALLBACK_HTTP_FILE_COMPLETION:
    // kill the connection after we sent one file
    return -1;

  case LWS_CALLBACK_HTTP_WRITEABLE:
    do {
      int n = read(httpPss->fd, buffer, sizeof buffer);
      // problem reading, close conn
      if (n < 0)
        goto bail;
      // sent it all, close conn
      if (n == 0)
        goto bail;
      // because it's HTTP and not websocket, don't need to take
      // care about pre and postamble
      int m = libwebsocket_write(wsi, buffer, n, LWS_WRITE_HTTP);
      if (m < 0)
        // write failed, close conn
        goto bail;
      if (m != n)
        // partial write, adjust
        lseek(httpPss->fd, m - n, SEEK_CUR);
    } while (!lws_send_pipe_choked(wsi));
    libwebsocket_callback_on_writable(context, wsi);
    break;

  bail:
    close(httpPss->fd);
    return -1;

  case LWS_CALLBACK_CLOSED_HTTP:
    return -1;

  default:
    break;
  }

  return 0;
}

/////////////////////////////////////////////////
HttpWebSocketServer::HttpWebSocketServer() : WebSocketServer()
{
  this->port = 8080;
  this->writeLoop = false;

  struct libwebsocket_protocols protocol = {
      // name
      "http-only",
      // callback
      HttpWebSocketServer::HttpCallback,
      // session data size
      sizeof(struct HttpSessionData),
    };

  this->SetProtocol(protocol);
}

/////////////////////////////////////////////////
HttpWebSocketServer::~HttpWebSocketServer()
{
}
