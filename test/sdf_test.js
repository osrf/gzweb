var emitter = new EventEmitter2({ verbose: true });

describe("Sdf Parser tests", function() {

  // beforeEach(module('gzangular'));

  // Initializating object used in the test.
  scene = new GZ3D.Scene();
  gui = new GZ3D.Gui(scene);
  iface = new GZ3D.GZIface(scene, gui);
  sdfparser = new GZ3D.SdfParser(scene, gui, iface);
  sdfparser.init();
  spawnModel = new GZ3D.SpawnModel(scene);
  spawnModel.init();

  describe("parse color test, string to json", function() {
    it("should return a json color", function() {
      var color = {r: 1, g: 1, b: 1, a: 1};
      expect(color).toEqual(sdfparser.parseColor("1 1 1 1"));
    });
  });

  describe("parse 3Dvector test, string to json", function() {
    it("should return a json", function() {
      var size = {x: 1, y: 1, z: 1};
      expect(size).toEqual(sdfparser.parseSize("1 1 1"));
    });
  });

  describe("parse size test, string to json", function() {
    it("should return a json size object", function() {
      var color = {r: 1, g: 1, b: 1, a: 1};
      expect(color).toEqual(sdfparser.parseColor("1 1 1 1"));
    });
  });

  describe("parse scale test, string to Vector3", function() {
    it("should return a vector3 object", function() {
      var vec = new THREE.Vector3(0.1,0.4,0.66);
      expect(vec).toEqual(sdfparser.parseScale("0.1 0.4 0.66"));
    });
  });

  describe("spawn a light from SDF", function() {
    it("should return a json", function() {
      var sdfLight = '<?xml version="1.0" ?>'+
      '<sdf version="1.5">'+
        '<light type="directional" name="sun">'+
          '<cast_shadows>true</cast_shadows>'+
          '<pose>0 0 10 0 0 0</pose>'+
          '<diffuse>0.8 0.8 0.8 1</diffuse>'+
          '<specular>0.2 0.2 0.2 1</specular>'+
          '<attenuation>'+
            '<range>1000</range>'+
            '<constant>0.9</constant>'+
            '<linear>0.01</linear>'+
            '<quadratic>0.001</quadratic>'+
          '</attenuation>'+
          '<direction>-0.5 0.1 -0.9</direction>'+
        '</light>'+
      '</sdf>';
      expect('DirectionalLight').toEqual(sdfparser.spawnFromSDF(sdfLight).type);
    });
  });

  describe("spawn a model from SDF, and verify it's position", function() {
    it("should return a json object", function() {

      var position = {x:3,y:1,z:1};
      var rotation = {x:0.5,y:1,z:0};
      var sdf = sdfparser.createBoxSDF(position, rotation);

      // scene.spawnModel.start('box',function(obj)
      // {
      //   emitter.emit('entityCreated', obj, 'box');
      // });

      expect(position.x).toEqual(sdfparser.spawnFromSDF(sdf).position.x);
      expect(position.y).toEqual(sdfparser.spawnFromSDF(sdf).position.y);
      expect(position.z).toEqual(sdfparser.spawnFromSDF(sdf).position.z);      
      // How does it transform the rotation angels into Eulers?
      // expect(rotation.x).toEqual(sdfparser.spawnFromSDF(sdf).rotation.x);
      // expect(rotation.y).toEqual(sdfparser.spawnFromSDF(sdf).rotation.y);
      // expect(rotation.z).toEqual(sdfparser.spawnFromSDF(sdf).rotation.z);      

    });
  });

  // the testing server doesn't look in the right place 
  // for the assets
  // describe("loading a model by it's name", function() {
  //   it("test by verifing the model name", function() {

  //     var sdf = sdfparser.loadSDF('arm_part');
  //     expect('arm_part').toEqual(sdfparser.spawnFromSDF(sdf).name);
  //   });
  // });

  // TODO: test sdfParser.createMaterial
  // have to be able to load the materials with no gzserver
  // or an another solution


});
