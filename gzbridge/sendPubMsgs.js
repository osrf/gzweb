// msg to be sent to gzweb
var out = {};
var strMsg;

// The nanoSec is not currently used in calculations.
const lastStatsTime =  { sec: 0, nsec: 0 };
const lastPausedState = true;
const wallTime = { sec: 0, nsec: 0 };
const paused = false;
const ProtoBuf = require("protobufjs");
const random = require("random-js")(); // uses the nativeMath engine
var value = random.integer(1, 1000);

const msgLocator = require('./msgLocator.js')


function sendToInterface (gazebo, send, filter) {
    gazebo.subscribe('gazebo.msgs.Visual', '~/visual', function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/visual" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Joint', "~/joint", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/joint" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Model', "~/model/info", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/model/info" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Request', "~/request", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/request" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Link', "~/link", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/link" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Scene', "~/scene", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/scene" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Physics', "~/physics", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/physics" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Sensor', "~/sensor", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/sensor" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Light', "~/factory/light", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/factory/light" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Light', "~/light/modify", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/light/modify" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.Road', "~/roads", function(e,d){
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/Road" + "\", \"msg\":";
        out += d;
        out += "}";
        send(out);                    
    },{'toJson':false});
    gazebo.subscribe('gazebo.msgs.PosesStamped', "~/pose/info", function(e,d){
        const filtered =  filter.addPosesStamped(d)
        if(filtered.length!==0){
            for (var j = 0; j < filtered.length; j++) {
                strMsg = JSON.stringify(filtered[j]);
                out = "{\"op\":\"publish\",\"topic\":\"" + "~/pose/info" + "\", \"msg\":";
                out += strMsg;
                out += "}";
                send(out);
            }
        }
    });
    gazebo.subscribe('gazebo.msgs.WorldStatistics', "~/world_stats", function(e,d){
        wallTime = d.real_time;
        paused = d.paused;
        if((wallTime.sec - lastStatsTime.sec) >= 1 || lastPausedState != paused || wallTime < lastStatsTime){
            lastStatsTime = wallTime;
            lastPausedState = paused;
            strMsg = JSON.stringify(d);
            out = "{\"op\":\"publish\",\"topic\":\"" + "~/world_stats" + "\", \"msg\":";
            out += strMsg;
            out += "}";
            send(out);
      }
    });
    gazebo.subscribe('gazebo.msgs.Response', "~/response", function(e,jsonmsg){
        var serialized = JSON.stringify(jsonmsg.serialized_data);
        if(jsonmsg.request ===  'physics_info' && jsonmsg.response !== 'error'){
            const phyBuilder = ProtoBuf.loadProtoFile(msgLocator.getProtoPath('physics'));
            strMsg = JSON.stringify(phyBuilder.build('gazebo.msgs.Physics').decode64(serialized));
            out = "{\"op\":\"publish\",\"topic\":\"" + "~/physics" + "\", \"msg\":";
            out += strMsg;
            out += "}";
       }
       else if(jsonmsg.request === 'scene_info' && jsonmsg.response !== 'error'){
           const sceneBuilder = ProtoBuf.loadProtoFile(msgLocator.getProtoPath('scene'));
           strMsg = JSON.stringify(sceneBuilder.build('gazebo.msgs.Scene').decode64(serialized));
           out = "{\"op\":\"publish\",\"topic\":\"" + "~/scene" + "\", \"msg\":";                        
           out += strMsg;
           out += "}";
        }
       else if(jsonmsg.request === 'heightmap_data' && jsonmsg.response !== 'error' 
        && jsonmsg.response.type === 'gazebo.msgs.Geometry'){
           const heightmapBuilder = ProtoBuf.loadProtoFile(msgLocator.getProtoPath('heightmapgeom'));
           strMsg = JSON.stringify(heightmapBuilder.build('gazebo.msgs.HeightmapGeom').decode64(serialized));
           out = "{\"op\":\"publish\",\"topic\":\"" + "~/scene" + "\", \"msg\":";                        
           out += strMsg;
           out += "}";
        }
       send(out);
    });
}

