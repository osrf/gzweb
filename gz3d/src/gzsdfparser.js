GZ3D.SdfParser = function(scene, gui, gziface)
{
  // set the sdf version
  this.SDF_VERSION = 1.40;
  this.MATERIAL_ROOT = 'assets/';

  // set the xml parser function
  this.parseXML = function(xmlStr) {
    return (new window.DOMParser()).parseFromString(xmlStr, 'text/xml');
  };

  this.scene = scene;
  this.scene.setSDFParser(this);
  this.gui = gui;
  this.gziface = gziface;
  this.init();
  
  // cache materials if more than one model needs them
  this.materials = [];
  this.entityMaterial = {};
  
  //FIXME: for testing we recorded materials by hand
  this.materials = this.getMaterials();

};

GZ3D.SdfParser.prototype.init = function()
{
  var that = this;
  this.gziface.emitter.on('error', function() {
    that.onConnectionError();
  });

};

GZ3D.SdfParser.prototype.onConnectionError = function()
{
  var that = this;
  var entityCreated = function(model, type) {
    if (!that.gziface.isConnected) {
      that.addModelByType(model, type);
    }
  };
  this.gui.emitter.on('entityCreated', entityCreated);
  
};

GZ3D.SdfParser.prototype.parseColor = function(diffuseStr)
{
  var color = {};
  var values = diffuseStr.split(' ');
  
  color.r = parseFloat(values[0]);
  color.g = parseFloat(values[1]);
  color.b = parseFloat(values[2]);
  color.a = parseFloat(values[3]);
  
  return color;
};

GZ3D.SdfParser.prototype.parse3DVector = function(vectorStr)
{
  var vector3D = {};
  var values = vectorStr.split(' ');
  vector3D.x = parseFloat(values[0]);
  vector3D.y = parseFloat(values[1]);
  vector3D.z = parseFloat(values[2]);
  return vector3D;
};

GZ3D.SdfParser.prototype.spawnLightFromSDF = function(sdfObj)
{
  var light = sdfObj.light;
  var lightObj;
  var color = new THREE.Color();
  var diffuseColor = this.parseColor(light.diffuse);
  color.r = diffuseColor.r;
  color.g = diffuseColor.g;
  color.b = diffuseColor.b;

  if (light['@type'] === 'point')
  {
    lightObj = new THREE.AmbientLight(color.getHex());
    lightObj.distance = light.range;
    this.scene.setPose(lightObj, light.pose.position,
            light.pose.orientation);
  }
  if (light['@type'] === 'spot')
  {
    lightObj = new THREE.SpotLight(color.getHex());
    lightObj.distance = light.range;
    this.scene.setPose(lightObj, light.pose.position,
            light.pose.orientation);
  }
  else if (light['@type'] === 'directional')
  {
    lightObj = new THREE.DirectionalLight(color.getHex());
    
    var direction = this.parse3DVector(light.direction);
    var dir = new THREE.Vector3(direction.x, direction.y, direction.z);
    var target = dir;
    var negDir = dir.negate();
    negDir.normalize();
    var factor = 10;
    var pose = this.parsePose(light.pose);
    pose.position.x += factor * negDir.x;
    pose.position.y += factor * negDir.y;
    pose.position.z += factor * negDir.z;

    target.x -= pose.position.x;
    target.y -= pose.position.y;
    target.z -= pose.position.z;

    lightObj.target.position = target;
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

    lightObj.position.set(negDir.x, negDir.y, negDir.z);
    this.scene.setPose(lightObj, pose.position, pose.orientation);
  }
  lightObj.intensity = parseFloat(light.attenuation.constant);
  lightObj.castShadow = light.cast_shadows;
  lightObj.shadowDarkness = 0.3;
  lightObj.name = light['@name'];

//  this.scene.add(lightObj);
  return lightObj;
};

