var util = require('util');
var gazebo = require('./build/Debug/gazebo');
var pubsub = new gazebo.GZPubSub();

function beep(msg) {  try{ console.log('+'); var j=JSON.parse(msg); var s=util.inspect(msg); console.log("."); } catch(err) {console.log('\n----- err: ' + err); console.log(msg);} }

function saveImageStamped(m) { console.log('image data size: ' + m.data.length + ' w: ' + m.width + ' h: ' + m.height + ' step: ' + m.step + ' format: ' + m. pixel_format ); }

pubsub.subscribe('gazebo.msgs.PosesStamped', "~/pose/info",  beep,  true);
pubsub.subscribe('gazebo.msgs.WorldControl', "~/world_stats",  beep,  true);
pubsub.subscribe('gazebo.msgs.ImageStamped', "~/camera/link/camera/image", saveImageStamped );

pubsub.subscriptions()
pubsub.messages()
pubsub.unsubscribe('~/world_stats')

pubsub.publish('gazebo.msgs.WorldControl', '~/world_control' , '{"pause": true}');

console.log('out');



