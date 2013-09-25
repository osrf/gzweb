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

  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.getDomElement().addEventListener( 'DOMMouseScroll',
      function(event) {that.onMouseScroll(event);}, false ); //firefox

  this.getDomElement().addEventListener( 'mousewheel',
      function(event) {that.onMouseScroll(event);}, false );


  this.modelManipulator = new THREE.TransformControls(this.camera,
      this.getDomElement());

  this.controls = new THREE.OrbitControls(this.camera);

  this.emitter = new EventEmitter2({ verbose: true });
};

GZ3D.Scene.prototype.onMouseDown = function(event)
{
  event.preventDefault();

  this.controls.enabled = true;



/*  if (event.button !== 0)
  {
    return;
  }

  if (this.manipulationMode === 'view')
  {
    return;
  }*/

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
       console.log('hovered ' + this.modelManipulator.object.name);
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
