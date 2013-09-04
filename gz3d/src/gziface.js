var GAZEBO_MODEL_DATABASE_URI='http://gazebosim.org/models';
// we shouldn't really load anything from local filesystem
//var GAZEBO_MODEL_PATH = '~/.gazebo/models'

GZ3D.GZIface = function(scene)
{
  this.scene = scene;
  this.init();
};

GZ3D.GZIface.prototype.init = function(scene)
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
    // console.log(message.name);
    if (entity)
    {
      // console.log(message.name + 'found');
      this.scene.updatePose(entity, message.position, message.orientation);
//      entity.position = message.position;
//      entity.quaternion = message.orientation;
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
    // console.log('link name ' + linkObj.name);

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
        // TODO  mat = FindMaterial(material);
        this.createGeom(geom, visual.material, visualObj);
        linkObj.add(visualObj);
      }
    }
  }
  return modelObj;
};

GZ3D.GZIface.prototype.createLightFromMsg = function(light)
{
  var lightObj;
  var color = 'rgb(' + light.diffuse.r*255 + ',' + light.diffuse.g*255 + ',' +
      light.diffuse.b*255 + ')';
  if (light.type === 1)
  {
    lightObj = new THREE.PointLight(color);
    lightObj.distance = light.range;
  }
  if (light.type === 2)
  {
    lightObj = new THREE.SpotLight(color);
    lightObj.distance = light.range;
  }
  else if (light.type === 3)
  {
    lightObj = new THREE.DirectionalLight(color);
  }

//  lightObj.intensity = light.attenuation_constant;
  lightObj.castShadow = light.cast_shadows;

  if (light.pose)
  {
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);

  }
  lightObj.name = light.name;

  return lightObj;
};

GZ3D.GZIface.prototype.createGeom = function(geom, material, parent)
{
  var obj;

  var uriPath = 'assets';
  var texture;
  if (material)
  {
    var script  = material.script;
    if (script)
    {
      if (script.uri.length > 0)
      {
        if (script.name)
        {
          var textureName = this.material[script.name];
          if (textureName)
          {
            var textureUri;
            for (var i = 0; i < script.uri.length; ++i)
            {
              if (script.uri[i].indexOf('textures') > 0)
              {
                textureUri = script.uri[i].substring(
                    script.uri[i].indexOf('://') + 3);
                break;
              }
            }
            if (textureUri)
            {
              textureName =
                  textureName.substring(0, textureName.lastIndexOf('.') + 1)
                  + 'png';
              texture = uriPath + '/' +
                  textureUri  + '/' + textureName;
            }
          }
        }
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

      console.log(geom.mesh.filename);

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

        this.scene.loadURI(uriPath + '/' + modelName, parent, texture);
      }
    }
  }

  if (obj)
  {
    if (texture)
    {
      obj.material = new THREE.MeshPhongMaterial(
         {map: THREE.ImageUtils.loadTexture(texture)});
    }

    obj.updateMatrix();
    parent.add(obj);
  }
};