GZ3D.SdfParser.prototype.parsePose = function(poseStr)
{
  var values = poseStr.split(' ');

  var position = new THREE.Vector3(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]));

  // get euler rotation and convert it to Quaternion
  var quaternion = new THREE.Quaternion();
  var euler = new THREE.Euler(parseFloat(values[3]), parseFloat(values[4]), parseFloat(values[5]), 'ZYX');
  quaternion.setFromEuler(euler);

  var pose = {
          'position': position,
          'orientation': quaternion
  };

  return pose;

};

GZ3D.SdfParser.prototype.createMaterial = function(material)
{
  var textureUri, texture, mat;
  var ambient, diffuse, specular, opacity, normalMap;
  
  if (!material)
  {
    return null;
  }
  
  var script  = material.script;
  if (script)
  {
    if (script.uri){
      // if there is just one uri convert it to array
      if (!(script.uri instanceof Array)){
        script.uri = [script.uri];
      }
      
      if (script.name){
        mat = this.materials[script.name];
        // if we already cached the materials
        if (mat){
          ambient = mat.ambient;
          diffuse = mat.diffuse;
          specular = mat.specular;
          opacity = mat.opacity;

          if (mat.texture){
            for (var i = 0; i < script.uri.length; i++){
              var uriType = script.uri[i].substring(0,script.uri[i].indexOf('://'));
              if (uriType === 'model'){
                // if texture uri
                if (script.uri[i].indexOf('textures') > 0)
                {
                  textureUri = script.uri[i].substring(script.uri[i].indexOf('://') + 3);
                  break;
                }
              } else if (uriType === 'file'){
                if (script.uri[i].indexOf('materials') > 0)
                {
                  textureUri = script.uri[i].substring(
                      script.uri[i].indexOf('://') + 3,
                      script.uri[i].indexOf('materials') + 9) + '/textures';
                  break;
                }
              }
            }
            texture = this.MATERIAL_ROOT + textureUri + '/' + mat.texture;
          }
        } else {
          //TODO: how to handle if material is not cached
          console.log(script.name + ' is not cached!!!');
        }
      }
    }
  }

  // normal map
  if (material.normal_map)
  {
    var mapUri;
    if (material.normal_map.indexOf('://') > 0)
    {
      mapUri = material.normal_map.substring(
          material.normal_map.indexOf('://') + 3,
          material.normal_map.lastIndexOf('/'));
    }
    else
    {
      mapUri = textureUri;
    }
    if (mapUri)
    {
      var startIndex = material.normal_map.lastIndexOf('/') + 1;
      if (startIndex < 0)
      {
        startIndex = 0;
      }
      var normalMapName = material.normal_map.substr(startIndex,
          material.normal_map.lastIndexOf('.') - startIndex);
      normalMap = this.MATERIAL_ROOT +
        mapUri  + '/' + normalMapName + '.png';
    }
  }

  return {
      texture: texture,
      normalMap: normalMap,
      ambient: ambient,
      diffuse: diffuse,
      specular: specular,
      opacity: opacity
  };
  
};

GZ3D.SdfParser.prototype.parseSize = function(size)
{
  var sizeObj;
  var values = size.split(' ');
  var x = parseFloat(values[0]);
  var y = parseFloat(values[1]);
  var z = parseFloat(values[2]);
  sizeObj = {
          'x':x,
          'y':y,
          'z':z
  };
  
  return sizeObj;
};

