var GZ3D = GZ3D || {
  REVISION : '1'
};


/*global $:false */

var guiEvents = new EventEmitter2({ verbose: true });

$(function() {
  $( '#toolbar-shapes' ).buttonset();
  $( '#toolbar-manipulate' ).buttonset();

  $( '#arrow' ).button({
    text: false,
    icons: {
      primary: 'toolbar-arrow'
    }
  })
  .click(function() {
    guiEvents.emit('manipulation_mode', 'view');
  });

  $( '#translate' ).button({
    text: false,
    icons: {
      primary: 'toolbar-translate'
    }
  })
  .click(function() {
    guiEvents.emit('manipulation_mode', 'translate');
  });

  $( '#box' ).button({
    text: false,
    icons: {
      primary: 'toolbar-box'
    }
  })
  .click(function() {
    guiEvents.emit('entity_create', 'box');
  });

  $( '#sphere' ).button({
    text: false,
    icons: {
      primary: 'toolbar-sphere'
    }
  })
  .click(function() {
    guiEvents.emit('entity_create', 'sphere');
  });

  $( '#cylinder' ).button({
    text: false,
    icons: {
      primary: 'toolbar-cylinder'
    }
  })
  .click(function() {
    guiEvents.emit('entity_create', 'cylinder');
  });

  $( '#play' ).button({
    text: false,
    icons: {
      primary: 'ui-icon-play'
    }
  })
  .click(function() {
    var options;
    if ( $( this ).text() === 'Play' )
    {
      guiEvents.emit('pause', false);
    } else
    {
      guiEvents.emit('pause', true);
    }
  });
});

  $(function() {
    $( '#menu' ).menu();
    $( '#reset-model' )
    .click(function() {
      guiEvents.emit('model_reset');
    });
    $( '#reset-world' )
    .click(function() {
      guiEvents.emit('world_reset');
    });
  });

GZ3D.Gui = function(scene)
{
  this.scene = scene;
  this.domElement = scene.getDomElement();
  this.init();
  this.emitter = new EventEmitter2({ verbose: true });
};

GZ3D.Gui.prototype.init = function()
{
  this.spawnModel = new GZ3D.SpawnModel(
      this.scene, this.scene.getDomElement());

  var that = this;
  guiEvents.on('entity_create',
      function (entity)
      {
        that.spawnModel.start(entity,
            function(obj)
            {
              that.emitter.emit('entityCreated', obj, entity);
            });
      }
  );

  guiEvents.on('world_reset',
      function ()
      {
        that.emitter.emit('reset', 'world');
      }
  );

  guiEvents.on('model_reset',
      function ()
      {
        that.emitter.emit('reset', 'model');
      }
  );

  guiEvents.on('pause',
      function (paused)
      {
        that.emitter.emit('pause', paused);
      }
  );

  guiEvents.on('manipulation_mode',
      function (mode)
      {
        that.scene.setManipulationMode(mode);
      }
  );
};

GZ3D.Gui.prototype.setPaused = function(paused)
{
  var options;
  if (paused)
  {
    options =
    {
      label: 'Play',
      icons: { primary: 'ui-icon-play' }
    };
  }
  else
  {
    options =
    {
      label: 'Pause',
      icons: { primary: 'ui-icon-pause' }
    };
  }
  $('#play').button('option', options);
};

GZ3D.Gui.prototype.setRealTime = function(realTime)
{
  $('#real-time-value').text(realTime);
};

GZ3D.Gui.prototype.setSimTime = function(simTime)
{
  $('#sim-time-value').text(simTime);
 // console.log(simTime);
};

//var GAZEBO_MODEL_DATABASE_URI='http://gazebosim.org/models';

GZ3D.GZIface = function(scene, gui)
{
  this.scene = scene;
  this.gui = gui;
  this.init();
};

