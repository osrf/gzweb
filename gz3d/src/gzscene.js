/**
 * The scene is where everything is placed, from objects, to lights and cameras.
 * @constructor
 */
GZ3D.Scene = function()
{
  this.init();
};

/**
 * Initialize scene
 */
GZ3D.Scene.prototype.init = function()
{
  this.name = 'default';
  this.scene = new THREE.Scene();
  // this.scene.name = this.name;
  this.meshes = {};

  // only support one heightmap for now.
  this.heightmap = null;

  this.selectedEntity = null;

  this.manipulationMode = 'view';
  this.pointerOnMenu = false;

  this.renderer = new THREE.WebGLRenderer({antialias: true });
  this.renderer.setClearColor(0xb2b2b2, 1); // Sky
  this.renderer.setSize( window.innerWidth, window.innerHeight);
  // this.renderer.shadowMapEnabled = true;
  // this.renderer.shadowMapSoft = true;

  // lights
  this.ambient = new THREE.AmbientLight( 0x666666 );
  this.scene.add(this.ambient);

  // camera
  this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  this.defaultCameraPosition = new THREE.Vector3(0, -5, 5);
  this.resetView();

  this.showCollisions = false;

  this.spawnModel = new GZ3D.SpawnModel(
      this, this.getDomElement());
  // Material for simple shapes being spawned (grey transparent)
  this.spawnedShapeMaterial = new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  this.spawnedShapeMaterial.transparent = true;
  this.spawnedShapeMaterial.opacity = 0.5;

  var that = this;

  // Need to use `document` instead of getDomElement in order to get events
  // outside the webgl div element.
  document.addEventListener( 'mouseup',
      function(event) {that.onPointerUp(event);}, false );

  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onPointerUp(event);}, false );

  this.getDomElement().addEventListener( 'DOMMouseScroll',
      function(event) {that.onMouseScroll(event);}, false ); //firefox

  this.getDomElement().addEventListener( 'mousewheel',
      function(event) {that.onMouseScroll(event);}, false );

  document.addEventListener( 'keydown',
      function(event) {that.onKeyDown(event);}, false );

  this.getDomElement().addEventListener( 'mousedown',
      function(event) {that.onPointerDown(event);}, false );
  this.getDomElement().addEventListener( 'touchstart',
      function(event) {that.onPointerDown(event);}, false );

  this.getDomElement().addEventListener( 'touchend',
      function(event) {that.onPointerUp(event);}, false );

  // Handles for translating and rotating objects
  this.modelManipulator = new GZ3D.Manipulator(this.camera, isTouchDevice,
      this.getDomElement());

  this.timeDown = null;

  this.controls = new THREE.OrbitControls(this.camera);
  this.scene.add(this.controls.targetIndicator);

  this.emitter = new EventEmitter2({ verbose: true });

  // SSAO
  this.effectsEnabled = false;
  // depth
  var depthShader = THREE.ShaderLib[ 'depthRGBA'];
  var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

  this.depthMaterial = new THREE.ShaderMaterial( {
      fragmentShader: depthShader.fragmentShader,
      vertexShader: depthShader.vertexShader,
      uniforms: depthUniforms } );
  this.depthMaterial.blending = THREE.NoBlending;

  // postprocessing
  this.composer = new THREE.EffectComposer(this.renderer );
  this.composer.addPass( new THREE.RenderPass(this.scene,this.camera));

  this.depthTarget = new THREE.WebGLRenderTarget( window.innerWidth,
      window.innerHeight, { minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );

  var effect = new THREE.ShaderPass( THREE.SSAOShader );
  effect.uniforms[ 'tDepth' ].value = this.depthTarget;
  effect.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
  effect.uniforms[ 'cameraNear' ].value = this.camera.near;
  effect.uniforms[ 'cameraFar' ].value = this.camera.far;
  effect.renderToScreen = true;
  this.composer.addPass( effect );

  // Radial menu (only triggered by touch)
  this.radialMenu = new GZ3D.RadialMenu(this.getDomElement());
  this.scene.add(this.radialMenu.menu);

  // Bounding Box
  var vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),

    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ];
  var boxGeometry = new THREE.Geometry();
  boxGeometry.vertices.push(
    vertices[0], vertices[1],
    vertices[1], vertices[2],
    vertices[2], vertices[3],
    vertices[3], vertices[0],

    vertices[4], vertices[5],
    vertices[5], vertices[6],
    vertices[6], vertices[7],
    vertices[7], vertices[4],

    vertices[0], vertices[4],
    vertices[1], vertices[5],
    vertices[2], vertices[6],
    vertices[3], vertices[7]
  );
  this.boundingBox = new THREE.Line(boxGeometry,
      new THREE.LineBasicMaterial({color: 0xffffff}),
      THREE.LinePieces);
  this.boundingBox.visible = false;
};

GZ3D.Scene.prototype.initScene = function()
{
  this.createGrid();

  // create a sun light
  var obj = this.createLight(3, new THREE.Color(0.8, 0.8, 0.8), 0.9,
       {position: {x:0, y:0, z:10}, orientation: {x:0, y:0, z:0, w:1}},
       null, true, 'sun', {x: 0.5, y: 0.1, z: -0.9});

  this.add(obj);
};

GZ3D.Scene.prototype.setSDFParser = function(sdfParser)
{
  this.spawnModel.sdfParser = sdfParser;
};

/**
 * Window event callback
 * @param {} event - mousedown or touchdown events
 */
