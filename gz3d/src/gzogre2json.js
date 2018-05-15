/**
 * @constructor
 */
GZ3D.Ogre2Json = function()
{
  this.materials = {};
};

/**
 * Load materials from a .material file
 * @param _url Full URL to .material file
 */
GZ3D.Ogre2Json.prototype.LoadFromUrl = function(_url)
{
  var that = this;

  var fileLoaded = function(_text)
  {
    that.Parse(_text);
  };

  var fileLoader = new THREE.FileLoader();
  fileLoader.load(_url, fileLoaded);

  return true;
};

/**
 * Parse material script and store it into this.materials
 * @param _str Material script as a string.
 */
GZ3D.Ogre2Json.prototype.Parse = function(_str)
{
  console.log(_str);
  this.materials['Beer/Diffuse'] =
  {
    texture: 'beer.png',
  };
};