GZ3D.GZIface.prototype.init = function()
{
  this.material = [];

  // Set up initial scene
  this.webSocket = new ROSLIB.Ros({
    url : 'ws://' + location.hostname + ':7681'
  });

  this.heartbeatTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/heartbeat',
    messageType : 'heartbeat',
  });

  var that = this;
  var publishHeartbeat = function()
  {
    var hearbeatMsg =
    {
      alive : 1
    };
    that.heartbeatTopic.publish(hearbeatMsg);
  };

  setInterval(publishHeartbeat, 5000);

  var materialTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/material',
    messageType : 'material',
  });

  var materialUpdate = function(message)
  {
    this.material = message;
  };
  materialTopic.subscribe(materialUpdate.bind(this));

  this.sceneTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/scene',
    messageType : 'scene',
  });

  var sceneUpdate = function(message)
  {
    if (message.grid === true)
    {
      this.scene.createGrid();
    }

    for (var i = 0; i < message.light.length; ++i)
    {
      var light = message.light[i];
      var lightObj = this.createLightFromMsg(light);
      this.scene.add(lightObj);
    }

    for (var j = 0; j < message.model.length; ++j)
    {
      var model = message.model[j];
      var modelObj = this.createModelFromMsg(model);
      this.scene.add(modelObj);
    }

    this.sceneTopic.unsubscribe();
  };
  this.sceneTopic.subscribe(sceneUpdate.bind(this));


  // Update model pose
  var poseTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/pose/info',
    messageType : 'pose',
  });

  var poseUpdate = function(message)
  {
    var entity = this.scene.getByName(message.name);
    if (entity)
    {
      this.scene.updatePose(entity, message.position, message.orientation);
    }
  };

  poseTopic.subscribe(poseUpdate.bind(this));

  // Requests - for deleting models
  var requestTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/request',
    messageType : 'request',
  });

  var requestUpdate = function(message)
  {
    if (message.request === 'entity_delete')
    {
      var entity = this.scene.getByName(message.data);
      if (entity)
      {
        this.scene.remove(entity);
      }
    }
  };

  requestTopic.subscribe(requestUpdate.bind(this));

  // Model info messages - currently used for spawning new models
  var modelInfoTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/model/info',
    messageType : 'model',
  });

  var modelUpdate = function(message)
  {
    var modelObj = this.createModelFromMsg(message);
    this.scene.add(modelObj);
  };

  modelInfoTopic.subscribe(modelUpdate.bind(this));

  // world stats
  var worldStatsTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/world_stats',
    messageType : 'world_stats',
  });

  var worldStatsUpdate = function(message)
  {
    this.updateStatsGuiFromMsg(message);
  };

  worldStatsTopic.subscribe(worldStatsUpdate.bind(this));

  // Lights
  var lightTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/light',
    messageType : 'light',
  });

  var ligthtUpdate = function(message)
  {
    var lightObj = this.createLightFromMsg(message);
    this.scene.add(lightObj);
  };

  lightTopic.subscribe(ligthtUpdate.bind(this));

  // Model modify messages - for modifying model pose
  this.modelModifyTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/model/modify',
    messageType : 'model',
  });

  var publishModelModify = function(model)
  {
    var matrix = model.matrixWorld;
    var translation = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, quaternion, scale);

    var modelMsg =
    {
      name : model.name,
      id : model.userData,
      position :
      {
        x : translation.x,
        y : translation.y,
        z : translation.z
      },
      orientation :
      {
        w: quaternion.w,
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z
      }
    };
    that.modelModifyTopic.publish(modelMsg);
  };

  this.scene.emitter.on('poseChanged', publishModelModify);

  // Factory messages - for spawning new models
  this.factoryTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/factory',
    messageType : 'factory',
  });

  var publishFactory = function(model, type)
  {
    var matrix = model.matrixWorld;
    var translation = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, quaternion, scale);
    var modelMsg =
    {
      name : model.name,
      type : type,
      position :
      {
        x : translation.x,
        y : translation.y,
        z : translation.z
      },
      orientation :
      {
        w: quaternion.w,
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z
      }
    };
    that.factoryTopic.publish(modelMsg);
  };

  // World control messages - for resetting world/models
  this.worldControlTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/world_control',
    messageType : 'world_control',
  });

  var publishWorldControl = function(state, resetType)
  {
    var worldControlMsg = {};
    if (state !== null)
    {
      worldControlMsg.pause = state;
    }
    if (resetType)
    {
      worldControlMsg.reset = resetType;
    }
    that.worldControlTopic.publish(worldControlMsg);
  };

  this.scene.emitter.on('poseChanged', publishModelModify);

  this.gui.emitter.on('entityCreated', publishFactory);

  this.gui.emitter.on('reset',
      function(resetType)
      {
        publishWorldControl(null, resetType);
      }
  );

  this.gui.emitter.on('pause',
      function(paused)
      {
        publishWorldControl(paused, null);
      }
  );
};

