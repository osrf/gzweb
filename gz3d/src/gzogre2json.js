/**
 * @constructor
 */
GZ3D.Ogre2Json = function()
{
  // Keeps the whole material file as an Object
  this.materialObj = {};

  // Keeps all materials in the format needed by GZ3D.SdfParser
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
  if (_str.indexOf('material') !== 0)
  {
    console.err('Missing "material" in:');
    console.err(_str);
    return false;
  }

  var str = _str;

  // Remove initial "material "
  str = str.replace('material ','');

  // Remove leading and trailing whitespaces per line
  str = str.replace(/^\s+/gm,'');
  str = str.replace(/\s+\Z/gm,'');

  // Add comma to end of lines that have space
  str = str.replace(/(.* .*)/g,'$&,');

  // Remove new lines
  str = str.replace(/\r?\n|\r/g,'');

  // Add key-value separators
  str = str.replace(/\s/g, ': ');
  str = str.replace(/{/g, ': {');

  // Add surrounding brackets
  str = '{' + str + '}';

  // Wrap keys and values with double quotes
  str = str.replace(/([\w/\.]+)/g, '"$&"');

  // Remove comma from last property in a sequence
  str = str.replace(/",}/g, '"}');

  // Parse JSON
  try
  {
    this.fullJson = JSON.parse(str);
  }
  catch(e)
  {
    console.err('Failed to parse JSON. Original string:');
    console.err(_str);
    console.err('Modified string:');
    console.err(str);
    return false;
  }

  // Arrange materials array so that GZ3d.SdfParser can consume it
  for (var matName in this.fullJson)
  {
    var matValue = this.fullJson[matName];
    if (typeof matValue !== 'object')
    {
      console.err('Failed to parse material [' + matName + ']');
      continue;
    }

    var texture = _.get(this.fullJson, matName + '.technique.pass.texture_unit.texture');
    if (texture !== undefined)
    {
      this.materials[matName] =
      {
        'texture': texture
      };
    }
  }

  return true;
};
