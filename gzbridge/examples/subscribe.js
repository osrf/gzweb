var util = require('util');
var gazebo = require('../build/Debug/gazebo');

if (process.argv.length != 5)
{
  console.log('node subscribe.js [msg type] [topic name] [number of messages]');
  console.log('ex:\nnode subscribe.js "gazebo.msgs.WorldStatistics" "~/world_stats" 10\n');
  process.exit(-1);
}

var type  = process.argv[2];
var topic = process.argv[3];
var count = parseInt(process.argv[4]);

var pubsub = new gazebo.GZPubSub();
console.log("subscribing to topic [" + topic + "] of type [" + type + "]");

pubsub.subscribe(type, topic, function (err, msg){
  
    try {
      if (err) throw(err);
      console.log('-- ' + count + ' --');
      count += -1;
//      var j=JSON.parse(msg);
//      var s=util.inspect(msg);
      var s = msg;
      console.log(s);

    } catch(err)  {
      console.log('error: ' + err);
      console.log(msg);
    }
  }
);

console.log('keep the process alive...');
setInterval(function (){
    if(count <= 0)
    {
       pubsub.unsubscribe(topic);
       process.exit(0);
    }
},100);