GZ3D.GZIface.prototype.updateStatsGuiFromMsg = function(stats)
{
  this.gui.setPaused(stats.paused);

  var simSec = stats.sim_time.sec;
  var simNSec = stats.sim_time.nsec;

  var simDay = Math.floor(simSec / 86400);
  simSec -= simDay * 86400;

  var simHour = Math.floor(simSec / 3600);
  simSec -= simHour * 3600;

  var simMin = Math.floor(simSec / 60);
  simSec -= simMin * 60;

  var simMsec = Math.floor(simNSec * 1e-6);

  var realSec = stats.real_time.sec;
  var realNSec = stats.real_time.nsec;

  var realDay = Math.floor(realSec / 86400);
  realSec -= realDay * 86400;

  var realHour = Math.floor(realSec / 3600);
  realSec -= realHour * 3600;

  var realMin = Math.floor(realSec / 60);
  realSec -= realMin * 60;

  var realMsec = Math.floor(realNSec * 1e-6);

  var simTimeValue = '';
  var realTimeValue = '';

  if (realDay < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realDay.toFixed(0) + ' ';
  if (realHour < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realHour.toFixed(0) + ':';
  if (realMin < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realMin.toFixed(0)  + ':';
  if (realSec < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realSec.toFixed(0);

  if (simDay < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simDay.toFixed(0)  + ' ';
  if (simHour < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simHour.toFixed(0) + ':';
  if (simMin < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simMin.toFixed(0) + ':';
  if (simSec < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simSec.toFixed(0);

  this.gui.setRealTime(realTimeValue);
  this.gui.setSimTime(simTimeValue);
};

GZ3D.GZIface.prototype.createModelFromMsg = function(model)
{
  var modelObj = new THREE.Object3D();
  modelObj.name = model.name;
  modelObj.userData = model.id;
  if (model.pose)
  {
    this.scene.setPose(modelObj, model.pose.position, model.pose.orientation);
  }
  for (var j = 0; j < model.link.length; ++j)
  {
    var link = model.link[j];
    var linkObj = new THREE.Object3D();
    linkObj.name = link.name;
    linkObj.userData = link.id;

    if (link.pose)
    {
      this.scene.setPose(linkObj, link.pose.position,
          link.pose.orientation);
    }
    modelObj.add(linkObj);
    for (var k = 0; k < link.visual.length; ++k)
    {
      var visual = link.visual[k];
      if (visual.geometry)
      {
        var geom = visual.geometry;
        var visualObj = new THREE.Object3D();
        visualObj.name = visual.name;
        if (visual.pose)
        {
          this.scene.setPose(visualObj, visual.pose.position,
              visual.pose.orientation);
        }
        this.createGeom(geom, visual.material, visualObj);
        if (visualObj.children.length > 0)
        {
          visualObj.children[0].castShadow = visual.cast_shadows || true;
          visualObj.children[0].receiveShadow = true;
        }
        linkObj.add(visualObj);
      }
    }
  }
  return modelObj;
};

GZ3D.GZIface.prototype.createLightFromMsg = function(light)
{
  var lightObj;

  var color = new THREE.Color();
  color.r = light.diffuse.r;
  color.g = light.diffuse.g;
  color.b = light.diffuse.b;

  if (light.type === 1)
  {
    lightObj = new THREE.AmbientLight(color.getHex());
    lightObj.distance = light.range;
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);
  }
  if (light.type === 2)
  {
    lightObj = new THREE.SpotLight(color.getHex());
    lightObj.distance = light.range;
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);
  }
  else if (light.type === 3)
  {
    lightObj = new THREE.DirectionalLight(color.getHex());
    var dir = new THREE.Vector3(light.direction.x, light.direction.y,
        light.direction.z);
    var target = dir;
    var negDir = dir.negate();
    negDir.normalize();
    var factor = 10;
    light.pose.position.x += factor * negDir.x;
    light.pose.position.y += factor * negDir.y;
    light.pose.position.z += factor * negDir.z;

    target.x -= light.pose.position.x;
    target.y -= light.pose.position.y;
    target.z -= light.pose.position.z;

    lightObj.target.position = target;
    lightObj.shadowCameraNear = 1;
    lightObj.shadowCameraFar = 50;
    lightObj.shadowMapWidth = 2048;
    lightObj.shadowMapHeight = 2048;
    lightObj.shadowCameraVisible = false;
    lightObj.shadowCameraBottom = -100;
    lightObj.shadowCameraLeft = -100;
    lightObj.shadowCameraRight = 100;
    lightObj.shadowCameraTop = 100;
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);
  }
  lightObj.intensity = light.attenuation_constant;
  lightObj.castShadow = light.cast_shadows;
  lightObj.shadowDarkness = 0.5;
  lightObj.name = light.name;

  return lightObj;
};

GZ3D.GZIface.prototype.createGeom = function(geom, material, parent)
{
  var obj;

  var uriPath = 'assets';
  var texture;
  var normalMap;
  var textureUri;
  var mat;
  if (material)
  {
    // get texture from material script
    var script  = material.script;
    if (script)
    {
      if (script.uri.length > 0)
      {
        if (script.name)
        {
          mat = this.material[script.name];
          if (mat)
          {
            var textureName = mat['texture'];
            if (textureName)
            {
              for (var i = 0; i < script.uri.length; ++i)
              {
                var type = script.uri[i].substring(0,
                      script.uri[i].indexOf('://'));

                if (type === 'model')
                {
                  if (script.uri[i].indexOf('textures') > 0)
                  {
                    textureUri = script.uri[i].substring(
                        script.uri[i].indexOf('://') + 3);
                    break;
                  }
                }
                else if (type === 'file')
                {
                  if (script.uri[i].indexOf('materials') > 0)
                  {
                    textureUri = script.uri[i].substring(
                        script.uri[i].indexOf('://') + 3,
                        script.uri[i].indexOf('materials') + 9) + '/textures';
                    break;
                  }
                }
              }
              if (textureUri)
              {
                texture = uriPath + '/' +
                    textureUri  + '/' + textureName;
              }
            }
          }
        }
      }
    }
    // normal map
    if (material.normal_map)
    {
      var mapUri;
      if (material.normal_map.indexOf('://') > 0)
      {
        mapUri = material.normal_map.substring(
            material.normal_map.indexOf('://') + 3,
            material.normal_map.lastIndexOf('/'));
      }
      else
      {
        mapUri = textureUri;
      }
      if (mapUri)
      {
        var startIndex = material.normal_map.lastIndexOf('/') + 1;
        if (startIndex < 0)
        {
          startIndex = 0;
        }
        var normalMapName = material.normal_map.substr(startIndex,
            material.normal_map.lastIndexOf('.') - startIndex);
        normalMap = uriPath + '/' +
          mapUri  + '/' + normalMapName + '.png';
      }

    }
  }

  if (geom.box)
  {
    obj = this.scene.createBox(geom.box.size.x, geom.box.size.y,
        geom.box.size.z);
  }
  else if (geom.cylinder)
  {
    obj = this.scene.createCylinder(geom.cylinder.radius,
        geom.cylinder.length);
  }
  else if (geom.sphere)
  {
    obj = this.scene.createSphere(geom.sphere.radius);
  }
  else if (geom.plane)
  {
    obj = this.scene.createPlane(geom.plane.normal.x, geom.plane.normal.y,
        geom.plane.normal.z, geom.plane.size.x, geom.plane.size.y);
  }
  else if (geom.mesh)
  {
    // get model name which the mesh is in
    var rootModel = parent;
    while (rootModel.parent)
    {
      rootModel = rootModel.parent;
    }

    /*// find model from database, download the mesh if it exists
    var manifestXML;
    var manifestURI = GAZEBO_MODEL_DATABASE_URI + '/manifest.xml';
    var request = new XMLHttpRequest();
    request.open('GET', manifestURI, false);
    request.onreadystatechange = function(){
      if (request.readyState === 4)
      {
        if (request.status === 200 || request.status === 0)
        {
            manifestXML = request.responseXML;
        }
      }
    };
    request.send();

    var uriPath;
    var modelAvailable = false;
    var modelsElem = manifestXML.getElementsByTagName('models')[0];
    var i;
    for (i = 0; i < modelsElem.getElementsByTagName('uri').length; ++i)
    {
      var uri = modelsElem.getElementsByTagName('uri')[i];
      var model = uri.substring(uri.indexOf('://') + 3);
      if (model === rootModel)
      {
        modelAvailable = true;
      }
    }

    if (modelAvailable)*/
    {
      var meshUri = geom.mesh.filename;
      var submesh = geom.mesh.submesh;
      var centerSubmesh = geom.mesh.center_submesh;

      console.log(geom.mesh.filename + ' ' + submesh);

      var uriType = meshUri.substring(0, meshUri.indexOf('://'));
      if (uriType === 'file' || uriType === 'model')
      {
        var modelName = meshUri.substring(meshUri.indexOf('://') + 3);
        if (geom.mesh.scale)
        {
          parent.scale.x = geom.mesh.scale.x;
          parent.scale.y = geom.mesh.scale.y;
          parent.scale.z = geom.mesh.scale.z;
        }

        this.scene.loadMesh(uriPath + '/' + modelName, submesh, centerSubmesh,
            texture, normalMap, parent);
      }
    }
  }

  if (obj)
  {
    if (mat)
    {
      obj.material = new THREE.MeshPhongMaterial();

      var ambient = mat['ambient'];
      if (ambient)
      {
        obj.material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
      }
      var diffuse = mat['diffuse'];
      if (diffuse)
      {
        obj.material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
      }
      var specular = mat['specular'];
      if (specular)
      {
        obj.material.specular.setRGB(specular[0], specular[1], specular[2]);
      }

      if (texture)
      {
        obj.material.map = THREE.ImageUtils.loadTexture(texture);
      }
      if (normalMap)
      {
        obj.material.normalMap = THREE.ImageUtils.loadTexture(normalMap);
      }
    }
    obj.updateMatrix();
    parent.add(obj);
  }
};

/*(function(global) {
  "use strict";
  var GZ3D.GZModelDatabase = function() {

    if ( GZ3D.GZModelDatabase.prototype._singletonInstance ) {
      return GZ3D.GZModelDatabase.prototype._singletonInstance;
    }
    GZ3D.GZModelDatabase.prototype._singletonInstance = this;

    this.hasModel = function()
    {

    };
  };

var a = new MySingletonClass();
var b = MySingletonClass();
global.result = a === b;

}(window))*/

GZ3D.Scene = function()
{
  this.init();
};

GZ3D.Scene.prototype.init = function()
{
  this.scene = new THREE.Scene();
  this.scene.name = 'scene';
  this.meshes = {};

  this.selectedEntity = null;
  this.mouseEntity = null;

  this.manipulationMode = 'view';

  this.renderer = new THREE.WebGLRenderer({antialias: true });
  this.renderer.setClearColor(0xcccccc, 1);
  this.renderer.setSize( window.innerWidth, window.innerHeight);
//  this.renderer.shadowMapEnabled = true;
//  this.renderer.shadowMapSoft = true;

  // lights
  var light = new THREE.AmbientLight( 0x222222 );
  this.scene.add(light);

  this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  this.camera.position.x = 0;
  this.camera.position.y = -5;
  this.camera.position.z = 5;
  this.camera.up = new THREE.Vector3(0, 0, 1);
  this.camera.lookAt(0, 0, 0);

  var that = this;
  this.getDomElement().addEventListener( 'mousedown',
      function(event) {that.onMouseDown(event);}, false );

  // Need to use `document` instead of getDomElement in order to get events
  // outside the webgl div element.
  document.addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.getDomElement().addEventListener( 'DOMMouseScroll',
      function(event) {that.onMouseScroll(event);}, false ); //firefox

  this.getDomElement().addEventListener( 'mousewheel',
      function(event) {that.onMouseScroll(event);}, false );

  document.addEventListener( 'keydown',
      function(event) {that.onKeyDown(event);}, false );


  this.modelManipulator = new THREE.TransformControls(this.camera,
      this.getDomElement());

  this.controls = new THREE.OrbitControls(this.camera);

  this.emitter = new EventEmitter2({ verbose: true });
};

GZ3D.Scene.prototype.onMouseDown = function(event)
{
  event.preventDefault();

  this.controls.enabled = true;

  var pos = new THREE.Vector2(event.clientX, event.clientY);

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }

  if (this.manipulationMode === 'view')
  {
    return;
  }

  if (model)
  {
    // console.log('found model ' + model.name + ' ' + objects.length);
    if (model.name !== '')
    {
      // console.log('attached ' + model.name);
      this.modelManipulator.attach(model);
      this.selectedEntity = model;
      this.mouseEntity = this.selectedEntity;
      this.scene.add(this.modelManipulator.gizmo);
      this.killCameraControl = true;
    }
    else if (this.modelManipulator.hovered)
    {
      // console.log('hovered ' + this.modelManipulator.object.name);
      this.modelManipulator.update();
      this.modelManipulator.object.updateMatrixWorld();
      this.mouseEntity = this.selectedEntity;
      this.killCameraControl = true;
    }
    else
    {
      this.killCameraControl = false;
    }
  }
  else
  {
    // console.log('detached');
    this.modelManipulator.detach();
    this.scene.remove(this.modelManipulator.gizmo);
    this.killCameraControl = false;
    this.selectedEntity = null;
  }
};


GZ3D.Scene.prototype.onMouseUp = function(event)
{
  event.preventDefault();

  this.controls.enabled = true;

  if (this.modelManipulator.hovered && this.selectedEntity)
  {
    this.emitter.emit('poseChanged', this.modelManipulator.object);
  }
  else if (this.killCameraControl)
  {
    this.killCameraControl = false;
  }
  this.mouseEntity = null;
};

GZ3D.Scene.prototype.onMouseScroll = function(event)
{
  event.preventDefault();

  this.controls.enabled = true;

  var pos = new THREE.Vector2(event.clientX, event.clientY);

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }
};

GZ3D.Scene.prototype.onKeyDown = function(event)
{
  if (event.shiftKey)
  {
    if (event.keyCode === 187 || event.keyCode === 189)
    {
      this.controls.enabled = true;
      var pos = new THREE.Vector2(window.innerWidth/2.0,
          window.innerHeight/2.0);

      var intersect = new THREE.Vector3();
      var model = this.getRayCastModel(pos, intersect);

      if (intersect)
      {
        this.controls.target = intersect;
      }

      if (event.keyCode === 187)
      {
        this.controls.dollyOut();
      }
      else
      {
        this.controls.dollyIn();
      }
    }
  }
};

GZ3D.Scene.prototype.getRayCastModel = function(pos, intersect)
{
  var projector = new THREE.Projector();
  var vector = new THREE.Vector3(
      ((pos.x - this.renderer.domElement.offsetLeft)
      / window.innerWidth) * 2 - 1,
      -((pos.y - this.renderer.domElement.offsetTop)
      / window.innerHeight) * 2 + 1, 1);
  projector.unprojectVector(vector, this.camera);
  var ray = new THREE.Raycaster( this.camera.position,
      vector.sub(this.camera.position).normalize() );

  var allObjects = [];
  this.scene.getDescendants(allObjects);
  var objects = ray.intersectObjects(allObjects);

  var model;
  var point;
  if (objects.length > 0)
  {
    for (var i = 0; i < objects.length; ++i)
    {
      model = objects[i].object;
      if (!this.modelManipulator.hovered &&
          (objects[i].object.name === 'plane'))
      {
        model = null;
        this.killCameraControl = false;
        point = objects[i].point;
        break;
      }

      if (objects[i].object.name === 'grid')
      {
        model = null;
        continue;
      }

      while (model.parent !== this.scene)
      {
        model = model.parent;
      }

      if (this.modelManipulator.hovered)
      {
        if (model === this.modelManipulator.gizmo)
        {
          break;
        }
      }
      else if (model.name !== '')
      {
        point = objects[i].point;
        break;
      }
    }
  }
  if (point)
  {
    intersect.x = point.x;
    intersect.y = point.y;
    intersect.z = point.z;
  }
  return model;
};


GZ3D.Scene.prototype.getDomElement = function()
{
  return this.renderer.domElement;
};


GZ3D.Scene.prototype.render = function()
{
  if (!this.killCameraControl)
  {
    this.controls.enabled = true;
    this.controls.update();
  }
  else
  {
    this.controls.enabled = false;
  }

  this.modelManipulator.update();

  this.renderer.render(this.scene, this.camera);
};

GZ3D.Scene.prototype.setWindowSize = function(width, height)
{
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize( width, height);
  this.render();
};

GZ3D.Scene.prototype.add = function(model)
{
  this.scene.add(model);
};

GZ3D.Scene.prototype.remove = function(model)
{
  this.scene.remove(model);
};

GZ3D.Scene.prototype.getByName = function(name)
{
  return this.scene.getObjectByName(name, true);
};

GZ3D.Scene.prototype.updatePose = function(model, position, orientation)
{
  if (this.modelManipulator && this.modelManipulator.object &&
      this.modelManipulator.hovered && this.mouseEntity)
  {
    return;
  }

  this.setPose(model, position, orientation);
};

GZ3D.Scene.prototype.setPose = function(model, position, orientation)
{
  model.position.x = position.x;
  model.position.y = position.y;
  model.position.z = position.z;
  model.quaternion.w = orientation.w;
  model.quaternion.x = orientation.x;
  model.quaternion.y = orientation.y;
  model.quaternion.z = orientation.z;
};

GZ3D.Scene.prototype.createGrid = function()
{
  var grid = new THREE.GridHelper(10, 1);
  grid.name = 'grid';
  grid.position.z = 0.05;
  grid.rotation.x = Math.PI * 0.5;
  grid.castShadow = false;
  this.scene.add(grid);
};

GZ3D.Scene.prototype.createPlane = function(normalX, normalY, normalZ,
    width, height)
{
  var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xbbbbbb, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  var normal = new THREE.Vector3(normalX, normalY, normalZ);
  var cross = normal.crossVectors(normal, mesh.up);
  mesh.rotation = normal.applyAxisAngle(cross, -(normal.angleTo(mesh.up)));
  mesh.name = 'plane';
  mesh.receiveShadow = true;
  return mesh;
};

GZ3D.Scene.prototype.createSphere = function(radius)
{
  var geometry = new THREE.SphereGeometry(radius, 32, 32);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
};


GZ3D.Scene.prototype.createCylinder = function(radius, length)
{
  var geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1,
      false);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI * 0.5;
  return mesh;
};

GZ3D.Scene.prototype.createBox = function(width, height, depth)
{
  var geometry = new THREE.CubeGeometry(width, height, depth, 1, 1, 1);

  // Fix UVs so textures are mapped in a way that is consistent to gazebo
  geometry.dynamic = true;
  var faceUVFixA = [1, 4, 5];
  var faceUVFixB = [0];
  for (var i = 0; i < faceUVFixA.length; ++i)
  {
    var idx = faceUVFixA[i];
    var length = geometry.faceVertexUvs[0][idx].length;
    var uva = geometry.faceVertexUvs[0][idx][length-1];
    for (var j = length-2; j >= 0; --j)
    {
      var uvb = geometry.faceVertexUvs[0][idx][j];
      geometry.faceVertexUvs[0][idx][j] = uva;
      uva = uvb;
    }
    geometry.faceVertexUvs[0][idx][length-1] = uva;
  }
  for (var ii = 0; ii < faceUVFixB.length; ++ii)
  {
    var idxB = faceUVFixB[ii];
    var uvc = geometry.faceVertexUvs[0][idxB][0];
    for (var jj = 1; jj < geometry.faceVertexUvs[0][idxB].length; ++jj)
    {
      var uvd = geometry.faceVertexUvs[0][idxB][jj];
      geometry.faceVertexUvs[0][idxB][jj] = uvc;
      uvc = uvd;
    }
    geometry.faceVertexUvs[0][idxB][0] = uvc;
  }
  geometry.uvsNeedUpdate = true;

  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
};

GZ3D.Scene.prototype.loadMesh = function(uri, submesh, centerSubmesh, material,
    normalMap, parent)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, submesh, centerSubmesh, material, normalMap,
        parent);
  }
  else if (uriFile.substr(-5).toLowerCase() === '.urdf')
  {
    var urdfModel = new ROSLIB.UrdfModel({
      string : uri
    });

    // adapted from ros3djs
    var links = urdfModel.links;
    for ( var l in links) {
      var link = links[l];
      if (link.visual && link.visual.geometry) {
        if (link.visual.geometry.type === ROSLIB.URDF_MESH) {
          var frameID = '/' + link.name;
          var filename = link.visual.geometry.filename;
          var meshType = filename.substr(-4).toLowerCase();
          var mesh = filename.substring(filename.indexOf('://') + 3);
          // ignore mesh files which are not in Collada format
          if (meshType === '.dae')
          {
            var dae = this.loadCollada(uriPath + '/' + mesh, parent);
            // check for a scale
            if(link.visual.geometry.scale)
            {
              dae.scale = new THREE.Vector3(
                  link.visual.geometry.scale.x,
                  link.visual.geometry.scale.y,
                  link.visual.geometry.scale.z
              );
            }
          }
        }
      }
    }
  }
};