GZ3D.Scene.prototype.onPointerDown = function(event)
{
  event.preventDefault();

  if (this.spawnModel.active)
  {
    return;
  }

  var mainPointer = true;
  var pos;
  if (event.touches)
  {
    if (event.touches.length === 1)
    {
      pos = new THREE.Vector2(
          event.touches[0].clientX, event.touches[0].clientY);
    }
    else if (event.touches.length === 2)
    {
      pos = new THREE.Vector2(
          (event.touches[0].clientX + event.touches[1].clientX)/2,
          (event.touches[0].clientY + event.touches[1].clientY)/2);
    }
    else
    {
      return;
    }
  }
  else
  {
    pos = new THREE.Vector2(
          event.clientX, event.clientY);
    if (event.which !== 1)
    {
      mainPointer = false;
    }
  }

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }

  // Cancel in case of multitouch
  if (event.touches && event.touches.length !== 1)
  {
    return;
  }

  // Manipulation modes
  // Model found
  if (model)
  {
    // Do nothing to the floor plane
    if (model.name === 'plane')
    {
      this.timeDown = new Date().getTime();
    }
    else if (this.modelManipulator.pickerNames.indexOf(model.name) >= 0)
    {
      // Do not attach manipulator to itself
    }
    // Attach manipulator to model
    else if (model.name !== '')
    {
      if (mainPointer && model.parent === this.scene)
      {
        this.selectEntity(model);
      }
    }
    // Manipulator pickers, for mouse
    else if (this.modelManipulator.hovered)
    {
      this.modelManipulator.update();
      this.modelManipulator.object.updateMatrixWorld();
    }
    // Sky
    else
    {
      this.timeDown = new Date().getTime();
    }
  }
  // Plane from below, for example
  else
  {
    this.timeDown = new Date().getTime();
  }
};

/**
 * Window event callback
 * @param {} event - mouseup or touchend events
 */
