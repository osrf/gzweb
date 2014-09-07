var util = require('util');
var gazebo = require('../build/Debug/gazebo');

if (process.argv.length != 5)
{
  console.log('node camera echo.js [source camera name] [dest camera name] [frame_skip]');
  console.log('ex:\n   node camera chimera 30');
  process.exit(-1);
}


var pubsub = new gazebo.GZPubSub();
var src_camera = process.argv[2];
var dest_camera = process.argv[3];
var frame_skip = parseInt(process.argv[4]);  

var msg_type = 'gazebo.msgs.ImageStamped';
var src_topic  = '~/' + src_camera + '/link/camera/image';
var dest_topic =  '~/' + dest_camera + '/link/camera/image'; 

var frame_counter = 0;

console.log('== Republishing: [' + src_topic + '] on topic: [' + dest_topic + '] every ' + frame_skip + ' frames');

pubsub.subscribe(msg_type, src_topic,
    function (err, img){
        // make sure the simulation is running
        pubsub.publish('gazebo.msgs.WorldControl', '~/world_control' , '{"pause": false}');

/*
        if(err)
        {
            console.log('error: ' + err);
            return;
        }
        frame_counter += 1;
        if (frame_counter % frame_skip == 0)
        {
            console.log('publishing frame: ' + frame_counter );
            pubsub.publish( msg_type, dest_topic, img);
        }  
*/
    } );

console.log('setup a loop with 5 sec interval tick');
setInterval(function (){
    console.log('tick');
},5000);