GZ3D.SdfParser.prototype.createGeom = function(geom, mat, parent)
{
  var that = this;
  var obj;
  var size, normal;
  
  var material = this.createMaterial(mat);
  if (geom.box)
  {
    size = this.parseSize(geom.box.size);
    obj = this.scene.createBox(size.x, size.y, size.z);
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
  else if (geom.plane)
  {
    normal = this.parseSize(geom.plane.normal);
    size = this.parseSize(geom.plane.size);
    obj = this.scene.createPlane(normal.x, normal.y,
        normal.z, size.x, size.y);
  }
  else if (geom.mesh)
  {
    {
      var meshUri = geom.mesh.uri;
      var submesh = geom.mesh.submesh;
      var centerSubmesh = geom.mesh.center_submesh;

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

        var modelUri = this.MATERIAL_ROOT + '/' + modelName;
        var materialName = parent.name + '::' + modelUri;
        this.entityMaterial[materialName] = material;

        this.scene.loadMesh(modelUri, submesh,
            centerSubmesh, function(dae) {
              if (that.entityMaterial[materialName])
              {
                var allChildren = [];
                dae.getDescendants(allChildren);
                for (var c = 0; c < allChildren.length; ++c)
                {
                  if (allChildren[c] instanceof THREE.Mesh)
                  {
                    that.scene.setMaterial(allChildren[c],
                        that.entityMaterial[materialName]);
                    break;
                  }
                }
              }
              parent.add(dae);
              loadGeom(parent);
            });
      }
    }
  }
//TODO: how to handle height map without connecting to the server
//  else if (geom.heightmap)
//  {
//    var request = new ROSLIB.ServiceRequest({
//      name : that.scene.name
//    });
//
//    // redirect the texture paths to the assets dir
//    var textures = geom.heightmap.texture;
//    for ( var k = 0; k < textures.length; ++k)
//    {
//      textures[k].diffuse = this.parseUri(textures[k].diffuse);
//      textures[k].normal = this.parseUri(textures[k].normal);
//    }
//
//    var sizes = geom.heightmap.size;
//
//    // send service request and load heightmap on response
//    this.heightmapDataService.callService(request,
//        function(result)
//        {
//          var heightmap = result.heightmap;
//          // gazebo heightmap is always square shaped,
//          // and a dimension of: 2^N + 1
//          that.scene.loadHeightmap(heightmap.heights, heightmap.size.x,
//              heightmap.size.y, heightmap.width, heightmap.height,
//              heightmap.origin, textures,
//              geom.heightmap.blend, parent);
//            //console.log('Result for service call on ' + result);
//        });
//
//    //this.scene.loadHeightmap(parent)
//  }

  if (obj)
  {
    if (material)
    {
      // texture mapping for simple shapes and planes only,
      // not used by mesh and terrain
      this.scene.setMaterial(obj, material);
    }
    obj.updateMatrix();
    parent.add(obj);
    loadGeom(parent);
  }

  function loadGeom(visualObj)
  {
    var allChildren = [];
    visualObj.getDescendants(allChildren);
    for (var c = 0; c < allChildren.length; ++c)
    {
      if (allChildren[c] instanceof THREE.Mesh)
      {
        allChildren[c].castShadow = true;
        allChildren[c].receiveShadow = true;

        if (visualObj.castShadows)
        {
          allChildren[c].castShadow = visualObj.castShadows;
        }
        if (visualObj.receiveShadows)
        {
          allChildren[c].receiveShadow = visualObj.receiveShadows;
        }

        if (visualObj.name.indexOf('COLLISION_VISUAL') >= 0)
        {
          allChildren[c].castShadow = false;
          allChildren[c].receiveShadow = false;

          allChildren[c].visible = this.scene.showCollisions;
        }
        break;
      }
    }
  }
  
};

GZ3D.SdfParser.prototype.createVisual = function(visual)
{
  //TODO: handle these node values
  // cast_shadow, receive_shadows
  if (visual.geometry)
  {
    var visualObj = new THREE.Object3D();
    visualObj.name = visual['@name'];
    
    if (visual.pose)
    {
      var visualPose = this.parsePose(visual.pose);
      this.scene.setPose(visualObj, visualPose.position, visualPose.orientation);
    }
    
    this.createGeom(visual.geometry, visual.material, visualObj);
    
    return visualObj;
  }
  
  return null;
  
};

GZ3D.SdfParser.prototype.spawnFromSDF = function(sdf)
{
  //parse sdfXML
  var sdfXML;
  if ((typeof sdf) === 'string') {
    sdfXML = this.parseXML(sdf);
  } else {
    sdfXML = sdf;
  }
  
  //convert SDF XML to Json string and parse JSON string to object
  //TODO: we need better xml 2 json object convertor
  var myjson = xml2json(sdfXML, '\t');
  var sdfObj = JSON.parse(myjson).sdf;
  // it is easier to manipulate json object
  
  if (sdfObj.model) {
    return this.spawnModelFromSDF(sdfObj);
  } else if (sdfObj.light) {
    return this.spawnLightFromSDF(sdfObj);
  }
  
};