GZ3D.Scene.prototype.onPointerUp = function(event)
{
  event.preventDefault();

  // Clicks (<150ms) outside any models trigger view mode
  var millisecs = new Date().getTime();
  if (millisecs - this.timeDown < 150)
  {
    this.setManipulationMode('view');
    $( '#view-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  this.timeDown = null;
};

/**
 * Window event callback
 * @param {} event - mousescroll event
 */
GZ3D.Scene.prototype.onMouseScroll = function(event)
{
  event.preventDefault();

  var pos = new THREE.Vector2(event.clientX, event.clientY);

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }
};

/**
 * Window event callback
 * @param {} event - keydown events
 */
GZ3D.Scene.prototype.onKeyDown = function(event)
{
  if (event.shiftKey)
  {
    // + and - for zooming
    if (event.keyCode === 187 || event.keyCode === 189)
    {
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

  // F2 for turning on effects
  if (event.keyCode === 113)
  {
    this.effectsEnabled = !this.effectsEnabled;
  }

  // Esc/R/T for changing manipulation modes
  if (event.keyCode === 27) // Esc
  {
    this.setManipulationMode('view');
    $( '#view-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  if (event.keyCode === 82) // R
  {
    this.setManipulationMode('rotate');
    $( '#rotate-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  if (event.keyCode === 84) // T
  {
    this.setManipulationMode('translate');
    $( '#translate-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
};

/**
 * Check if there's a model immediately under canvas coordinate 'pos'
 * @param {THREE.Vector2} pos - Canvas coordinates
 * @param {THREE.Vector3} intersect - Empty at input,
 * contains point of intersection in 3D world coordinates at output
 * @returns {THREE.Object3D} model - Intercepted model closest to the camera
 */
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
    modelsloop:
    for (var i = 0; i < objects.length; ++i)
    {
      model = objects[i].object;
      if (model.name.indexOf('_lightHelper') >= 0)
      {
        model = model.parent;
        break;
      }

      if (!this.modelManipulator.hovered &&
          (model.name === 'plane'))
      {
        // model = null;
        point = objects[i].point;
        break;
      }

      if (model.name === 'grid' || model.name === 'boundingBox')
      {
        point = objects[i].point;
        model = null;
        continue;
      }

      while (model.parent !== this.scene)
      {
        // Select current mode's handle
        if (model.parent.parent === this.modelManipulator.gizmo &&
            ((this.manipulationMode === 'translate' &&
              model.name.indexOf('T') >=0) ||
             (this.manipulationMode === 'rotate' &&
               model.name.indexOf('R') >=0)))
        {
          break modelsloop;
        }
        model = model.parent;
      }

      if (model === this.radialMenu.menu)
      {
        continue;
      }

      if (model.name.indexOf('COLLISION_VISUAL') >= 0)
      {
        model = null;
        continue;
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

/**
 * Get dom element
 * @returns {domElement}
 */
GZ3D.Scene.prototype.getDomElement = function()
{
  return this.renderer.domElement;
};

/**
 * Render scene
 */
GZ3D.Scene.prototype.render = function()
{
  // Kill camera control when:
  // -manipulating
  // -using radial menu
  // -pointer over menus
  // -spawning
  if (this.modelManipulator.hovered ||
      this.radialMenu.showing ||
      this.pointerOnMenu ||
      this.spawnModel.active)
  {
    this.controls.enabled = false;
    this.controls.update();
  }
  else
  {
    this.controls.enabled = true;
    this.controls.update();
  }

  this.modelManipulator.update();
  this.radialMenu.update();

  if (this.effectsEnabled)
  {
    this.scene.overrideMaterial = this.depthMaterial;
    this.renderer.render(this.scene, this.camera, this.depthTarget);
    this.scene.overrideMaterial = null;
    this.composer.render();
  }
  else
  {
    this.renderer.render(this.scene, this.camera);
  }
};

/**
 * Set window size
 * @param {double} width
 * @param {double} height
 */
GZ3D.Scene.prototype.setWindowSize = function(width, height)
{
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize( width, height);
  this.render();
};

/**
 * Add object to the scene
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.add = function(model)
{
  model.viewAs = 'normal';
  this.scene.add(model);
};

/**
 * Remove object from the scene
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.remove = function(model)
{
  this.scene.remove(model);
};

/**
 * Returns the object which has the given name
 * @param {string} name
 * @returns {THREE.Object3D} model
 */
GZ3D.Scene.prototype.getByName = function(name)
{
  return this.scene.getObjectByName(name, true);
};

/**
 * Update a model's pose
 * @param {THREE.Object3D} model
 * @param {} position
 * @param {} orientation
 */
GZ3D.Scene.prototype.updatePose = function(model, position, orientation)
{
  if (this.modelManipulator && this.modelManipulator.object &&
      this.modelManipulator.hovered)
  {
    return;
  }

  this.setPose(model, position, orientation);
};

/**
 * Set a model's pose
 * @param {THREE.Object3D} model
 * @param {} position
 * @param {} orientation
 */
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

/**
 * Create grid and add it to the scene
 */
GZ3D.Scene.prototype.createGrid = function()
{
  var grid = new THREE.GridHelper(10, 1);
  grid.name = 'grid';
  grid.position.z = 0.05;
  grid.rotation.x = Math.PI * 0.5;
  grid.castShadow = false;
  // Color1: Central cross, Color2: grid
  // 0xCCCCCC = 80%,80%,80% / 0x4D4D4D = 30%,30%,30%
  grid.setColors(new THREE.Color( 0xCCCCCC ),new THREE.Color( 0x4D4D4D ));
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  this.scene.add(grid);
};

/**
 * Create plane
 * @param {double} normalX
 * @param {double} normalY
 * @param {double} normalZ
 * @param {double} width
 * @param {double} height
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createPlane = function(normalX, normalY, normalZ,
    width, height)
{
  var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  var material =  new THREE.MeshPhongMaterial(
      {color:0xbbbbbb, shading: THREE.SmoothShading} ); // Later Gazebo/Grey
  var mesh = new THREE.Mesh(geometry, material);
  var normal = new THREE.Vector3(normalX, normalY, normalZ);
  var cross = normal.crossVectors(normal, mesh.up);
  mesh.rotation = normal.applyAxisAngle(cross, -(normal.angleTo(mesh.up)));
  mesh.name = 'plane';
  mesh.receiveShadow = true;
  return mesh;
};

/**
 * Create sphere
 * @param {double} radius
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createSphere = function(radius)
{
  var geometry = new THREE.SphereGeometry(radius, 32, 32);
  var mesh = new THREE.Mesh(geometry, this.spawnedShapeMaterial);
  return mesh;
};

/**
 * Create cylinder
 * @param {double} radius
 * @param {double} length
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createCylinder = function(radius, length)
{
  var geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1,
      false);
  var mesh = new THREE.Mesh(geometry, this.spawnedShapeMaterial);
  mesh.rotation.x = Math.PI * 0.5;
  return mesh;
};

/**
 * Create box
 * @param {double} width
 * @param {double} height
 * @param {double} depth
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createBox = function(width, height, depth)
{
  var geometry = new THREE.CubeGeometry(width, height, depth, 1, 1, 1);

  // Fix UVs so textures are mapped in a way that is consistent to gazebo
  // Some face uvs need to be rotated clockwise, while others anticlockwise
  // After updating to threejs rev 62, geometries changed from quads (6 faces)
  // to triangles (12 faces).
  geometry.dynamic = true;
  var faceUVFixA = [1, 4, 5];
  var faceUVFixB = [0];
  for (var i = 0; i < faceUVFixA.length; ++i)
  {
    var idx = faceUVFixA[i]*2;
    var uva = geometry.faceVertexUvs[0][idx][0];
    geometry.faceVertexUvs[0][idx][0] = geometry.faceVertexUvs[0][idx][1];
    geometry.faceVertexUvs[0][idx][1] = geometry.faceVertexUvs[0][idx+1][1];
    geometry.faceVertexUvs[0][idx][2] = uva;

    geometry.faceVertexUvs[0][idx+1][0] = geometry.faceVertexUvs[0][idx+1][1];
    geometry.faceVertexUvs[0][idx+1][1] = geometry.faceVertexUvs[0][idx+1][2];
    geometry.faceVertexUvs[0][idx+1][2] = geometry.faceVertexUvs[0][idx][2];
  }
  for (var ii = 0; ii < faceUVFixB.length; ++ii)
  {
    var idxB = faceUVFixB[ii]*2;
    var uvc = geometry.faceVertexUvs[0][idxB][0];
    geometry.faceVertexUvs[0][idxB][0] = geometry.faceVertexUvs[0][idxB][2];
    geometry.faceVertexUvs[0][idxB][1] = uvc;
    geometry.faceVertexUvs[0][idxB][2] =  geometry.faceVertexUvs[0][idxB+1][1];

    geometry.faceVertexUvs[0][idxB+1][2] = geometry.faceVertexUvs[0][idxB][2];
    geometry.faceVertexUvs[0][idxB+1][1] = geometry.faceVertexUvs[0][idxB+1][0];
    geometry.faceVertexUvs[0][idxB+1][0] = geometry.faceVertexUvs[0][idxB][1];
  }
  geometry.uvsNeedUpdate = true;

  var mesh = new THREE.Mesh(geometry, this.spawnedShapeMaterial);
  mesh.castShadow = true;
  return mesh;
};

/**
 * Create light
 * @param {} type - 1: point, 2: spot, 3: directional
 * @param {} color
 * @param {} intensity
 * @param {} pose
 * @param {} distance
 * @param {} cast_shadows
 * @param {} name
 * @param {} direction
 * @returns {THREE.Object3D}
 */
GZ3D.Scene.prototype.createLight = function(type, color, intensity, pose,
    distance, cast_shadows, name, direction)
{
  var obj = new THREE.Object3D();

  if (typeof(color) === 'undefined')
  {
    color = 0xffffff;
  }
  else if (typeof(color) !== THREE.Color)
  {
    var Color = new THREE.Color();
    Color.r = color.r;
    Color.g = color.g;
    Color.b = color.b;
    color = Color;
  }

  var matrixWorld;

  if (pose)
  {
    var quaternion = new THREE.Quaternion(
        pose.orientation.x,
        pose.orientation.y,
        pose.orientation.z,
        pose.orientation.w);

    var translation = new THREE.Vector3(
        pose.position.x,
        pose.position.y,
        pose.position.z);

    matrixWorld = new THREE.Matrix4();
    matrixWorld.compose(translation, quaternion, new THREE.Vector3(1,1,1));

    this.setPose(obj, pose.position, pose.orientation);
    obj.matrixWorldNeedsUpdate = true;
  }

  var elements;
  if (type === 1)
  {
    elements = this.createPointLight(obj, color, intensity,
        distance, cast_shadows);
  }
  else if (type === 2)
  {
    elements = this.createSpotLight(obj, color, intensity,
        distance, cast_shadows);
  }
  else if (type === 3)
  {
    elements = this.createDirectionalLight(obj, color, intensity,
        cast_shadows);
  }

  var lightObj = elements[0];
  var helper = elements[1];

  if (name)
  {
    lightObj.name = name;
    obj.name = name;
    helper.name = name + '_lightHelper';
  }

  if (direction)
  {
    var dir = new THREE.Vector3(direction.x, direction.y,
        direction.z);

    obj.direction = new THREE.Vector3();
    obj.direction.copy(dir);

    dir.applyMatrix4(matrixWorld); // localToWorld
    lightObj.target.position.copy(dir);
  }

  obj.add(lightObj);
  obj.add(helper);
  return obj;
};

/**
 * Create point light - called by createLight
 * @param {} obj - light object
 * @param {} color
 * @param {} intensity
 * @param {} distance
 * @param {} cast_shadows
 * @returns {[THREE.Light, THREE.Mesh]}
 */
GZ3D.Scene.prototype.createPointLight = function(obj, color, intensity,
    distance, cast_shadows)
{
  if (typeof(intensity) === 'undefined')
  {
    intensity = 0.5;
  }

  var lightObj = new THREE.PointLight(color, intensity);
  lightObj.shadowDarkness = 0.3;

  if (distance)
  {
    lightObj.distance = distance;
  }
  if (cast_shadows)
  {
    lightObj.castShadow = cast_shadows;
  }

  var helperGeometry = new THREE.OctahedronGeometry(0.25, 0);
  helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
  var helperMaterial = new THREE.MeshBasicMaterial(
        {wireframe: true, color: 0x00ff00});
  var helper = new THREE.Mesh(helperGeometry, helperMaterial);

  return [lightObj, helper];
};

/**
 * Create spot light - called by createLight
 * @param {} obj - light object
 * @param {} color
 * @param {} intensity
 * @param {} distance
 * @param {} cast_shadows
 * @returns {[THREE.Light, THREE.Mesh]}
 */
GZ3D.Scene.prototype.createSpotLight = function(obj, color, intensity,
    distance, cast_shadows)
{
  if (typeof(intensity) === 'undefined')
  {
    intensity = 1;
  }
  if (typeof(distance) === 'undefined')
  {
    distance = 20;
  }

  var lightObj = new THREE.SpotLight(color, intensity);
  lightObj.distance = distance;
  lightObj.position.set(0,0,0);
  lightObj.shadowDarkness = 0.3;

  if (cast_shadows)
  {
    lightObj.castShadow = cast_shadows;
  }

  var helperGeometry = new THREE.CylinderGeometry(0, 0.3, 0.2, 4, 1, true);
  helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
  helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
  var helperMaterial = new THREE.MeshBasicMaterial(
        {wireframe: true, color: 0x00ff00});
  var helper = new THREE.Mesh(helperGeometry, helperMaterial);

  return [lightObj, helper];

};

/**
 * Create directional light - called by createLight
 * @param {} obj - light object
 * @param {} color
 * @param {} intensity
 * @param {} cast_shadows
 * @returns {[THREE.Light, THREE.Mesh]}
 */
GZ3D.Scene.prototype.createDirectionalLight = function(obj, color, intensity,
    cast_shadows)
{
  if (typeof(intensity) === 'undefined')
  {
    intensity = 1;
  }

  var lightObj = new THREE.DirectionalLight(color, intensity);
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
  lightObj.position.set(0,0,0);
  lightObj.shadowDarkness = 0.3;

  if (cast_shadows)
  {
    lightObj.castShadow = cast_shadows;
  }

  var helperGeometry = new THREE.Geometry();
  helperGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(   0,    0, 0));
  helperGeometry.vertices.push(new THREE.Vector3(   0,    0, -0.5));
  var helperMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
  var helper = new THREE.Line(helperGeometry, helperMaterial,
      THREE.LinePieces);

  return [lightObj, helper];
};

/**
 * Create roads
 * @param {} points
 * @param {} width
 * @param {} texture
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createRoads = function(points, width, texture)
{
  var geometry = new THREE.Geometry();
  geometry.dynamic = true;
  var texCoord = 0.0;
  var texMaxLen = width;
  var factor = 1.0;
  var curLen = 0.0;
  var tangent = new THREE.Vector3(0,0,0);
  var pA;
  var pB;
  var prevPt = new THREE.Vector3(0,0,0);
  var prevTexCoord;
  var texCoords = [];
  var j = 0;
  for (var i = 0; i < points.length; ++i)
  {
    var pt0 =  new THREE.Vector3(points[i].x, points[i].y,
        points[i].z);
    var pt1;
    if (i !== points.length - 1)
    {
      pt1 =  new THREE.Vector3(points[i+1].x, points[i+1].y,
          points[i+1].z);
    }
    factor = 1.0;
    if (i > 0)
    {
      curLen += pt0.distanceTo(prevPt);
    }
    texCoord = curLen/texMaxLen;
    if (i === 0)
    {
      tangent.x = pt1.x;
      tangent.y = pt1.y;
      tangent.z = pt1.z;
      tangent.sub(pt0);
      tangent.normalize();
    }
    else if (i === points.length - 1)
    {
      tangent.x = pt0.x;
      tangent.y = pt0.y;
      tangent.z = pt0.z;
      tangent.sub(prevPt);
      tangent.normalize();
    }
    else
    {
      var v0 = new THREE.Vector3(0,0,0);
      var v1 = new THREE.Vector3(0,0,0);
      v0.x = pt0.x;
      v0.y = pt0.y;
      v0.z = pt0.z;
      v0.sub(prevPt);
      v0.normalize();

      v1.x = pt1.x;
      v1.y = pt1.y;
      v1.z = pt1.z;
      v1.sub(pt0);
      v1.normalize();

      var dot = v0.dot(v1*-1);

      tangent.x = pt1.x;
      tangent.y = pt1.y;
      tangent.z = pt1.z;
      tangent.sub(prevPt);
      tangent.normalize();

      if (dot > -0.97 && dot < 0.97)
      {
        factor = 1.0 / Math.sin(Math.acos(dot) * 0.5);
      }
    }
    var theta = Math.atan2(tangent.x, -tangent.y);
    pA = new THREE.Vector3(pt0.x,pt0.y,pt0.z);
    pB = new THREE.Vector3(pt0.x,pt0.y,pt0.z);
    var w = (width * factor)*0.5;
    pA.x += Math.cos(theta) * w;
    pA.y += Math.sin(theta) * w;
    pB.x -= Math.cos(theta) * w;
    pB.y -= Math.sin(theta) * w;

    geometry.vertices.push(pA);
    geometry.vertices.push(pB);

    texCoords.push([0, texCoord]);
    texCoords.push([1, texCoord]);

    // draw triangle strips
    if (i > 0)
    {
      geometry.faces.push(new THREE.Face3(j, j+1, j+2,
        new THREE.Vector3(0, 0, 1)));
      geometry.faceVertexUvs[0].push(
          [new THREE.Vector2(texCoords[j][0], texCoords[j][1]),
           new THREE.Vector2(texCoords[j+1][0], texCoords[j+1][1]),
           new THREE.Vector2(texCoords[j+2][0], texCoords[j+2][1])]);
      j++;

      geometry.faces.push(new THREE.Face3(j, j+2, j+1,
        new THREE.Vector3(0, 0, 1)));
      geometry.faceVertexUvs[0].push(
          [new THREE.Vector2(texCoords[j][0], texCoords[j][1]),
           new THREE.Vector2(texCoords[j+2][0], texCoords[j+2][1]),
           new THREE.Vector2(texCoords[j+1][0], texCoords[j+1][1])]);
      j++;

    }

    prevPt.x = pt0.x;
    prevPt.y = pt0.y;
    prevPt.z = pt0.z;

    prevTexCoord = texCoord;
  }

  // geometry.computeTangents();
  geometry.computeFaceNormals();

  geometry.verticesNeedUpdate = true;
  geometry.uvsNeedUpdate = true;


  var material =  new THREE.MeshPhongMaterial();

 /* var ambient = mat['ambient'];
  if (ambient)
  {
    material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
  }
  var diffuse = mat['diffuse'];
  if (diffuse)
  {
    material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
  }
  var specular = mat['specular'];
  if (specular)
  {
    material.specular.setRGB(specular[0], specular[1], specular[2]);
  }*/
  if (texture)
  {
    var tex = THREE.ImageUtils.loadTexture(texture);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    material.map = tex;
  }

  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  return mesh;
};

/**
 * Load heightmap
 * @param {} heights
 * @param {} width
 * @param {} height
 * @param {} segmentWidth
 * @param {} segmentHeight
 * @param {} textures
 * @param {} blends
 * @param {} parent
 */
GZ3D.Scene.prototype.loadHeightmap = function(heights, width, height,
    segmentWidth, segmentHeight, origin, textures, blends, parent)
{
  if (this.heightmap)
  {
    return;
  }
  // unfortunately large heightmaps kills the fps and freeze everything so
  // we have to scale it down
  var scale = 1;
  var maxHeightmapWidth = 256;
  var maxHeightmapHeight = 256;

  if ((segmentWidth-1) > maxHeightmapWidth)
  {
    scale = maxHeightmapWidth / (segmentWidth-1);
  }

  var geometry = new THREE.PlaneGeometry(width, height,
      (segmentWidth-1) * scale, (segmentHeight-1) * scale);
  geometry.dynamic = true;

  // flip the heights
  var vertices = [];
  for (var h = segmentHeight-1; h >= 0; --h)
  {
    for (var w = 0; w < segmentWidth; ++w)
    {
      vertices[(segmentHeight-h-1)*segmentWidth  + w]
          = heights[h*segmentWidth + w];
    }
  }

  // sub-sample
  var col = (segmentWidth-1) * scale;
  var row = (segmentHeight-1) * scale;
  for (var r = 0; r < row; ++r)
  {
    for (var c = 0; c < col; ++c)
    {
      var index = (r * col * 1/(scale*scale)) +   (c * (1/scale));
      geometry.vertices[r*col + c].z = vertices[index];
    }
  }

  var mesh;
  if (textures && textures.length > 0)
  {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeTangents();

    var textureLoaded = [];
    var repeats = [];
    for (var t = 0; t < textures.length; ++t)
    {
      textureLoaded[t] = THREE.ImageUtils.loadTexture(textures[t].diffuse,
          new THREE.UVMapping());
      textureLoaded[t].wrapS = THREE.RepeatWrapping;
      textureLoaded[t].wrapT = THREE.RepeatWrapping;
      repeats[t] = width/textures[t].size;
    }

    // for now, use fixed no. of textures and blends
    // so populate the remaining ones to make the fragment shader happy
    for (var tt = textures.length; tt< 3; ++tt)
    {
      textureLoaded[tt] = textureLoaded[tt-1];
    }
    for (var b = blends.length; tt < 2; ++b)
    {
      blends[b] = blends[b-1];
    }
    for (var rr = repeats.length; rr < 3; ++rr)
    {
      repeats[rr] = repeats[rr-1];
    }

    // Use the same approach as gazebo scene, grab the first directional light
    // and use it for shading the terrain
    var lightDir = new THREE.Vector3(0, 0, 1);
    var lightDiffuse = new THREE.Color(0xffffff);
    var allObjects = [];
    this.scene.getDescendants(allObjects);
    for (var l = 0; l < allObjects.length; ++l)
    {
      if (allObjects[l] instanceof THREE.DirectionalLight)
      {
        lightDir = allObjects[l].position;
        lightDiffuse = allObjects[l].color;
        break;
      }
    }

    var material = new THREE.ShaderMaterial({
      uniforms:
      {
        texture0: { type: 't', value: textureLoaded[0]},
        texture1: { type: 't', value: textureLoaded[1]},
        texture2: { type: 't', value: textureLoaded[2]},
        repeat0: { type: 'f', value: repeats[0]},
        repeat1: { type: 'f', value: repeats[1]},
        repeat2: { type: 'f', value: repeats[2]},
        minHeight1: { type: 'f', value: blends[0].min_height},
        fadeDist1: { type: 'f', value: blends[0].fade_dist},
        minHeight2: { type: 'f', value: blends[1].min_height},
        fadeDist2: { type: 'f', value: blends[1].fade_dist},
        ambient: { type: 'c', value: this.ambient.color},
        lightDiffuse: { type: 'c', value: lightDiffuse},
        lightDir: { type: 'v3', value: lightDir}
      },
      attributes: {},
      vertexShader: document.getElementById( 'heightmapVS' ).innerHTML,
      fragmentShader: document.getElementById( 'heightmapFS' ).innerHTML
    });

    mesh = new THREE.Mesh( geometry, material);
  }
  else
  {
    mesh = new THREE.Mesh( geometry,
        new THREE.MeshPhongMaterial( { color: 0x555555 } ) );
  }

  mesh.position.x = origin.x;
  mesh.position.y = origin.y;
  mesh.position.z = origin.z;
  parent.add(mesh);

  this.heightmap = parent;
};

/**
 * Load mesh
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 */
GZ3D.Scene.prototype.loadMesh = function(uri, submesh, centerSubmesh,
    callback)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, submesh, centerSubmesh, callback);
  }
  else if (uriFile.substr(-5).toLowerCase() === '.urdf')
  {
    /*var urdfModel = new ROSLIB.UrdfModel({
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
    }*/
  }
};

/**
 * Load collada file
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 */
GZ3D.Scene.prototype.loadCollada = function(uri, submesh, centerSubmesh,
    callback)
{
  var dae;
  var mesh = null;
  /*
  // Crashes: issue #36
  if (this.meshes[uri])
  {
    dae = this.meshes[uri];
    dae = dae.clone();
    this.useColladaSubMesh(dae, submesh, centerSubmesh);
    callback(dae);
    return;
  }
  */

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
    this.scene.prepareColladaMesh(dae);
    this.scene.meshes[thatURI] = dae;
    dae = dae.clone();
    this.scene.useColladaSubMesh(dae, thatSubmesh, centerSubmesh);

    dae.name = uri;
    callback(dae);
  });
};

/**
 * Prepare collada by removing other non-mesh entities such as lights
 * @param {} dae
 */
GZ3D.Scene.prototype.prepareColladaMesh = function(dae)
{
  var allChildren = [];
  dae.getDescendants(allChildren);
  for (var i = 0; i < allChildren.length; ++i)
  {
    if (allChildren[i] instanceof THREE.Light)
    {
      allChildren[i].parent.remove(allChildren[i]);
    }
  }
};

/**
 * Prepare collada by handling submesh-only loading
 * @param {} dae
 * @param {} submesh
 * @param {} centerSubmesh
 * @returns {THREE.Mesh} mesh
 */
GZ3D.Scene.prototype.useColladaSubMesh = function(dae, submesh, centerSubmesh)
{
  if (!submesh)
  {
    return null;
  }

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
  }
  return mesh;
};

/*GZ3D.Scene.prototype.setMaterial = function(mesh, texture, normalMap)
{
  if (!mesh)
  {
    return;
  }

  if (texture || normalMap)
  {
    // normal map shader
    var shader = THREE.ShaderLib['normalmap'];
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    if (texture)
    {
      uniforms['enableDiffuse'].value = true;
      uniforms['tDiffuse'].value = THREE.ImageUtils.loadTexture(texture);
    }
    if (normalMap)
    {
      uniforms['tNormal'].value = THREE.ImageUtils.loadTexture(normalMap);
    }

    var parameters = { fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader, uniforms: uniforms,
        lights: true, fog: false };
    var shaderMaterial = new THREE.ShaderMaterial(parameters);
    mesh.geometry.computeTangents();
    mesh.material = shaderMaterial;
  }
};*/

/**
 * Set material for an object
 * @param {} obj
 * @param {} material
 */
GZ3D.Scene.prototype.setMaterial = function(obj, material)
{
  if (obj)
  {
    if (material)
    {
      obj.material = new THREE.MeshPhongMaterial();
      var ambient = material.ambient;
      if (ambient)
      {
        obj.material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
      }
      var diffuse = material.diffuse;
      if (diffuse)
      {
        obj.material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
      }
      var specular = material.specular;
      if (specular)
      {
        obj.material.specular.setRGB(specular[0], specular[1], specular[2]);
      }
      var opacity = material.opacity;
      if (opacity)
      {
        if (opacity < 1)
        {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      }

      if (material.texture)
      {
        var texture = THREE.ImageUtils.loadTexture(material.texture);
        if (material.scale)
        {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.x = 1.0 / material.scale[0];
          texture.repeat.y = 1.0 / material.scale[1];
        }
        obj.material.map = texture;
      }
      if (material.normalMap)
      {
        obj.material.normalMap =
            THREE.ImageUtils.loadTexture(material.normalMap);
      }
    }
  }
};

/**
 * Set manipulation mode (view/translate/rotate)
 * @param {string} mode
 */
GZ3D.Scene.prototype.setManipulationMode = function(mode)
{
  this.manipulationMode = mode;

  if (mode === 'view')
  {
    if (this.modelManipulator.object)
    {
      this.emitter.emit('poseChanged', this.modelManipulator.object);
    }
    this.selectEntity(null);
  }
  else
  {
    this.modelManipulator.mode = this.manipulationMode;
    this.modelManipulator.setMode(this.modelManipulator.mode);
    // model was selected during view mode
    if (this.selectedEntity)
    {
      this.selectEntity(this.selectedEntity);
    }
  }

};

/**
 * Show collision visuals
 * @param {boolean} show
 */
GZ3D.Scene.prototype.showCollision = function(show)
{
  if (show === this.showCollisions)
  {
    return;
  }

  var allObjects = [];
  this.scene.getDescendants(allObjects);
  for (var i = 0; i < allObjects.length; ++i)
  {
    if (allObjects[i] instanceof THREE.Object3D &&
        allObjects[i].name.indexOf('COLLISION_VISUAL') >=0)
    {
      var allChildren = [];
      allObjects[i].getDescendants(allChildren);
      for (var j =0; j < allChildren.length; ++j)
      {
        if (allChildren[j] instanceof THREE.Mesh)
        {
          allChildren[j].visible = show;
        }
      }
    }
  }
  this.showCollisions = show;

};

/**
 * Attach manipulator to an object
 * @param {THREE.Object3D} model
 * @param {string} mode (translate/rotate)
 */
GZ3D.Scene.prototype.attachManipulator = function(model,mode)
{
  if (this.modelManipulator.object)
  {
    this.emitter.emit('poseChanged', this.modelManipulator.object);
  }

  if (mode !== 'view')
  {
    this.modelManipulator.attach(model);
    this.modelManipulator.mode = mode;
    this.modelManipulator.setMode( this.modelManipulator.mode );
    this.scene.add(this.modelManipulator.gizmo);
  }
};

/**
 * Reset view
 */
GZ3D.Scene.prototype.resetView = function()
{
  this.camera.position.copy(this.defaultCameraPosition);
  this.camera.up = new THREE.Vector3(0, 0, 1);
  this.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
  this.camera.updateMatrix();
};

/**
 * Show radial menu
 * @param {} event
 */
GZ3D.Scene.prototype.showRadialMenu = function(e)
{
  var event = e.originalEvent;

  var pointer = event.touches ? event.touches[ 0 ] : event;
  var pos = new THREE.Vector2(pointer.clientX, pointer.clientY);

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (model && model.name !== '' && model.name !== 'plane'
      && this.modelManipulator.pickerNames.indexOf(model.name) === -1)
  {
    this.radialMenu.show(event,model);
    this.selectEntity(model);
  }
};

/**
 * Show bounding box for a model. The box is aligned with the world.
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.showBoundingBox = function(model)
{
  if (typeof model === 'string')
  {
    model = this.scene.getObjectByName(model);
  }

  if (this.boundingBox.visible)
  {
    if (this.boundingBox.parent === model)
    {
      return;
    }
    else
    {
      this.hideBoundingBox();
    }
  }
  var box = new THREE.Box3();
  // w.r.t. world
  box.setFromObject(model);
  // center vertices with object
  box.min.x = box.min.x - model.position.x;
  box.min.y = box.min.y - model.position.y;
  box.min.z = box.min.z - model.position.z;
  box.max.x = box.max.x - model.position.x;
  box.max.y = box.max.y - model.position.y;
  box.max.z = box.max.z - model.position.z;

  var vertex = new THREE.Vector3(box.max.x, box.max.y, box.max.z); // 0
  this.boundingBox.geometry.vertices[0].copy(vertex);
  this.boundingBox.geometry.vertices[7].copy(vertex);
  this.boundingBox.geometry.vertices[16].copy(vertex);

  vertex.set(box.min.x, box.max.y, box.max.z); // 1
  this.boundingBox.geometry.vertices[1].copy(vertex);
  this.boundingBox.geometry.vertices[2].copy(vertex);
  this.boundingBox.geometry.vertices[18].copy(vertex);

  vertex.set(box.min.x, box.min.y, box.max.z); // 2
  this.boundingBox.geometry.vertices[3].copy(vertex);
  this.boundingBox.geometry.vertices[4].copy(vertex);
  this.boundingBox.geometry.vertices[20].copy(vertex);

  vertex.set(box.max.x, box.min.y, box.max.z); // 3
  this.boundingBox.geometry.vertices[5].copy(vertex);
  this.boundingBox.geometry.vertices[6].copy(vertex);
  this.boundingBox.geometry.vertices[22].copy(vertex);

  vertex.set(box.max.x, box.max.y, box.min.z); // 4
  this.boundingBox.geometry.vertices[8].copy(vertex);
  this.boundingBox.geometry.vertices[15].copy(vertex);
  this.boundingBox.geometry.vertices[17].copy(vertex);

  vertex.set(box.min.x, box.max.y, box.min.z); // 5
  this.boundingBox.geometry.vertices[9].copy(vertex);
  this.boundingBox.geometry.vertices[10].copy(vertex);
  this.boundingBox.geometry.vertices[19].copy(vertex);

  vertex.set(box.min.x, box.min.y, box.min.z); // 6
  this.boundingBox.geometry.vertices[11].copy(vertex);
  this.boundingBox.geometry.vertices[12].copy(vertex);
  this.boundingBox.geometry.vertices[21].copy(vertex);

  vertex.set(box.max.x, box.min.y, box.min.z); // 7
  this.boundingBox.geometry.vertices[13].copy(vertex);
  this.boundingBox.geometry.vertices[14].copy(vertex);
  this.boundingBox.geometry.vertices[23].copy(vertex);

  this.boundingBox.geometry.verticesNeedUpdate = true;

  // rotate the box back to the world
  var modelRotation = new THREE.Matrix4();
  modelRotation.extractRotation(model.matrixWorld);
  var modelInverse = new THREE.Matrix4();
  modelInverse.getInverse(modelRotation);
  this.boundingBox.quaternion.setFromRotationMatrix(modelInverse);
  this.boundingBox.name = 'boundingBox';
  this.boundingBox.visible = true;

  // Add box as model's child
  model.add(this.boundingBox);
};

/**
 * Hide bounding box
 */
GZ3D.Scene.prototype.hideBoundingBox = function()
{
  if(this.boundingBox.parent)
  {
    this.boundingBox.parent.remove(this.boundingBox);
  }
  this.boundingBox.visible = false;
};

/**
 * Mouse right click
 * @param {} event
 * @param {} callback - function to be executed to the clicked model
 */
GZ3D.Scene.prototype.onRightClick = function(event, callback)
{
  var pos = new THREE.Vector2(event.clientX, event.clientY);
  var model = this.getRayCastModel(pos, new THREE.Vector3());

  if(model && model.name !== '' && model.name !== 'plane' &&
      this.modelManipulator.pickerNames.indexOf(model.name) === -1)
  {
    callback(model);
  }
};


/**
 * Set model's view mode
 * @param {} model
 * @param {} viewAs (normal/transparent/wireframe)
 */
GZ3D.Scene.prototype.setViewAs = function(model, viewAs)
{
  // Toggle
  if (model.viewAs === viewAs)
  {
    viewAs = 'normal';
  }

  function materialViewAs(material)
  {
    if (materials.indexOf(material.id) === -1)
    {
      materials.push(material.id);
      material.transparent = true;

      if (viewAs === 'transparent')
      {
        if (material.opacity)
        {
          material.originalOpacity = material.opacity;
        }
        else
        {
          material.originalOpacity = 1.0;
        }
        material.opacity = 0.25;
      }
      else
      {
        material.opacity =
            material.originalOpacity ?
            material.originalOpacity : 1.0;
      }

      if (viewAs === 'wireframe')
      {
        material.visible = false;
      }
      else
      {
        material.visible = true;
      }
    }
  }

  var wireframe;
  var descendants = [];
  var materials = [];
  model.getDescendants(descendants);
  for (var i = 0; i < descendants.length; ++i)
  {
    if (descendants[i].material &&
        descendants[i].name.indexOf('boundingBox') === -1 &&
        descendants[i].name.indexOf('COLLISION_VISUAL') === -1 &&
        !this.getParentByPartialName(descendants[i], 'COLLISION_VISUAL')&&
        descendants[i].name.indexOf('wireframe') === -1)
    {
      if (descendants[i].material instanceof THREE.MeshFaceMaterial)
      {
        for (var j = 0; j < descendants[i].material.materials.length; ++j)
        {
          materialViewAs(descendants[i].material.materials[j]);
        }
      }
      else
      {
        materialViewAs(descendants[i].material);
      }

      if (viewAs === 'wireframe')
      {
        wireframe = descendants[i].getObjectByName('wireframe');
        if (wireframe)
        {
          wireframe.visible = true;
        }
        else
        {
          var mesh = new THREE.Mesh( descendants[i].geometry,
              new THREE.MeshBasicMaterial({color: 0xffffff}));
          wireframe = new THREE.WireframeHelper( mesh );
          wireframe.name = 'wireframe';
          descendants[i].add( wireframe );
        }
      }
      else
      {
        wireframe = descendants[i].getObjectByName('wireframe');
        if (wireframe)
        {
          wireframe.visible = false;
        }
      }
    }
  }
  model.viewAs = viewAs;
};

/**
 * Returns the closest parent whose name contains the given string
 * @param {} object
 * @param {} name
 */
GZ3D.Scene.prototype.getParentByPartialName = function(object, name)
{
  var parent = object.parent;
  while (parent && parent !== this.scene)
  {
    if (parent.name.indexOf(name) !== -1)
    {
      return parent;
    }

    parent = parent.parent;
  }
  return null;
};

/**
 * Select entity
 * @param {} object
 */
GZ3D.Scene.prototype.selectEntity = function(object)
{
  if (object)
  {
    if (object !== this.selectedEntity)
    {
      this.showBoundingBox(object);
      this.selectedEntity = object;
      guiEvents.emit('setTreeSelected', object.name);
    }
    this.attachManipulator(object, this.manipulationMode);
  }
  else
  {
    if (this.modelManipulator.object)
    {
      this.modelManipulator.detach();
      this.scene.remove(this.modelManipulator.gizmo);
    }
    this.hideBoundingBox();
    this.selectedEntity = null;
    guiEvents.emit('setTreeDeselected');
  }
};