GZ3D.Scene.prototype.loadCollada = function(uri, submesh, centerSubmesh,
    material, normalMap, parent)
{
  var dae;
  var mesh = null;
  if (this.meshes[uri])
  {
    dae = this.meshes[uri];
    if (submesh)
    {
      mesh = this.prepareColladaMesh(dae, submesh, centerSubmesh);
    }
    else
    {
      mesh = this.prepareColladaMesh(dae, null, null);
    }
    this.setMaterial(mesh, material, normalMap);
  }

  if (!mesh)
  {
    var loader = new THREE.ColladaLoader();
    // var loader = new ColladaLoader2();
    // loader.options.convertUpAxis = true;
    var thatURI = uri;
    var thatSubmesh = submesh;
    var thatCenterSubmesh = centerSubmesh;

    loader.load(uri, function(collada)
    {
      // check for a scale factor
      /*if(collada.dae.asset.unit)
      {
        var scale = collada.dae.asset.unit;
        collada.scene.scale = new THREE.Vector3(scale, scale, scale);
      }*/

      dae = collada.scene;
      dae.updateMatrix();
      this.scene.meshes[thatURI] = dae;
      mesh = this.scene.prepareColladaMesh(dae, thatSubmesh, centerSubmesh);
      this.scene.setMaterial(mesh, material, normalMap);
      parent.add(dae);
    });
  }
  else
  {
    parent.add(dae);
  }
};