GZ3D.SdfParser.prototype.loadSDF = function(modelName)
{
  var sdf = this.loadModel(modelName);
  return this.spawnFromSDF(sdf);
};

GZ3D.SdfParser.prototype.spawnModelFromSDF = function(sdfObj)
{
  // create the model
  var modelObj = new THREE.Object3D();
  modelObj.name = sdfObj.model['@name'];
  //TODO: is that needed
  //modelObj.userData = sdfObj.model.@id;

  var pose;
  var i, j, k;
  var visualObj;
  var linkObj, linkPose;
  
  if (sdfObj.model.pose)
  {
    pose = this.parsePose(sdfObj.model.pose);
    this.scene.setPose(modelObj, pose.position, pose.orientation);
  }
  
  //convert link object to link array
  if (!(sdfObj.model.link instanceof Array)) {
    sdfObj.model.link = [sdfObj.model.link];
  }

  for (i = 0; i < sdfObj.model.link.length; i++)
  {
    linkObj = this.createLink(sdfObj.model.link[i]);
    modelObj.add(linkObj);
  }
  
//  this.scene.add(modelObj);
  return modelObj;

};

GZ3D.SdfParser.prototype.createLink = function(link)
{
  var linkPose, visualObj;
  var linkObj = new THREE.Object3D();
  linkObj.name = link['@name'];
  
  if (link.pose)
  {
    linkPose = this.parsePose(link.pose);
    this.scene.setPose(linkObj, linkPose.position, linkPose.orientation);
  }
  
  if (link.visual)
  {
    if (!(link.visual instanceof Array)) {
      link.visual = [link.visual];
    }
    
    for (var i = 0; i < link.visual.length; i++) {
      visualObj = this.createVisual(link.visual[i]);
      if (visualObj && !visualObj.parent)
      {
        linkObj.add(visualObj);
      }
    }
  }
  
  if (link.collision)
  {
    if (link.collision.visual)
    {
      if (!(link.collision.visual instanceof Array)) {
        link.collision.visual = [link.collision.visual];
      }
      
      for (var j = 0; j < link.collision.visual.length; j++) {
        visualObj = this.createVisual(link.collision.visual[j]);
        if (visualObj && !visualObj.parent)
        {
          linkObj.add(visualObj);
        }
      }
      
    }
  }
  
  return linkObj;
};

GZ3D.SdfParser.prototype.addModelByType = function(model, type)
{
  var sdf, translation, euler;
  var quaternion = new THREE.Quaternion();
  var modelObj;
  
  if (model.matrixWorld) {
    var matrix = model.matrixWorld;
    translation = new THREE.Vector3();
    euler = new THREE.Euler();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, euler, scale);
    quaternion.setFromEuler(euler);
  }

  if (type === 'box') {
    sdf = this.createBoxSDF(translation, euler);
    modelObj = this.spawnFromSDF(sdf);
  } else if (type === 'sphere') {
    sdf = this.createSphereSDF(translation, euler);
    modelObj = this.spawnFromSDF(sdf);
  } else if (type === 'cylinder') {
    sdf = this.createCylinderSDF(translation, euler);
    modelObj = this.spawnFromSDF(sdf);
  } else if (type === 'spotlight') {
    modelObj = this.scene.createLight(2);
    this.scene.setPose(modelObj, translation, quaternion);
  } else if (type === 'directionallight') {
    modelObj = this.scene.createLight(3);
    this.scene.setPose(modelObj, translation, quaternion);
  } else if (type === 'pointlight') {
    modelObj = this.scene.createLight(1);
    this.scene.setPose(modelObj, translation, quaternion);
  } else {
    var sdfObj = this.loadSDF(type);
    modelObj = new THREE.Object3D();
    modelObj.add(sdfObj);
    modelObj.matrixWorld = modelObj.matrixWorld;
    this.scene.setPose(modelObj, translation, quaternion);
  }
  
  this.scene.add(modelObj);
};