function pubToServer (gazebo, msg, send) {
    if(msg.op !== 'advertise'){
        if(msg.topic){
             // Start Processing the messages.
             // The traffic on the world_control  topic is too little
             if(msg.topic === '~/world_control' ){
                 if(msg.msg.pause){
                       gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control", {pause:true});
                   }
                   else if (!msg.msg.pause) {
                       gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control", {pause:false});
                   }
                   if(msg.msg.reset){
                        if(msg.msg.reset === 'model'){
                            gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control", {reset:{all: true, time_only:false, model_only:true}});
                        }
                        else if(msg.msg.reset === 'world'){
                            gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control", {reset:{all:true}});
                        }
                   }
             }
            if(msg.topic === '~/model/modify' ){
                if(msg.op==='publish'){
                    if(msg.msg){
                          gazebo.publish("gazebo.msgs.Model",  "~/model/modify",{name: msg.msg.name, id: msg.msg.id,
                              pose:{position:msg.msg.position, orientation:msg.msg.orientation}});
                        }
                  }
            }
            if(msg.topic === '~/scene' ){
                gazebo.publish("gazebo.msgs.Request",  "~/request", {id: value, request: 'scene_info'});
            }
            if(msg.topic === '~/physics' ){
                gazebo.publish("gazebo.msgs.Request",  "~/request", {id: value, request: 'physics_info', data: ''});
            }
            if(msg.topic === '~/entity_delete'){
                if(msg.op === 'publish'){
                    gazebo.deleteEntity(msg.msg.name);
                }
            }
            if(msg.topic === '~/factory' ){
                if(msg.msg){
                  const type = msg.msg.type;
                      if(type === "box" || type === "sphere" || type === "cylinder"){
                          gazebo.spawn(type, msg.msg.name, msg.msg.position.x, msg.msg.position.y, msg.msg.position.z,
                           msg.msg.orientation.x, msg.msg.orientation.y, msg.msg.orientation.z);
                      }else{
                          gazebo.spawn('model://'+ type, msg.msg.name, msg.msg.position.x, msg.msg.position.y, msg.msg.position.z,
                           msg.msg.orientation.x, msg.msg.orientation.y, msg.msg.orientation.z);
                      }
                 }
            }
            if(msg.topic === '~/material' ){
                  var material = "{\"op\":\"publish\",\"topic\":\"" + "~/material" + "\", \"msg\":";
                  material += JSON.stringify(gazebo.sim.materials());
                  material += "}";
                  send(material);
            }
            // TODO: light msgs processing.
            // if(msg.topic === '~/factory/light' || msg.topic === '~/light/modify' ){
            //     console.log('LIght MESSAGE !!!!!!!!!!~~~~~~~~~~ LIght ~~~~~~~~~~~~~~~~~~~~~~');
            //     console.log(msg);
            //         var modelName = msg.name;
            //         // var linkName = msg.msg.link.name;
            //         if(!(modelName === '' || linkName === '')){
            //         }
            //      if(msg.op === 'publish'){
            //         if(msg.msg){
            //           for (var i = 0; i < connections.length; ++i)
            //           {
            //             connections[i].sendUTF(materialScriptsMessage);
            //           }
            //         }
            //     }
            // }
            if(msg.topic === '~/link' ){
                  if(msg.msg){
                  const modelName = msg.name;
                  const modelId = msg.id;
                  const linkName = msg.link.name;
                  const linkId = msg.link.id;
                  if(!(modelName ==='' || linkName==='')){
                    const shortLinkName = linkName.split('::')
                      gazebo.publish('gazebo.msgs.Link', '~/link', {name: modelName, id:modelId, link: {name:shortLinkName[shortLinkName.length], id:linkId, kinematic:msg.link.kinematic ,
                        self_collide:msg.link.self_collide, gravity:msg.link.gravity}});
                  }
                }
            }
        }
        else
        {
          if(msg.service){
              if(msg.service.name === '~/heightmap_data')
              {
                  gazebo.publish('gazebo.msgs.Request', '~/request', {id:value, request:'heightmap_data'});
              }
              else if(msg.service.name === '~/roads')
              {
                  var serviceMsg = "{\"op\":\"publish\",\"topic\":\"" + "~/material" + "\", \"msg\":";
                  serviceMsg += msg;
                  serviceMsg += "}";
                  send(serviceMsg);
              }
          }
      }
   }
}

exports.pubToServer = pubToServer;
exports.sendToInterface = sendToInterface;
