var gazebo = require('./build/Debug/gazebo');
var pubsub = new gazebo.GZPubSub();


pubsub.subscribe('gazebo.msgs.WorldControl', "~/world_stats", true);
pubsub.subscriptions()
pubsub.messages()
pubsub.unsubscribe('~/world_stats')

pubsub.publish('gazebo.msgs.WorldControl', '~/world_control' , '{"pause": true}');

console.log('out');
