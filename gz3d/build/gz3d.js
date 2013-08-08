var GZ3D = GZ3D || {
  REVISION : '1'
};


GZ3D.GZIface = function(scene)
{
  this.scene = scene;
  this.Init();
};

GZ3D.GZIface.prototype.Init = function(scene)
{
  this.webSocket = new ROSLIB.Ros({
    url : 'ws://localhost:7681'
  });

  var sceneTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/scene',
    messageType : '/scene',
  });
    console.log('new topic');


  var SceneUpdate = function(message)
  {
    for (var i = 0; i < message.model.length; ++i)
    {
      var model = message.model[i];

      var modelObj = new THREE.Object3D();
      if (model.pose)
      {
        modelObj.position.x = model.pose.position.x;
        modelObj.position.y = model.pose.position.y;
        modelObj.position.z = model.pose.position.z;
        modelObj.quaternion.w = model.pose.orientation.w;
        modelObj.quaternion.x = model.pose.orientation.x;
        modelObj.quaternion.y = model.pose.orientation.y;
        modelObj.quaternion.z = model.pose.orientation.z;
      }
      for (var j = 0; j < model.link.length; ++j)
      {
        var link = model.link[j];
        var linkObj = new THREE.Object3D();
        if (link.pose)
        {
          linkObj.position.x = link.pose.position.x;
          linkObj.position.y = link.pose.position.y;
          linkObj.position.z = link.pose.position.z;
          linkObj.quaternion.w = link.pose.orientation.w;
          linkObj.quaternion.x = link.pose.orientation.x;
          linkObj.quaternion.y = link.pose.orientation.y;
          linkObj.quaternion.z = link.pose.orientation.z;
        }
        modelObj.add(linkObj);
        for (var k = 0; k < link.visual.length; ++k)
        {
          var visual = link.visual[k];
            console.log ('sdf' + visual.name);
          if (visual.geometry)
          {
            var geom = visual.geometry;
            var visualObj = new THREE.Object3D();
            if (visual.pose)
            {
              visualObj.position.x = visual.pose.position.x;
              visualObj.position.y = visual.pose.position.y;
              visualObj.position.z = visual.pose.position.z;
              visualObj.quaternion.w = visual.pose.orientation.w;
              visualObj.quaternion.x = visual.pose.orientation.x;
              visualObj.quaternion.y = visual.pose.orientation.y;
              visualObj.quaternion.z = visual.pose.orientation.z;
            }
//            mat = findMaterial(material);
            console.log (visual.name);
            this.scene.CreateGeom(geom, visual.material, visualObj);
            linkObj.add(visualObj);

          }
        }
      }
      this.scene.Add(modelObj);
    }




//    visuals['ian'].position.x = message.posX;
//    visuals['ian'].updateMatrix();
  //          setInterval(onReceiveMessage,0.1);
  };

  sceneTopic.subscribe(SceneUpdate.bind(this));

/*
  var updateTopic2 = new ROSLIB.Topic({
    ros : webSocket,
    name : '/topic2',
    messageType : '/msg',
  });
    //console.log("new topic");

  processUpdate2 = function(message)
  {
    console.log("process update2 " + message.posY);

    visuals['ian'].position.y = message.posY;
    visuals['ian'].updateMatrix();
  //          setInterval(onReceiveMessage,0.1);

  }
  //      updateTopic2.subscribe(processUpdate2.bind());

  var updateTopic3 = new ROSLIB.Topic({
    ros : webSocket,
    name : '/topic3',
    messageType : '/msg',
  });
    //console.log("new topic");

  processUpdate3 = function(message)
  {
    console.log("process update3 " + message.posZ);

    visuals['ian'].position.z = message.posZ;
    visuals['ian'].updateMatrix();
  //          setInterval(onReceiveMessage,0.1);

  }
  //   updateTopic3.subscribe(processUpdate3.bind());*/

};

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
//  this.camera.aspect = window.innerWidth / window.innerHeight;
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

/*  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = z;
  mesh.rotation.x = roll;
  mesh.rotation.y = pitch;
  mesh.rotation.z = yaw;*/
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
