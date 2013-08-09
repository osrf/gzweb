GZ3D.GZIface = function(scene)
{
  this.scene = scene;
  this.Init();
};

GZ3D.GZIface.prototype.Init = function(scene)
{
  // Set up initial scene
  this.webSocket = new ROSLIB.Ros({
    url : 'ws://localhost:7681'
  });

  var sceneTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/scene',
    messageType : 'scene',
  });

  var SceneUpdate = function(message)
  {
    if (message.grid === true)
    {
      this.scene.CreateGrid();
    }

    for (var i = 0; i < message.light.length; ++i)
    {
      var light = message.light[i];
      var lightObj = this.CreateLightFromMsg(light);
      this.scene.Add(lightObj);
    }

    for (var j = 0; j < message.model.length; ++j)
    {
      var model = message.model[j];
      var modelObj = this.CreateModelFromMsg(model);
      this.scene.Add(modelObj);
    }
  };
  sceneTopic.subscribe(SceneUpdate.bind(this));


  // Update model pose
  var poseTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/pose/info',
    messageType : 'pose',
  });

  var PoseUpdate = function(message)
  {
    var entity = this.scene.GetByName(message.name);
    if (entity)
    {
      entity.position = message.position;
      entity.quaternion = message.orientation;
    }
  };

  poseTopic.subscribe(PoseUpdate.bind(this));

  // Requests - for deleting models
  var requestTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/request',
    messageType : 'request',
  });

  var RequestUpdate = function(message)
  {
    if (message.request === 'entity_delete')
    {
      var entity = this.scene.GetByName(message.data);
      if (entity)
      {
        this.scene.Remove(entity);
      }
    }
  };

  requestTopic.subscribe(RequestUpdate.bind(this));

  // Model info messages - currently used for spawning new models
  var modelInfoTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/model/info',
    messageType : 'model',
  });

  var ModelUpdate = function(message)
  {
    var modelObj = this.CreateModelFromMsg(message);
    this.scene.Add(modelObj);
  };

  modelInfoTopic.subscribe(ModelUpdate.bind(this));


  // Lights
  var lightTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/light',
    messageType : 'light',
  });

  var LigthtUpdate = function(message)
  {
    var lightObj = this.CreateLightFromMsg(message);
    this.scene.Add(lightObj);
  };

  lightTopic.subscribe(LigthtUpdate.bind(this));
};

GZ3D.GZIface.prototype.CreateModelFromMsg = function(model)
{
  var modelObj = new THREE.Object3D();
  modelObj.name = model.name;
  if (model.pose)
  {
    modelObj.position = model.pose.position;
    modelObj.quaternion = model.pose.orientation;
  }
  for (var j = 0; j < model.link.length; ++j)
  {
    var link = model.link[j];
    var linkObj = new THREE.Object3D();
    linkObj.name = link.name;
    if (link.pose)
    {
      linkObj.position = link.pose.position;
      linkObj.quaternion = link.pose.orientation;
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
          visualObj.position = visual.pose.position;
          visualObj.quaternion = visual.pose.orientation;
        }
        // TODO  mat = FindMaterial(material);
        this.scene.CreateGeom(geom, visual.material, visualObj);
        linkObj.add(visualObj);
      }
    }
  }
  return modelObj;
};




GZ3D.GZIface.prototype.CreateLightFromMsg = function(light)
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

  lightObj.intensity = light.attenuation_constant;
  lightObj.castShadow = light.cast_shadows;

  if (light.pose)
  {
    lightObj.position = light.pose.position;
    lightObj.quaternion = light.pose.orientation;
  }
  lightObj.name = light.name;

  return lightObj;
};
