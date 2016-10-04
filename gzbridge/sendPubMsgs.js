// msg to be sent to gzweb
var out = {};
var strMsg;

// The nanoSec is not currently used in calculations.
var lastStatsTime =  { sec: 0, nsec: 0 };
var lastPausedState = true;
var wallTime = { sec: 0, nsec: 0 };
var paused = false;
const ProtoBuf = require("protobufjs");
const random = require("random-js")(); // uses the nativeMath engine
var value = random.integer(1, 1000);

var requestIds = {};
var roadMsgs = [];

const msgLocator = require('./msgLocator.js')

function sendToInterface (gazebo, send, filter) {
  gazebo.subscribe('gazebo.msgs.Visual', '~/visual', function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/visual" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Joint', "~/joint", function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/joint" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Model', "~/model/info", function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/model/info" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Request', "~/request", function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/request" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Link', "~/link", function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/link" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Scene', "~/scene", function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/scene" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Physics', "~/physics", function(e, d){
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/physics" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Sensor', "~/sensor", function(e, d){
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/sensor" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Light', "~/factory/light", function(e, d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/factory/light" +
        "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Light', "~/light/modify", function(e,d) {
      out = "{\"op\":\"publish\",\"topic\":\"" + "~/light/modify" +
          "\", \"msg\":";
      out += d;
      out += "}";
      send(out);
  },{'toJson':false});
  gazebo.subscribe('gazebo.msgs.Road', "~/roads", function(e,d) {
    out = "{\"op\":\"publish\",\"topic\":\"" + "~/roads" + "\", \"msg\":";
    out += d;
    out += "}";
    send(out);
    roadMsgs.push(d);
  },{'latch': true});
  gazebo.subscribe('gazebo.msgs.PosesStamped', "~/pose/info", function(e,d) {
    const filtered =  filter.addPosesStamped(d)
    if (filtered.length!==0){
      for (var j = 0; j < filtered.length; j++) {
        strMsg = JSON.stringify(filtered[j]);
        out = "{\"op\":\"publish\",\"topic\":\"" + "~/pose/info" +
            "\", \"msg\":";
        out += strMsg;
        out += "}";
        send(out);
      }
    }
  },{'latch':true});
  gazebo.subscribe('gazebo.msgs.WorldStatistics', "~/world_stats",
      function(e,d) {
    wallTime = d.real_time;
    paused = d.paused;
    if ((wallTime.sec - lastStatsTime.sec) >= 1 || lastPausedState != paused ||
        wallTime < lastStatsTime) {
      lastStatsTime = wallTime;
      lastPausedState = paused;
      strMsg = JSON.stringify(d);
      out = "{\"op\":\"publish\",\"topic\":\"" + "~/world_stats" +
          "\", \"msg\":";
      out += strMsg;
      out += "}";
      send(out);
    }
  });
  gazebo.subscribe('gazebo.msgs.Response', "~/response", function(e, jsonmsg) {
    var serialized = JSON.stringify(jsonmsg.serialized_data);
    if (jsonmsg.request ===  'physics_info' && jsonmsg.response !== 'error') {
      const phyBuilder =
          ProtoBuf.loadProtoFile(msgLocator.getProtoPath('physics'));
      strMsg = JSON.stringify(
          phyBuilder.build('gazebo.msgs.Physics').decode64(serialized));
      out = "{\"op\":\"publish\",\"topic\":\"" + "~/physics" + "\", \"msg\":";
      out += strMsg;
      out += "}";
    }
    else if(jsonmsg.request === 'scene_info' && jsonmsg.response !== 'error') {
      const sceneBuilder =
        ProtoBuf.loadProtoFile(msgLocator.getProtoPath('scene'));
      strMsg = JSON.stringify(
        sceneBuilder.build('gazebo.msgs.Scene').decode64(serialized));
      out = "{\"op\":\"publish\",\"topic\":\"" + "~/scene" + "\", \"msg\":";
      out += strMsg;
      out += "}";
    }
    else if (jsonmsg.request === 'heightmap_data' &&
        jsonmsg.response !== 'error' &&
        jsonmsg.type === 'gazebo.msgs.Geometry') {
      const heightmapBuilder =
          ProtoBuf.loadProtoFile(msgLocator.getProtoPath('geometry'));
      strMsg = JSON.stringify(
          heightmapBuilder.build('gazebo.msgs.Geometry').
          decode64(serialized));
      var id = requestIds[jsonmsg.id];
      out = "{\"op\":\"service_response\",\"id\":\"" + id + "\", \"values\":";
      out += strMsg;
      out += "}";
      delete requestIds[jsonmsg.id];
    }
    send(out);
  });
}