GZ3D.Scene.prototype.prepareColladaMesh = function(dae, submesh, centerSubmesh)
{
  var mesh;
  var allChildren = [];
  dae.getDescendants(allChildren);
  for (var i = 0; i < allChildren.length; ++i)
  {
    if (allChildren[i] instanceof THREE.Mesh)
    {
      if (!submesh && !mesh)
      {
        mesh = allChildren[i];
      }

      if (submesh)
      {

        if (allChildren[i].geometry.name === submesh)
        {
          if (centerSubmesh)
          {
            var vertices = allChildren[i].geometry.vertices;
            var vMin = new THREE.Vector3();
            var vMax = new THREE.Vector3();
            vMin.x = vertices[0].x;
            vMin.y = vertices[0].y;
            vMin.z = vertices[0].z;
            vMax.x = vMin.x;
            vMax.y = vMin.y;
            vMax.z = vMin.z;

            for (var j = 1; j < vertices.length; ++j)
            {
              vMin.x = Math.min(vMin.x, vertices[j].x);
              vMin.y = Math.min(vMin.y, vertices[j].y);
              vMin.z = Math.min(vMin.z, vertices[j].z);
              vMax.x = Math.max(vMax.x, vertices[j].x);
              vMax.y = Math.max(vMax.y, vertices[j].y);
              vMax.z = Math.max(vMax.z, vertices[j].z);
            }

            var center  = new THREE.Vector3();
            center.x = vMin.x + (0.5 * (vMax.x - vMin.x));
            center.y = vMin.y + (0.5 * (vMax.y - vMin.y));
            center.z = vMin.z + (0.5 * (vMax.z - vMin.z));

            for (var k = 0; k < vertices.length; ++k)
            {
              vertices[k].x -= center.x;
              vertices[k].y -= center.y;
              vertices[k].z -= center.z;
            }
            allChildren[i].geometry.verticesNeedUpdate = true;

            allChildren[i].position.x = 0;
            allChildren[i].position.y = 0;
            allChildren[i].position.z = 0;

            allChildren[i].parent.position.x = 0;
            allChildren[i].parent.position.y = 0;
            allChildren[i].parent.position.z = 0;
          }
          mesh = allChildren[i];
        }
        else
        {
          allChildren[i].parent.remove(allChildren[i]);
        }
      }
    }
    else if (allChildren[i] instanceof THREE.Light)
    {
      allChildren[i].parent.remove(allChildren[i]);
    }
  }
  return mesh;
};

