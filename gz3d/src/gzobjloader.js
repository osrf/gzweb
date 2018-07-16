/**
 * Load OBJ meshes
 *
 * @constructor
 *
 * @param {GZ3D.Scene} _scene - The scene to load into
 * @param {string} _uri - mesh uri which is used by mtlloader and the objloader
 * to load both the mesh file and the mtl file using XMLHttpRequests.
 * @param {} _submesh
 * @param {} _centerSubmesh
 * @param {function} _callback
 * @param {array} _files -optional- the obj [0] and the mtl [1] files as a strings
 * to be parsed by the loaders, if provided the uri will not be used just
 * as a url, no XMLHttpRequest will be made.
 */
GZ3D.OBJLoader = function(_scene, _uri, _submesh, _centerSubmesh, _callback,
    _files)
{
  // Keep parameters
  this.scene = _scene;
  this.submesh = _submesh;
  this.centerSubmesh = _centerSubmesh;
  this.callback = _callback;
  this.uri = _uri;
  this.files = _files;

  // True if raw files were provided
  this.usingRawFiles = (this.files &&
                        this.files.length === 2 &&
                        this.files[0] &&
                        this.files[1]);

  // Loaders
  this.objLoader = new THREE.OBJLoader();

  this.mtlLoader = new THREE.MTLLoader();
  this.mtlLoader.setCrossOrigin('');

  // Assume .mtl is in the same path as .obj
  if (!this.usingRawFiles)
  {
    var baseUrl = this.uri.substr(0, this.uri.lastIndexOf('/') + 1);
    this.mtlLoader.setPath(baseUrl);
  }

  // Initialize container
  this.container = undefined;
};

/**
 * Load Obj file
 */
GZ3D.OBJLoader.prototype.loadOBJ = function()
{
  var that = this;

  // If no raw files are provided, make HTTP request
  if (!this.usingRawFiles)
  {
    this.objLoader.load(this.uri, function(_container)
    {
      that.onObjLoaded(_container);
    });
  }
  // Otherwise load from raw file
  else
  {
    var container = this.objLoader.parse(this.files[0]);
    this.onObjLoaded(container);
  }
};

/**
 * Callback when loading is successfully completed
 */
GZ3D.OBJLoader.prototype.loadComplete = function()
{
  var obj = this.container;
  this.scene.meshes[this.uri] = obj;
  obj = obj.clone();
  this.scene.useSubMesh(obj, this.submesh, this.centerSubmesh);

  obj.name = this.uri;
  this.callback(obj);
};

/**
 * Callback when loading is successfully completed
 * @param {MTLLoaderMaterialCreator} _mtlCreator - Returned by MTLLoader.parse
 */
GZ3D.OBJLoader.prototype.applyMaterial = function(_mtlCreator)
{
  var allChildren = [];
  this.container.getDescendants(allChildren);

  for (var j =0; j < allChildren.length; ++j)
  {
    var child = allChildren[j];
    if (child && child.material)
    {
      if (child.material.name)
      {
        child.material = _mtlCreator.create(child.material.name);
      }
      else if (Array.isArray(child.material))
      {
        for (var k = 0; k < child.material.length; ++k)
        {
          child.material[k] = _mtlCreator.create(child.material[k].name);
        }
      }
    }
  }

  this.loadComplete();
};

/**
 * Callback when raw .mtl file has been loaded
 *
 * Assumptions:
 *     * Both .obj and .mtl files are under the /meshes dir
 *     * Textures are under the /materials/textures dir
 *
 * Three texture filename patterns are handled. A single .mtl file may
 * have instances of all of these.
 * 1. Path relative to the meshes folder, which should always start with
 *    ../materials/textures/
 * 2. Gazebo URI in the model:// format, referencing another model
 *    in the same path as the one being loaded
 * 2. Just the image filename without a path
 * @param {string} _text - MTL file as string
 */
GZ3D.OBJLoader.prototype.loadMTL = function(_text)
{
  if (!_text)
  {
    return;
  }

  // Handle model:// URI
  if (_text.indexOf('model://') > 0)
  {
    if (this.mtlLoader.path.indexOf('/meshes/') < 0)
    {
      console.error('Failed to resolve texture URI. MTL file directory [' +
          this.mtlLoader.path +
          '] not supported, it should be in a /meshes directory');
      console.error(_text);
      return;
    }

    // Get models path from .mtl file path
    // This assumes the referenced model is in the same path as the model
    // being loaded. So this may fail if there are models being loaded
    // from various paths
    var path = this.mtlLoader.path;
    path = path.substr(0, path.lastIndexOf('/meshes'));
    path = path.substr(0, path.lastIndexOf('/') + 1);

    // Search and replace
    _text = _text.replace(/model:\/\//g, path);
  }

  // Handle case in which the image filename is given without a path
  // We expect the texture to be under /materials/textures
  var lines = _text.split('\n');

  if (lines.length === 0)
  {
    console.error('Empty or no MTL file');
    return;
  }

  var newText;
  for (var i in lines)
  {
    var line = lines[i];

    if (line === undefined)
    {
      continue;
    }

    // Skip lines without texture filenames
    if (line.indexOf('map_Ka') < 0 && line.indexOf('map_Kd') < 0)
    {
      newText += line += '\n';
      continue;
    }

    // Skip lines which already have /materials/textures
    if (line.indexOf('/materials/textures') > 0)
    {
      newText += line += '\n';
      continue;
    }

    // Add path to filename
    var p = this.mtlLoader.path || '';
    p = p.substr(0, p.lastIndexOf('meshes'));

    line = line.replace('map_Ka ', 'map_Ka ' + p + 'materials/textures/');
    line = line.replace('map_Kd ', 'map_Kd ' + p + 'materials/textures/');

    newText += line += '\n';
  }

  this.applyMaterial(this.mtlLoader.parse(newText));
};

/**
 * Callback when OBJ file has been loaded, proceeds to load MTL.
 * @param {obj} _container - Loaded OBJ.
 */
GZ3D.OBJLoader.prototype.onObjLoaded = function(_container)
{
  this.container = _container;

  // Callback when MTL has been loaded
  // Linter doesn't like `that` being used inside a loop, so we move it outside
  var that = this;
  var onMtlLoaded = function(_text)
    {
      that.loadMTL(_text);
    };

  if (this.container.materialLibraries.length === 0)
  {
    // return if there are no materials to be applied
    this.loadComplete();
    return;
  }

  // Load all MTL files
  if (!this.usingRawFiles)
  {
    for (var i=0; i < this.container.materialLibraries.length; ++i)
    {
      // Load raw .mtl file
      var mtlPath = this.container.materialLibraries[i];

      var fileLoader = new THREE.FileLoader(this.mtlLoader.manager);
      fileLoader.setPath(this.mtlLoader.path);
      fileLoader.load(mtlPath, onMtlLoaded);
    }
  }
  // Use provided MTL file
  else
  {
    this.loadMTL(this.files[1]);
  }
};

