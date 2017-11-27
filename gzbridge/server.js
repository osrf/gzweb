#!/usr/bin/env node

const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const path = require('path');
const gzbridge = require('./build/Debug/gzbridge');

/**
 * Path from where the static site is served
 */
const staticBasePath = './../http/client';

/**
 * Port to serve static files from, defaults to 8080
 */
const staticPort = process.argv[2] || 8080;

/**
 * Port to connect websocket
 */
const wsPort = 7681;

/**
 * Array of websocket connections currently active
 */
let connections = [];

/**
 * Holds the message containing all material scripts in case there is no
 * gzserver connected
 */
let materialScriptsMessage = {};

/**
 * Whether the websocket is connected to a gzserver
 */
let isConnected = false;

/**
 * Callback to serve static files
 * @param req Request
 * @param res Response
 */
let staticServe = function(req, res) {
  let fileLoc = path.resolve(staticBasePath);

  if (req.url === '/')
    req.url = '/index.html';

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

// Serve static files
let staticServer = http.createServer(staticServe);
staticServer.listen(staticPort);

console.log(new Date() + " Static server listening on port: " + staticPort);

// Websocket
let gzNode = new gzbridge.GZNode();
if (gzNode.getIsGzServerConnected())
{
  gzNode.loadMaterialScripts(staticBasePath + '/assets');
  gzNode.setPoseMsgFilterMinimumAge(0.02);
  gzNode.setPoseMsgFilterMinimumDistanceSquared(0.00001);
  gzNode.setPoseMsgFilterMinimumQuaternionSquared(0.00001);

  console.log('--------------------------------------------------------------');
  console.log('Gazebo transport node connected to gzserver.');
  console.log('Pose message filter parameters between successive messages: ');
  console.log('  minimum seconds: ' +
      gzNode.getPoseMsgFilterMinimumAge());
  console.log('  minimum XYZ distance squared: ' +
      gzNode.getPoseMsgFilterMinimumDistanceSquared());
  console.log('  minimum Quartenion distance squared:'
      + ' ' + gzNode.getPoseMsgFilterMinimumQuaternionSquared());
  console.log('--------------------------------------------------------------');
}
else
{
  materialScriptsMessage =
      gzNode.getMaterialScriptsMessage(staticBasePath + '/assets');
}

// Server for websocket, it is on a different port from the static server
let server = http.createServer(function(request, response) {
  console.log(new Date() + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(wsPort, function() {
  console.log(new Date() + ' Websocket is listening on port: ' + wsPort);
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

wsServer.on('request', function(request) {

  // Accept request
  let connection = request.accept(null, request.origin);

  // If gzserver is not connected just send material scripts and status
  if (!gzNode.getIsGzServerConnected())
  {
    // create error status and send it
    let statusMessage =
        '{"op":"publish","topic":"~/status","msg":{"status":"error"}}';
    connection.sendUTF(statusMessage);
    // send material scripts message
    connection.sendUTF(materialScriptsMessage);
    return;
  }

  connections.push(connection);

  if (!isConnected)
  {
    isConnected = true;
    gzNode.setConnected(isConnected);
  }

  console.log(new Date() + ' New connection accepted from: ' + request.origin +
      ' ' + connection.remoteAddress);

  // Handle messages received from client
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log(new Date() + ' Received Message: ' + message.utf8Data +
          ' from ' + request.origin + ' ' + connection.remoteAddress);
      gzNode.request(message.utf8Data);
    }
    else if (message.type === 'binary') {
      console.log(new Date() + ' Received Binary Message of ' +
          message.binaryData.length + ' bytes from ' + request.origin + ' ' +
          connection.remoteAddress);
      connection.sendBytes(message.binaryData);
    }
  });

  // Handle client disconnection
  connection.on('close', function(reasonCode, description) {
    console.log(new Date() + ' Peer ' + request.origin + ' ' +
        connection.remoteAddress + ' disconnected.');

    // remove connection from array
    let conIndex = connections.indexOf(connection);
    connections.splice(conIndex, 1);

    // if there is no connection notify server that there is no connected client
    if (connections.length === 0) {
      isConnected = false;
      gzNode.setConnected(isConnected);
    }
  });
});

// If not connected, periodically send messages
if (gzNode.getIsGzServerConnected())
{
  setInterval(update, 10);

  function update()
  {
    if (connections.length > 0)
    {
      let msgs = gzNode.getMessages();
      for (let i = 0; i < connections.length; ++i)
      {
        for (let j = 0; j < msgs.length; ++j)
        {
          connections[i].sendUTF(msgs[j]);
        }
      }
    }
  }
}
