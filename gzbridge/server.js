#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');  
var path = require('path');  

var staticBasePath = './../http/client';

var staticServe = function(req, res) {  
    var fileLoc = path.resolve(staticBasePath);
    fileLoc = path.join(fileLoc, req.url);
    
    fs.readFile(fileLoc, function(err, data) {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        }

        res.statusCode = 200;

        res.write(data);
        return res.end();
    });
};

var httpServer = http.createServer(staticServe);

// default port is 8080.
var port = process.argv[2];
httpServer.listen(port);

var connections = [];
var materialScriptsMessage = {};
var addon = require('./build/Debug/gzbridge');
var gzconnection = new addon.GZNode();
if (gzconnection.getIsGzServerConnected())
{
  gzconnection.loadMaterialScripts('../http/client/assets');
  gzconnection.setPoseMsgFilterMinimumAge(0.02);
  gzconnection.setPoseMsgFilterMinimumDistanceSquared(0.00001);
  gzconnection.setPoseMsgFilterMinimumQuaternionSquared(0.00001);

  console.log('Pose message filter parameters: ');
  console.log('  minimum seconds between successive messages: ' +
      gzconnection.getPoseMsgFilterMinimumAge());
  console.log('  minimum XYZ distance squared between successive messages: ' +
      gzconnection.getPoseMsgFilterMinimumDistanceSquared());
  console.log('  minimum Quartenion distance squared between successive messages:'
      + ' ' + gzconnection.getPoseMsgFilterMinimumQuaternionSquared());
}
else
{
  materialScriptsMessage = gzconnection.getMaterialScriptsMessage('../http/client/assets');
}

var isConnected = false;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(7681, function() {
    console.log((new Date()) + ' Server is listening on port 7681');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' +
          request.origin + ' rejected.');
      return;
    }

    var connection = request.accept(null, request.origin);

    // if gzserver is not connected just send material scripts and status
    if (!gzconnection.getIsGzServerConnected())
    {
      // create error status and send it
      var statusMessage = '{"op":"publish","topic":"~/status","msg":{"status":"error"}}';
      connection.sendUTF(statusMessage);
      // send material scripts message
      connection.sendUTF(materialScriptsMessage);
      return;
    }

    connections.push(connection);

    if (!isConnected)
    {
      isConnected = true;
      gzconnection.setConnected(isConnected);
    }

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data + ' from ' +
            request.origin + ' ' + connection.remoteAddress);
        gzconnection.request(message.utf8Data);
      }
      else if (message.type === 'binary') {
        console.log('Received Binary Message of ' +
            message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
      }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress +
            ' disconnected.');

      // remove connection from array
      var conIndex = connections.indexOf(connection);
      connections.splice(conIndex, 1);

      // if there is no connection notify server that there is no connected client
      if (connections.length == 0) {
        isConnected = false;
        gzconnection.setConnected(isConnected);
      }
    });
});

if (gzconnection.getIsGzServerConnected())
{
  setInterval(update, 10);

  function update()
  {
    if (connections.length > 0)
    {
      var msgs = gzconnection.getMessages();
      for (var i = 0; i < connections.length; ++i)
      {
        for (var j = 0; j < msgs.length; ++j)
        {
          connections[i].sendUTF(msgs[j]);
        }
      }
    }
  }
}