GZ3D.SdfParser.prototype.createSimpleShapeSDF = function(type, translation, euler, geomSDF)
{
  var sdf;
  
  sdf = '<sdf version="' + this.SDF_VERSION + '">'
  + '<model name="' + type + '">'
  + '<pose>' + translation.x + ' ' + translation.y + ' ' + translation.z + ' '
  + euler.x + ' ' + euler.y + ' ' + euler.z + '</pose>'
  + '<link name="link">'
  +   '<inertial><mass>1.0</mass></inertial>'
  +   '<collision name="collision">'
  +     '<geometry>'
  +        geomSDF
  +     '</geometry>'
  + '</collision>'
  + '<visual name="visual">'
  +     '<geometry>'
  +        geomSDF
  +     '</geometry>'
  +     '<material>'
  +       '<script>'
  +         '<uri>file://media/materials/scripts/gazebo.material'
  +         '</uri>'
  +         '<name>Gazebo/Grey</name>'
  +       '</script>'
  +     '</material>'
  +   '</visual>'
  + '</link>'
  + '</model>'
  + '</sdf>';
  
  return sdf;
};

GZ3D.SdfParser.prototype.createBoxSDF = function(translation, euler)
{
  var geomSDF = '<box>'
    +   '<size>1.0 1.0 1.0</size>'
    + '</box>';
  
  return this.createSimpleShapeSDF('box', translation, euler, geomSDF);
};

GZ3D.SdfParser.prototype.createSphereSDF = function(translation, euler)
{
  var geomSDF = '<sphere>'
    +   '<radius>0.5</radius>'
    + '</sphere>';
  
  return this.createSimpleShapeSDF('sphere', translation, euler, geomSDF);
};

GZ3D.SdfParser.prototype.createCylinderSDF = function(translation, euler)
{
  var geomSDF = '<cylinder>'
    +   '<radius>0.5</radius>'
    +   '<length>1.0</length>'
    + '</cylinder>';
  
  return this.createSimpleShapeSDF('cylinder', translation, euler, geomSDF);
};

