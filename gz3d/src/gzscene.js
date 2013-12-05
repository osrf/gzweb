GZ3D.Scene = function()
{
  this.init();
};

GZ3D.Scene.prototype.init = function()
{
  this.name = 'default';
  this.scene = new THREE.Scene();
  // this.scene.name = this.name;
  this.meshes = {};

  // only support one heightmap for now.
  this.heightmap = null;

  this.selectedEntity = null;
  this.mouseEntity = null;

  this.manipulationMode = 'view';

  this.renderer = new THREE.WebGLRenderer({antialias: true });
  this.renderer.setClearColor(0xcccccc, 1);
  this.renderer.setSize( window.innerWidth, window.innerHeight);
  // this.renderer.shadowMapEnabled = true;
  // this.renderer.shadowMapSoft = true;

  // lights
  this.ambient = new THREE.AmbientLight( 0x222222 );
  this.scene.add(this.ambient);

  this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  this.camera.position.x = 0;
  this.camera.position.y = -5;
  this.camera.position.z = 5;
  this.camera.up = new THREE.Vector3(0, 0, 1);
  this.camera.lookAt(0, 0, 0);

  this.showCollisions = false;

  var that = this;
  this.getDomElement().addEventListener( 'mousedown',
      function(event) {that.onMouseDown(event);}, false );

  // Need to use `document` instead of getDomElement in order to get events
  // outside the webgl div element.
  document.addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onMouseUp(event);}, false );

  this.getDomElement().addEventListener( 'DOMMouseScroll',
      function(event) {that.onMouseScroll(event);}, false ); //firefox

  this.getDomElement().addEventListener( 'mousewheel',
      function(event) {that.onMouseScroll(event);}, false );

  document.addEventListener( 'keydown',
      function(event) {that.onKeyDown(event);}, false );


  this.modelManipulator = new THREE.TransformControls(this.camera,
      this.getDomElement());

  this.controls = new THREE.OrbitControls(this.camera);

  this.emitter = new EventEmitter2({ verbose: true });

  // SSAO
  this.effectsEnabled = false;
  // depth
  var depthShader = THREE.ShaderLib[ 'depthRGBA'];
  var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

  this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
  this.depthMaterial.blending = THREE.NoBlending;

  // postprocessing
  this.composer = new THREE.EffectComposer(this.renderer );
  this.composer.addPass( new THREE.RenderPass(this.scene,this.camera));

  this.depthTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );

  var effect = new THREE.ShaderPass( THREE.SSAOShader );
  effect.uniforms[ 'tDepth' ].value = this.depthTarget;
  effect.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
  effect.uniforms[ 'cameraNear' ].value = this.camera.near;
  effect.uniforms[ 'cameraFar' ].value = this.camera.far;
  effect.renderToScreen = true;
  this.composer.addPass( effect );

};

GZ3D.Scene.prototype.onMouseDown = function(event)
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

  if (this.manipulationMode === 'view')
  {
    return;
  }

  if (model)
  {
    // console.log('found model ' + model.name );
    if (model.name === 'plane')
    {
      this.killCameraControl = false;
    }
    else if (model.name !== '')
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
      // console.log('hovered ' + this.modelManipulator.object.name);
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

GZ3D.Scene.prototype.onKeyDown = function(event)
{
  if (event.shiftKey)
  {
    // + and - for zooming
    if (event.keyCode === 187 || event.keyCode === 189)
    {
      this.controls.enabled = true;
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
        // model = null;
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

GZ3D.Scene.prototype.loadMesh = function(uri, submesh, centerSubmesh, texture,
    normalMap, parent)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, submesh, centerSubmesh, texture, normalMap,
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

// load the collada file
GZ3D.Scene.prototype.loadCollada = function(uri, submesh, centerSubmesh,
    texture, normalMap, parent)
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
    this.setMaterial(mesh, texture, normalMap);
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
      this.scene.setMaterial(mesh, texture, normalMap);
      parent.add(dae);
    });
  }
  else
  {
    parent.add(dae);
  }
};

// Prepare collada by handling submesh-only loading and removing other
// non-mesh entities such as lights
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

GZ3D.Scene.prototype.setMaterial = function(mesh, texture, normalMap)
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
    if (allObjects[i].name.indexOf('COLLISION_VISUAL') >=0)
    {
      for (var j =0; j < allObjects[i].children.length; ++j)
      {
        allObjects[i].children[j].visible = show;
      }
    }
  }
  this.showCollisions = show;

};
