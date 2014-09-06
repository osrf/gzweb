var gazebo = require('../build/Debug/gazebo');

if (process.argv.length != 5)
{
  console.log('node publish.js [msg type] [topic name] [message]');
  console.log('ex:\nnode publish.js "gazebo.msgs.WorldControl"  "~/world_control" "{\"pause\": true}"\n');
 
  process.exit(-1);
}

var pubsub = new gazebo.GZPubSub();

var type  = process.argv[2];
var topic = process.argv[3];
var msg   = process.argv[4];

console.log("type: " + type);
console.log("topic: " + topic);
console.log("msg:" + msg);

pubsub.publish(type, topic , msg);


setInterval(function (){
  console.log("done");
  process.exit(0);
},500);


