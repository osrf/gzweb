var GZ3D = GZ3D || {
  REVISION : '1'
};


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

    var uriPath = 'assets';

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

        var texture;
        if (material)
        {
          var script  = material.script;
          if (script)
          {
            if (script.name)
            {
              var textureName = this.material[script.name];
              if (textureName)
              {
                textureName =
                    textureName.substring(0, textureName.lastIndexOf('.') + 1)
                    + 'png';
                texture = uriPath + '/' +
                    modelName.substring(0, modelName.lastIndexOf('/'))
                    + '/' + textureName;
              }
            }
          }
        }

        this.scene.loadURI(uriPath + '/' + modelName, parent, texture);
      }
    }
  }

  if (obj)
  {
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

  this.selectedEntity = null;
  this.mouseEntity = null;

  // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
/*  var geometry = new THREE.CylinderGeometry( 0, 1, 3, 4, 1 );
  var material =  new THREE.MeshLambertMaterial(
      { color:0xffffff, shading: THREE.FlatShading } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = 0;
  mesh.position.y = 0;
  mesh.position.z = 0;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;
  this.scene.add( mesh );*/

  this.renderer = new THREE.WebGLRenderer({antialias: false });
  this.renderer.setClearColor(0xcccccc, 1);
  this.renderer.setSize( window.innerWidth, window.innerHeight);

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
  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.modelManipulator = new THREE.TransformControls(this.camera,
      this.getDomElement());

  this.controls = new THREE.TrackballControls(this.camera);
  this.controls.rotateSpeed = 1.0;
  this.controls.zoomSpeed = 1.2;
  this.controls.panSpeed = 0.8;
  this.controls.noZoom = false;
  this.controls.noPan = false;
  this.controls.staticMoving = true;
  this.controls.dynamicDampingFactor = 0.3;
  this.controls.keys = [ 65, 83, 68 ];

//  this.controls.addEventListener('change', function() {that.render();});
//  this.modelManipulator.addEventListener('change', function() {that.render();});

  this.emitter = new EventEmitter2({ verbose: true });

  this.iface = new GZ3D.GZIface(this);
};

GZ3D.Scene.prototype.onMouseDown = function(event)
{
  event.preventDefault();

  var projector = new THREE.Projector();
  var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
  projector.unprojectVector( vector, this.camera );
  var ray = new THREE.Raycaster( this.camera.position,
      vector.sub(this.camera.position).normalize() );

  var allObjects = [];
  this.scene.getDescendants(allObjects);
  var objects = ray.intersectObjects(allObjects);

  // grab root model
  if (objects.length > 0)
  {
    {
      var model;
      for (var i = 0; i < objects.length; ++i)
      {
        model = objects[i].object;

        if (objects[i].object.name === 'grid')
        {
          this.killCameraControl = false;
          return;
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
          break;
        }
      }

      if (model)
      {
        console.log('found model ' + model.name + ' ' + objects.length);
    //    if (this.modelManipulator.hovered)
        if (model.name !== '')
        {
          console.log('attached');
          this.modelManipulator.attach(model);
          this.selectedEntity = model;
          this.mouseEntity = this.selectedEntity;
          this.scene.add(this.modelManipulator.gizmo);
          this.killCameraControl = true;
        }
        else if (this.modelManipulator.hovered)
        {
          console.log('hovered ' + this.modelManipulator.object.name);
          this.modelManipulator.update();
          this.modelManipulator.object.updateMatrixWorld();
  //        this.modelManipulator.attach(this.modelManipulator.object);
          this.mouseEntity = this.selectedEntity;
          //this.selectedEntity = model;
          this.killCameraControl = true;
        }
        else
        {
          this.killCameraControl = false;
        }
      }
      else
      {
        console.log('detached');
        this.modelManipulator.detach();
        this.scene.remove(this.modelManipulator.gizmo);
        this.killCameraControl = false;
        this.selectedEntity = null;
      }
    }
  }
/*  else
  {
    console.log('detached - no object');
    this.modelManipulator.detach();
    this.scene.remove(this.modelManipulator.gizmo);
    this.killCameraControl = false;
    this.selectedEntity = null;
  }*/
};


GZ3D.Scene.prototype.onMouseUp = function(event)
{
  event.preventDefault();

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

GZ3D.Scene.prototype.getDomElement = function()
{
  return this.renderer.domElement;
};


GZ3D.Scene.prototype.render = function()
{
  if (!this.killCameraControl)
  {
    this.controls.update();
  }
  this.modelManipulator.update();

  this.renderer.render(this.scene, this.camera);
};

GZ3D.Scene.prototype.setWindowSize = function(width, height)
{
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize( width, height);
  this.controls.handleResize();
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
  grid.rotation.x = Math.PI * 0.5;
  this.scene.add(grid);
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
  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
};

GZ3D.Scene.prototype.loadURI = function(uri, parent, material)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, parent, material);
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

GZ3D.Scene.prototype.loadCollada = function(uri, parent, material)
{
  var dae;
  var loader = new THREE.ColladaLoader();
//  var loader = new ColladaLoader2();
//  loader.options.convertUpAxis = true;
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
    parent.add(dae);

    if (material)
    {
      var texture = new THREE.MeshBasicMaterial(
          {map: THREE.ImageUtils.loadTexture(material)});
      dae.children[0].material = texture;
    }
    //init();
    //animate();
  } );
//  return dae;
};