GZ3D.SdfParser.prototype.getMaterials = function()
{
  var jsonStr = '{"Beer/Diffuse":{"texture":"beer.png"},"BrickBox/Diffuse":{"texture":"simple_box.png"},"DeferredLighting/AmbientLight":{"depth_write":true,"depth_check":true},"DeferredLighting/LightMaterial/Geometry":{"depth_write":false,"depth_check":true},"DeferredLighting/LightMaterial/GeometryShadow":{},"DeferredLighting/LightMaterial/Quad":{"depth_check":false},"DeferredLighting/LightMaterial/QuadShadow":{"depth_check":false},"DeferredLighting/VPL":{"depth_write":false,"depth_check":true},"DeferredRendering/Shadows/Caster":{},"DeferredRendering/Shadows/RSMCaster_Directional":{},"DeferredRendering/Shadows/RSMCaster_Spot":{},"DeferredRendering/Shadows/RSMCaster_Spot1":{"texture":"rockwall.png"},"DeferredShading/AmbientLight":{"depth_write":true,"depth_check":true},"DeferredShading/LightMaterial/Geometry":{"depth_write":false,"depth_check":true},"DeferredShading/LightMaterial/GeometryShadow":{},"DeferredShading/LightMaterial/Quad":{"depth_check":false},"DeferredShading/LightMaterial/QuadShadow":{"depth_check":false},"DeferredShading/Post/SimpleQuad":{"depth_write":false,"depth_check":false,"texture":"white.png"},"DeferredShading/VPL":{"depth_write":false,"depth_check":true},"Dumpster/Diffuse":{"texture":"Dumpster_Diffuse.png"},"Dumpster/Specular":{"texture":"Dumpster_Spec.png"},"FNR_switch_F":{"ambient":[1,1,1,1],"texture":"FNR_switch_F.png"},"FNR_switch_R":{"ambient":[1,1,1,1],"texture":"FNR_switch_R.png"},"FastFood/Diffuse":{"texture":"FastFood_Diffuse.png"},"FastFood/Normal":{"texture":"FastFood_Normal.png"},"FastFood/Specular":{"texture":"FastFood_Spec.png"},"GasStation/Diffuse":{"texture":"GasStation_Diffuse.png"},"GasStation/Normal":{"texture":"GasStation_Normal.png"},"GasStation/Specular":{"texture":"GasStation_Spec.png"},"Gazebo/Black":{"ambient":[0,0,0,1],"diffuse":[0,0,0,1],"specular":[0.1,0.1,0.1,1,5]},"Gazebo/Blue":{"ambient":[0,0,1],"diffuse":[0,0,1],"specular":[0.1,0.1,0.1,1,1]},"Gazebo/BlueGlow":{},"Gazebo/BlueLaser":{"ambient":[0,0,1,1],"diffuse":[0,0,1,1],"depth_write":false,"opacity":0.4},"Gazebo/BlueTransparent":{"ambient":[0,0,1,1],"diffuse":[0,0,1,1],"depth_write":false,"opacity":0.5},"Gazebo/CeilingTiled":{"ambient":[0.5,0.5,0.5,1],"texture":"ceiling_tiled.png"},"Gazebo/CloudySky":{"depth_write":false,"texture":"clouds.png"},"Gazebo/DarkGrey":{"ambient":[0.175,0.175,0.175,1],"diffuse":[0.175,0.175,0.175,1],"specular":[0.175,0.175,0.175,1,1.5]},"Gazebo/DepthMap":{},"Gazebo/FlatBlack":{"ambient":[0.1,0.1,0.1],"diffuse":[0.1,0.1,0.1],"specular":[0.01,0.01,0.01,1,1]},"Gazebo/GaussianCameraNoise":{},"Gazebo/Gold":{"ambient":[0.4,0.24869,0.020759,1],"diffuse":[0.8,0.64869,0.120759,1],"specular":[0.4,0.4,0.4,1,12.5]},"Gazebo/Green":{"ambient":[0,1,0],"diffuse":[0,1,0],"specular":[0.1,0.1,0.1,1,1]},"Gazebo/GreenGlow":{},"Gazebo/GreenTransparent":{"ambient":[0,1,0,1],"diffuse":[0,1,0,1],"depth_write":false,"opacity":0.5},"Gazebo/Grey":{"ambient":[0.3,0.3,0.3,1],"diffuse":[0.7,0.7,0.7,1],"specular":[0.01,0.01,0.01,1,1.5]},"Gazebo/GreyGradientSky":{"depth_write":false,"texture":"grey_gradient.png"},"Gazebo/JointAnchor":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"specular":[1,1,1,1]},"Gazebo/LaserScan1st":{},"Gazebo/LaserScan2nd":{},"Gazebo/LightOff":{"ambient":[1,0,0],"diffuse":[1,0,0]},"Gazebo/LightOn":{"ambient":[0,1,0],"diffuse":[0,1,0]},"Gazebo/Orange":{"ambient":[1,0.5088,0.0468,1],"diffuse":[1,0.5088,0.0468,1],"specular":[0.5,0.5,0.5,128]},"Gazebo/OrangeTransparent":{"ambient":[1,0.44,0,1],"diffuse":[1,0.44,0,1],"depth_write":false,"opacity":0.4},"Gazebo/PaintedWall":{"ambient":[1,1,1,1],"texture":"paintedWall.png"},"Gazebo/Pioneer2Body":{"ambient":[0.481193,0.000123,0.000123,1],"diffuse":[0.681193,0.000923,0.000923,1],"specular":[0.5,0.5,0.5,1,12.5]},"Gazebo/PioneerBody":{"ambient":[0.5,0,0],"texture":"pioneerBody.png"},"Gazebo/Purple":{"ambient":[1,0,1],"diffuse":[1,0,1],"specular":[0.1,0.1,0.1,1,1]},"Gazebo/PurpleGlow":{},"Gazebo/Red":{"ambient":[1,0,0],"diffuse":[1,0,0],"specular":[0.1,0.1,0.1,1,1]},"Gazebo/RedGlow":{"ambient":[1,0,0],"diffuse":[1,0,0],"specular":[0,0,0,128]},"Gazebo/RedTransparent":{"depth_write":false,"opacity":0.5},"Gazebo/Road":{"ambient":[0.1,0.1,0.1,1],"diffuse":[0.8,0.8,0.8,1],"specular":[0.01,0.01,0.01,1,2],"texture":"road1.png"},"Gazebo/Turquoise":{"ambient":[0,1,1],"diffuse":[0,1,1],"specular":[0.1,0.1,0.1,1,1]},"Gazebo/TurquoiseGlow":{},"Gazebo/TurquoiseGlowOutline":{"diffuse":[0,1,1,1],"specular":[0.1,0.1,0.1,128]},"Gazebo/White":{"ambient":[1,1,1,1]},"Gazebo/WhiteGlow":{},"Gazebo/Wood":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"specular":[0.2,0.2,0.2,1,12.5],"texture":"wood.png"},"Gazebo/WoodFloor":{"ambient":[0.5,0.5,0.5,1],"texture":"hardwood_floor.png"},"Gazebo/WoodPallet":{"ambient":[0.5,0.5,0.5,1],"diffuse":[1,1,1,1],"specular":[0,0,0,1,0.5],"texture":"WoodPallet.png"},"Gazebo/XYZPoints":{},"Gazebo/Yellow":{"ambient":[1,1,0,1],"diffuse":[1,1,0,1],"specular":[0,0,0,0,0]},"Gazebo/YellowGlow":{},"Gazebo/YellowTransparent":{"ambient":[1,1,0,1],"diffuse":[1,1,0,1],"depth_write":false,"opacity":0.4},"House_1/Diffuse":{"texture":"House_1_Diffuse.png"},"House_1/Normal":{"texture":"House_1_Normal.png"},"House_1/Specular":{"texture":"House_1_Spec.png"},"House_2/Diffuse":{"texture":"House_2_Diffuse.png"},"House_3/Diffuse":{"texture":"House_3_Diffuse.png"},"Kitchen/Cabinet":{"ambient":[0.604,0.423,0.0313],"diffuse":[0.604,0.423,0.0313,1],"specular":[0.1,0.1,0.1,1,128]},"Kitchen/CounterTop":{"ambient":[1,1,1,1],"texture":"granite2.png"},"Kitchen/CounterTop_H":{"ambient":[1,1,1,1],"texture":"granite.png"},"Kitchen/Grass":{"ambient":[0.5,0.5,0.5,1],"texture":"grass.png"},"Kitchen/Wall":{"ambient":[1,1,1,1],"texture":"beigeWall.png"},"Kitchen/WoodFloor":{"ambient":[0.5,0.5,0.5,1],"texture":"hardwood_floor.png"},"Mailbox/Diffuse":{"texture":"Mailbox_Diffuse.png"},"Mailbox/Specular":{"texture":"Mailbox_Spec.png"},"Polaris/Diffuse":{"ambient":[1,1,1,1],"texture":"Ranger_Diffuse.png"},"PolarisXP900/Diffuse":{"ambient":[1,1,1,1],"texture":"RangerXP900_Diffuse.png"},"RTSS/Athene/NormalMapping_MultiPass":{},"RTSS/Athene/NormalMapping_SinglePass":{"texture":"egyptrockyfull.png"},"RTSS/NormalMapping_MultiPass":{"ambient":[1,1,1],"diffuse":[0,0,0],"specular":[0,0,0,0]},"RTSS/NormalMapping_MultiPass_2lights":{},"RTSS/NormalMapping_SinglePass":{"specular":[1,1,1,32],"texture":"Panels_Diffuse.png"},"RTSS/PerPixel_SinglePass":{"specular":[1,1,1,32],"texture":"Panels_Diffuse.png"},"RoboCup/Carpet":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"specular":[0.2,0.2,0.2,1,12.5],"texture":"carpet.png"},"RoboCup/FieldBorder":{"ambient":[0.2578,0.4023,0.1836],"diffuse":[0.2578,0.4023,0.1836],"specular":[0.1,0.1,0.1,1,1]},"RoboCup/Grass":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"specular":[0.2,0.2,0.2,1,12.5],"texture":"field.png"},"RoboCup/Net":{"depth_write":false,"texture":"net.png"},"SkyX_Lightning":{"depth_write":true,"depth_check":false},"SkyX_Moon":{"depth_write":false,"depth_check":false,"texture":"SkyX_Moon.png"},"SkyX_Skydome_HDR":{"depth_write":false,"depth_check":false},"SkyX_Skydome_LDR":{"depth_write":false,"depth_check":false},"SkyX_Skydome_STARFIELD_HDR":{"depth_write":false,"depth_check":false,"texture":"SkyX_Starfield.png"},"SkyX_Skydome_STARFIELD_LDR":{"depth_write":false,"depth_check":false,"texture":"SkyX_Starfield.png"},"SkyX_VolClouds":{"depth_write":false,"depth_check":true},"SkyX_VolClouds_Lightning":{"depth_write":false,"depth_check":true},"StartingPen/Floor":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"texture":"metal_ripped.png"},"StartingPen/FloorStripped":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"texture":"metal_stripped.png"},"StartingPen/OSRF":{"ambient":[1,1,1,1],"diffuse":[1,1,1,1],"texture":"osrf.png"},"StopSign/Diffuse":{"texture":"StopSign_Diffuse.png"},"StopSign/Specular":{"texture":"StopSign_Spec.png"},"Table/Marble_Lightmap":{"texture":"marble.png"},"blur":{},"drc/san_fauxcity_sign":{"ambient":[0.8,0.8,0.8,1],"diffuse":[0.8,0.8,0.8,1],"specular":[0.1,0.1,0.1,1,2],"texture":"san_fauxcity.png"},"fire_hose_long_curled/fire_hose_canvas":{"ambient":[0.7,0.7,0.7,1],"diffuse":[1,1,1,1],"specular":[0,0,0,0],"texture":"canvas.png"},"fire_hose_long_curled/fire_hose_coupling":{"ambient":[0.7,0.7,0.7,1],"diffuse":[1,1,1,1],"specular":[0,0,0,0],"texture":"coupling_hexagon.png"},"fire_hose_long_curled/fire_hose_red_coupling":{"ambient":[0.7,0.7,0.7,1],"diffuse":[1,1,1,1],"specular":[0,0,0,0],"texture":"connector.png"},"gazebo/plain_color":{},"grid":{},"modulate":{"texture":"white.png"},"ssao":{},"ssaoBlurX":{},"ssaoBlurY":{},"vrc/asphalt":{"ambient":[0.5,0.5,0.5,1],"diffuse":[0.5,0.5,0.5,1],"specular":[0.2,0.2,0.2,1,12.5],"texture":"tarmac.png"},"vrc/grey_wall":{"texture":"grey_wall.png"},"vrc/mud":{"ambient":[0.5,0.5,0.5,1],"diffuse":[0.5,0.5,0.5,1],"specular":[0.2,0.2,0.2,1,12.5],"texture":"mud_soft_leaves.png"},"youbot/DarkGrey":{"ambient":[0.033,0.033,0.033,1],"diffuse":[1,1,1,1],"specular":[0.8,0.8,0.8,1]},"youbot/Grey":{"ambient":[0.1,0.1,0.1,1],"diffuse":[0.7,0.7,0.7,1],"specular":[0.8,0.8,0.8,1]},"youbot/Orange":{"ambient":[1,0.4,0,1],"diffuse":[1,0.4,0,1],"specular":[1,0.4,0,1]}}';
  var jsonObject = JSON.parse(jsonStr);
  return jsonObject;
};

GZ3D.SdfParser.prototype.loadModel = function(modelName)
{
  var modelFile = this.MATERIAL_ROOT + modelName + '/model.sdf';
  
  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/xml');
  xhttp.open('GET', modelFile, false);
  xhttp.send();
  return xhttp.responseXML;
};