function pubToServer (gazebo, msg, send) {
  if (msg.op === 'advertise' || (!msg.topic && !msg.service))
    return;

  // Start Processing the messages.
  // The traffic on the world_control  topic is too little
  if (msg.topic === '~/world_control' ) {
    if (msg.msg.pause != undefined) {
      if (msg.msg.pause === true) {
        gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control",
          {pause:true});
      }
      else {
        gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control",
          {pause:false});
      }
    }
    if (msg.msg.reset) {
      if (msg.msg.reset === 'model') {
        gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control",
            {reset:{all: true, time_only:false, model_only:true}});
      }
      else if (msg.msg.reset === 'world') {
        gazebo.publish("gazebo.msgs.WorldControl",  "~/world_control",
            {reset:{all:true}});
        lastStatsTime =  { sec: 0, nsec: 0 };
      }
    }
  }
  if (msg.topic === '~/model/modify') {
    if (msg.op==='publish'){
      if (msg.msg) {
        gazebo.publish("gazebo.msgs.Model",  "~/model/modify",
            {name: msg.msg.name, id: msg.msg.id,
            pose:{position:msg.msg.position, orientation:msg.msg.orientation}});
      }
    }
  }
  if (msg.topic === '~/scene' ) {
    gazebo.publish("gazebo.msgs.Request",  "~/request",
        {id: value, request: 'scene_info'});
  }
  if (msg.topic === '~/physics' ) {
    gazebo.publish("gazebo.msgs.Request",  "~/request",
        {id: value, request: 'physics_info', data: ''});
  }
  if (msg.topic === '~/entity_delete') {
    if (msg.op === 'publish'){
        gazebo.deleteEntity(msg.msg.name);
    }
  }
  if (msg.topic === '~/factory') {
    if (msg.msg) {
      const type = msg.msg.type;
      if (type === "box" || type === "sphere" || type === "cylinder") {
        gazebo.spawn(type, msg.msg.name, msg.msg.position.x,
            msg.msg.position.y, msg.msg.position.z,
            msg.msg.orientation.x, msg.msg.orientation.y,
            msg.msg.orientation.z);
      }
      else {
        gazebo.spawn('model://'+ type, msg.msg.name, msg.msg.position.x,
            msg.msg.position.y, msg.msg.position.z,
            msg.msg.orientation.x, msg.msg.orientation.y,
            msg.msg.orientation.z);
      }
     }
  }
  if (msg.topic === '~/material') {
    var material = "{\"op\":\"publish\",\"topic\":\"" + "~/material" +
        "\", \"msg\":";
    var matArray = gazebo.sim.materials();
    if (matArray.length > 0) {
      var matStr = JSON.stringify(matArray[0]);
      matStr = matStr.replace(new RegExp('\\\\"', 'g'), '\"');
      matStr = matStr.substring(1, matStr.length-1)
      material += matStr;
    }
    else {
      material += "{}"
    }
    material += "}";
    send(material);
  }
  // Light msgs processing.
  if (msg.topic === '~/factory/light' || msg.topic === '~/light/modify' ) {
    if (msg.msg && msg.msg.name) {
      const lightType = msg.msg.type;
      const createEntity = msg.msg.createEntity;
      // To make sure of this check
      if (createEntity === 0) {
        var lightMsg = {name: msg.msg.name, pose: msg.msg.pose,
             direction:msg.msg.direction,
        diffuse:msg.msg.diffuse, specular:msg.msg.specular,
        attenuation_constant:msg.msg.attenuation_constant,
        attenuation_linear:msg.msg.attenuation_linear,
        attenuation_quadratic:msg.msg.attenuation_quadratic};
        //time to publish.
        gazebo.publish('gazebo.msgs.Light', '~/light/modify', lightMsg);
      } else {
        if (lightType === 'pointlight') {
          var lightMsg = {name: msg.msg.name,
          pose:{position:msg.msg.position, orientation:msg.msg.orientation},
          type:1, diffuse:{r:0.5,g:0.5,b:0.5, a:1},
          specular:{r:0.1,g:0.1,b:0.1, a:1},
          attenuation_constant: 0.5, attenuation_linear: 0.01,
          attenuation_quadratic:0.001, range: 20};
        }
        else if (lightType === 'spotlight') {
          var lightMsg = {name: msg.msg.name,
          pose:{position:msg.msg.position, orientation:msg.msg.orientation},
          type:2, direction:{x:0,y:0,z:-1},
          diffuse:{r:0.5,g:0.5,b:0.5, a:1},
          specular:{r:0.1,g:0.1,b:0.1, a:1},attenuation_constant: 0.5,
          attenuation_linear: 0.01, attenuation_quadratic:0.001, range: 20};
        }
        else if (lightType === 'directionallight') {
          var lightMsg = {name: msg.msg.name,
          pose:{position:msg.msg.position, orientation:msg.msg.orientation},
          type:3, direction:{x:0,y:0,z:-1},
          diffuse:{r:0.5,g:0.5,b:0.5, a:1},
          specular:{r:0.1,g:0.1,b:0.1, a:1}, attenuation_constant: 0.5,
          attenuation_linear: 0.01, attenuation_quadratic:0.001, range: 20};
        }
        gazebo.publish('gazebo.msgs.Light', '~/factory/light', lightMsg);
      }
    }
  }
  if (msg.topic === '~/link') {
    if (msg.msg) {
      const modelName = msg.name;
      const modelId = msg.id;
      const linkName = msg.link.name;
      const linkId = msg.link.id;
      if (!(modelName ==='' || linkName==='')) {
        const shortLinkName = linkName.split('::')
        gazebo.publish('gazebo.msgs.Link', '~/link',
            {name: modelName, id:modelId,
            link: {name:shortLinkName[shortLinkName.length], id:linkId,
            kinematic:msg.link.kinematic,
            self_collide:msg.link.self_collide, gravity:msg.link.gravity}});
      }
    }
  }
  else {
    if (msg.service) {
      if (msg.service === '~/heightmap_data') {
        const requestId = random.integer(1, 1000);
        gazebo.publish('gazebo.msgs.Request', '~/request',
            {id:requestId, request:'heightmap_data'});
        requestIds[requestId] = msg.id;
      }
      else if(msg.service === '~/roads') {
        if (roadMsgs.length > 0) {
          const roadBuilder =
              ProtoBuf.loadProtoFile(msgLocator.getProtoPath('road'));
          strMsg = JSON.stringify(
              roadBuilder.build('gazebo.msgs.Road').
              decode64(roadMsgs[0]));
          out = "{\"op\":\"service_response\",\"id\":\"";
          out += msg.id + "\", \"values\":";
          out += strMsg;
          out += "}";
          send(out);
        }
      }
    }
  }
}

exports.pubToServer = pubToServer;
exports.sendToInterface = sendToInterface;
