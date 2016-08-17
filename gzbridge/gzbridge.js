#!/usr/bin/env node
// var heapdump = require('heapdump')
var WebSocketServer = require('websocket').server;
var http = require('http');

var connections = [];
var materialScriptsMessage = {};

var gazebojs = require('gazebojs');
var gazebo = new gazebojs.Gazebo();

// TODO, to make sure we subscribe with a number equals to the connections length.
const connections_length = 0;
var isConnected = false;
var isGzConnected = false;


var sendPubMsgs = require("./sendPubMsgs.js")

// TODO: should gzserver spawn object when moving to production?
isGzConnected = true;

const filter = new gazebojs.PosesFilter({timeElapsed : 0.02,
    distance: 0.00001,
    quaternion: 0.00001})


if (isGzConnected)
{
  // TODO: Add a function to gazebojs that only loads the material scrpits.
  materialScriptsMessage = gazebo.sim.materials();
}else{
  materialScriptsMessage =  gazebo.sim.materials();
}
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
    if (!isGzConnected)
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
      gazebo.sim.advertise('gazebo.msgs.Request', '~/request');
      gazebo.sim.advertise('gazebo.msgs.Response', '~/response');
      gazebo.sim.advertise('gazebo.msgs.Factory', '~/factory');
      gazebo.sim.advertise('gazebo.msgs.Model', '~/model/modify');
      gazebo.sim.advertise('gazebo.msgs.Light', '~/light/modify');
      gazebo.sim.advertise('gazebo.msgs.Light', '~/light/factory');
      gazebo.sim.advertise('gazebo.msgs.WorldControl', '~/world_control');
    }

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data + ' from ' +
                request.origin + ' ' + connection.remoteAddress);

            const msg = JSON.parse(message.utf8Data)
            //Splitting the publishing part.
            sendPubMsgs.pubToServer(gazebo, msg, send);
            
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
          }
    });
});

var send = function (out) {
    for (var i = 0; i < connections.length; i++)
    {
        connections[i].sendUTF(out);
    }  
}

setInterval(connect, 2000);
var connected = false;

function connect() {
  if (isGzConnected && !connected)
  {
      sendPubMsgs.sendToInterface(gazebo, send, filter);
      connected = true;
  }
}

// setInterval(heapdumpCalc, 60000);
// function heapdumpCalc () {
//   heapdump.writeSnapshot()
// }