GZ3D.Scene.prototype.setMaterial = function(mesh, material, normalMap)
{
  if (!mesh)
  {
    return;
  }

  if (material || normalMap)
  {
    var mat = new THREE.MeshPhongMaterial();
    if (material)
    {
      mat.map = THREE.ImageUtils.loadTexture(material);
    }
    if (normalMap)
    {
      mat.normalMap = THREE.ImageUtils.loadTexture(normalMap);
    }
    mesh.material = mat;
  }
};

GZ3D.Scene.prototype.setManipulationMode = function(mode)
{
  this.manipulationMode = mode;

  if (this.manipulationMode === 'view')
  {
    this.killCameraControl = false;
    this.modelManipulator.detach();
    this.scene.remove(this.modelManipulator.gizmo);
  }
};

GZ3D.SpawnModel = function(scene, domElement)
{
  this.scene = scene;
  this.domElement = ( domElement !== undefined ) ? domElement : document;
  this.init();
  this.obj = undefined;
  this.callback = undefined;
  this.counter = new Date();
};

GZ3D.SpawnModel.prototype.init = function()
{
//  this.emitter = new EventEmitter2({ verbose: true });
  this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  this.projector = new THREE.Projector();
//  this.ray = new THREE.Raycaster();
  this.ray = new THREE.Ray();
  this.obj = null;
  this.active = false;
};

