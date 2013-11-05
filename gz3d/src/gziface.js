//var GAZEBO_MODEL_DATABASE_URI='http://gazebosim.org/models';

GZ3D.GZIface = function(scene, gui)
{
  this.scene = scene;
  this.gui = gui;
  this.init();
  this.visualsToAdd = [];
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
    if (message.name)
    {
      this.scene.name = message.name;
    }

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
    if (!this.scene.getByName(message.name))
    {
      var modelObj = this.createModelFromMsg(message);
      if (modelObj)
      {
        this.scene.add(modelObj);
      }

      // visuals may arrive out of order (before the model msg),
      // add the visual in if we find its parent here
      var len = this.visualsToAdd.length;
      var i = 0;
      var j = 0;
      while (i < len)
      {
        var parent = this.visualsToAdd[j].parent_name;
        if (parent.indexOf(modelObj.name) >=0)
        {
          this.createVisualFromMsg(this.visualsToAdd[j]);
          this.visualsToAdd.splice(j, 1);
        }
        else
        {
          j++;
        }
        i++;
      }
    }
  };

  modelInfoTopic.subscribe(modelUpdate.bind(this));

  // Visual messages - currently just used for collision visuals
  var visualTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/visual',
    messageType : 'visual',
  });

  var visualUpdate = function(message)
  {
    if (!this.scene.getByName(message.name))
    {
      // accept only collision visual msgs for now
      if (message.name.indexOf('COLLISION_VISUAL') < 0)
      {
        return;
      }

      // delay the add if parent not found, this array will checked in
      // modelUpdate function
      if (message.parent_name && !this.scene.getByName(message.parent_name))
      {
        this.visualsToAdd.push(message);
      }
      else
      {
        this.createVisualFromMsg(message);
      }
    }
  };

  visualTopic.subscribe(visualUpdate.bind(this));

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
    if (!this.scene.getByName(message.name))
    {
      var lightObj = this.createLightFromMsg(message);
      this.scene.add(lightObj);
    }
  };

  lightTopic.subscribe(ligthtUpdate.bind(this));


  // heightmap
  this.heightmapDataService = new ROSLIB.Service({
    ros : this.webSocket,
    name : '~/heightmap_data',
    serviceType : 'heightmap_data'
  });

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
      var visualObj = this.createVisualFromMsg(visual);
      if (visualObj && !visualObj.parent)
      {
        linkObj.add(visualObj);
      }
      /*if (visual.geometry)
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
        for (var c = 0; c < visualObj.children.length; ++c)
        {
          if (visual.cast_shadows)
          {
            visualObj.children[c].castShadow = visual.cast_shadows;
          }
          else
          {
            visualObj.children[c].castShadow = true;
          }
          visualObj.children[c].receiveShadow = true;
        }
        linkObj.add(visualObj);
      }*/
    }
    for (var l = 0; l < link.collision.length; ++l)
    {
      var collision = link.collision[l];
      for (var m = 0; m < link.collision[l].visual.length; ++m)
      {
        var collisionVisual = link.collision[l].visual[m];
        var collisionVisualObj = this.createVisualFromMsg(collisionVisual);
        if (collisionVisualObj && !collisionVisualObj.parent)
        {
          linkObj.add(collisionVisualObj);
        }
      }
    }
  }
  return modelObj;
};

GZ3D.GZIface.prototype.createVisualFromMsg = function(visual)
{
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
    for (var c = 0; c < visualObj.children.length; ++c)
    {
      visualObj.children[c].castShadow = true;
      visualObj.children[c].receiveShadow = true;

      if (visual.cast_shadows)
      {
        visualObj.children[c].castShadow = visual.cast_shadows;
      }
      if (visual.receive_shadows)
      {
        visualObj.children[c].receiveShadow = visual.receive_shadows;
      }

      if (visual.name.indexOf('COLLISION_VISUAL') >= 0)
      {
        visualObj.children[c].castShadow = false;
        visualObj.children[c].receiveShadow = false;

        visualObj.children[c].visible = this.scene.showCollisions;
      }
    }
    if (visual.parent_name)
    {
      var parent = this.scene.getByName(visual.parent_name);
      if (parent)
      {
        parent.add(visualObj);
      }
    }
    return visualObj;
  }
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
    lightObj.shadowMapWidth = 4094;
    lightObj.shadowMapHeight = 4094;
    lightObj.shadowCameraVisible = false;
    lightObj.shadowCameraBottom = -100;
    lightObj.shadowCameraLeft = -100;
    lightObj.shadowCameraRight = 100;
    lightObj.shadowCameraTop = 100;
    lightObj.shadowBias = 0.0001;

    lightObj.position.set(negDir.x, negDir.y, negDir.z);
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);
  }
  lightObj.intensity = light.attenuation_constant;
  lightObj.castShadow = light.cast_shadows;
  lightObj.shadowDarkness = 0.3;
  lightObj.name = light.name;

  return lightObj;
};


GZ3D.GZIface.prototype.parseUri = function(uri)
{
  var uriPath = 'assets';
  return uriPath + '/' + uri.substring(uri.indexOf('://') + 3);
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
  else if (geom.heightmap)
  {
    var that = this;
    var request = new ROSLIB.ServiceRequest({
      name : that.scene.name
    });

    // redirect the texture paths to the assets dir
    var textures = geom.heightmap.texture;
    for ( var k = 0; k < textures.length; ++k)
    {
      textures[k].diffuse = this.parseUri(textures[k].diffuse);
      textures[k].normal = this.parseUri(textures[k].normal);
    }

    var sizes = geom.heightmap.size;

    // send service request and load heightmap on response
    this.heightmapDataService.callService(request,
        function(result)
        {
          var heightmap = result.heightmap;
          // gazebo heightmap is always square shaped,
          // and a dimension of: 2^N + 1
          that.scene.loadHeightmap(heightmap.heights, heightmap.size.x,
              heightmap.size.y, heightmap.width, heightmap.height,
              heightmap.origin, textures,
              geom.heightmap.blend, parent);
            //console.log('Result for service call on ' + result);
        });

    //this.scene.loadHeightmap(parent)
  }

  // texture mapping for simple shapes and planes only,
  // not used by mesh and terrain
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
      var opacity = mat['opacity'];
      if (opacity)
      {
        if (opacity < 1)
        {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      }

      //this.scene.setMaterial(obj, texture, normalMap);

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
