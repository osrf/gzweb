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

GZ3D.Scene.prototype.loadURI = function(uri, parent)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, parent);
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

GZ3D.Scene.prototype.loadCollada = function(uri, parent)
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
    //init();
    //animate();
  } );
//  return dae;
};
