GZ3D.Scene = function()
{
  this.Init();
};


GZ3D.Scene.prototype.Init = function()
{
  this.scene = new THREE.Scene();
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
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  this.scene.add(light);

  light = new THREE.AmbientLight( 0x222222 );
  this.scene.add(light);

  // grid
  var grid = new THREE.GridHelper(10, 1);
  grid.rotation.x = Math.PI * 0.5;
  this.scene.add(grid);

  this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 1, 1000 );
  this.camera.position.x = 0;
  this.camera.position.y = -5;
  this.camera.position.z = 5;
  this.camera.up = new THREE.Vector3(0, 0, 1);
  this.camera.lookAt(0, 0, 0);


  this.controls = new THREE.TrackballControls(this.camera);
  this.controls.rotateSpeed = 1.0;
  this.controls.zoomSpeed = 1.2;
  this.controls.panSpeed = 0.8;
  this.controls.noZoom = false;
  this.controls.noPan = false;
  this.controls.staticMoving = true;
  this.controls.dynamicDampingFactor = 0.3;
  this.controls.keys = [ 65, 83, 68 ];

  this.controls.addEventListener('change', this.Render.call(this));

  this.iface = new GZ3D.GZIface(this);

};

GZ3D.Scene.prototype.GetDomElement = function()
{
  return this.renderer.domElement;
};


GZ3D.Scene.prototype.Render = function()
{
  this.renderer.render(this.scene, this.camera);
  this.controls.update();
};


GZ3D.Scene.prototype.SetWindowSize = function(width, height)
{
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize( width, height);
  this.controls.handleResize();
  this.Render();
};

GZ3D.Scene.prototype.Add = function(model)
{
  this.scene.add(model);
};

GZ3D.Scene.prototype.Remove = function(model)
{
  this.scene.remove(model);
};

GZ3D.Scene.prototype.GetByName = function(name)
{
  return this.scene.getObjectByName(name);
};

GZ3D.Scene.prototype.CreateGeom  = function(geom, material, parent)
{
  var mesh;
  if (geom.box)
  {
    mesh = this.CreateBox(geom.box.size.x, geom.box.size.y, geom.box.size.z);
  }
  if (geom.cylinder)
  {
    mesh = this.CreateCylinder(geom.cylinder.radius, geom.cylinder.length);
  }
  if (geom.sphere)
  {
    mesh = this.CreateSphere(geom.sphere.radius);
  }

  if (mesh)
  {
    mesh.updateMatrix();
    parent.add(mesh);
  }
};

GZ3D.Scene.prototype.CreateSphere = function(radius)
{
  var geometry = new THREE.SphereGeometry(radius, 32, 32);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
};


GZ3D.Scene.prototype.CreateCylinder = function(radius, length)
{
  var geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1,
      false);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI * 0.5;
  return mesh;
};

GZ3D.Scene.prototype.CreateBox = function(width, height, depth)
{
  var geometry = new THREE.CubeGeometry(width, height, depth, 1, 1, 1);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
};
