var GZ3D = GZ3D || {
  REVISION : '1'
};


GZ3D.Scene = function()
{
};


GZ3D.Scene.prototype.Init = function()
{
  var scene = new THREE.Scene();
  // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
  var geometry = new THREE.CylinderGeometry( 0, 1, 3, 4, 1 );
  var material =  new THREE.MeshLambertMaterial(
      { color:0xffffff, shading: THREE.FlatShading } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = 0;
  mesh.position.y = 0;
  mesh.position.z = 0;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;
  scene.add( mesh );

  // lights
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add(light);

  light = new THREE.AmbientLight( 0x222222 );
  scene.add(light);

  // grid
  scene.add(new THREE.GridHelper( 10, 1 ));
};
