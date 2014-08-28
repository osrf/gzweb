var gazebo = require('./build/Debug/gazebo');
var pubsub = new gazebo.GZPubSub();


pubsub.subscribe("~/world_stats", true);
pubsub.subscriptions()
pubsub.messages()
pubsub.unsubscribe('~/world_stats')

console.log('out');
