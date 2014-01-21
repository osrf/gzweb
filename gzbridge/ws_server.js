#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');

var connections = [];
var addon = require('./build/Debug/gzbridge');
var gzconnection = new addon.GZNode();
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

    connections.push(connection);

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
        // gzlient.remove_connection();
    });
});

setInterval(update, 10);

function update()
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