GZ3D.SpawnModel.prototype.start = function(entity, callback)
{
  if (this.active)
  {
    this.finish();
  }

  this.callback = callback;

  this.obj = new THREE.Object3D();
  var mesh;
  if (entity === 'box')
  {
    mesh = this.scene.createBox(1, 1, 1);
    this.obj.name = 'unit_box_' + this.counter.getTime();
  }
  else if (entity === 'sphere')
  {
    mesh = this.scene.createSphere(0.5);
    this.obj.name = 'unit_sphere_' + this.counter.getTime();
  }
  else if (entity === 'cylinder')
  {
    mesh = this.scene.createCylinder(0.5, 1.0);
    this.obj.name = 'unit_cylinder_' + this.counter.getTime();
  }

  this.obj.add(mesh);
  this.obj.position.z += 0.5;
  this.scene.add(this.obj);

  var that = this;
  this.domElement.addEventListener( 'mousedown',
      function(event) {that.onMouseUp(event);}, false );
  this.domElement.addEventListener( 'mousemove',
      function(event) {that.onMouseMove(event);}, false );
  document.addEventListener( 'keydown',
      function(event) {that.onKeyDown(event);}, false );

  this.active = true;
};

GZ3D.SpawnModel.prototype.finish = function()
{
  this.active = false;
  var that = this;
  this.domElement.removeEventListener( 'mousedown',
      function(event) {that.onMouseUp(event);}, false );
  this.domElement.removeEventListener( 'mousemove',
      function(event) {that.onMouseMove(event);}, false );
  document.removeEventListener( 'keydown',
      function(event) {that.onKeyDown(event);}, false );

  this.scene.remove(this.obj);
  this.obj = undefined;
};

GZ3D.SpawnModel.prototype.onMouseDown = function(event)
{
  event.preventDefault();
};

GZ3D.SpawnModel.prototype.onMouseMove = function(event)
{
  if (!this.active)
  {
    return;
  }

  event.preventDefault();

  var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
  this.projector.unprojectVector(vector, this.scene.camera);
  this.ray.set(this.scene.camera.position,
      vector.sub(this.scene.camera.position).normalize());
  var point = this.ray.intersectPlane(this.plane);
  point.z = this.obj.position.z;
  this.scene.setPose(this.obj, point, new THREE.Quaternion());
};

GZ3D.SpawnModel.prototype.onMouseUp = function(event)
{
  if (!this.active)
  {
    return;
  }
  this.callback(this.obj);
  this.finish();
};

GZ3D.SpawnModel.prototype.onKeyDown = function(event)
{
  if ( event.keyCode === 27 ) // Esc
  {
    this.finish();
  }
};
