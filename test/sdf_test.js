describe('Sdf Parser tests', function() {

  // Initializing object used in the test.
  scene = new GZ3D.Scene();
  gui = new GZ3D.Gui(scene);
  iface = new GZ3D.GZIface(scene, gui);
  sdfparser = new GZ3D.SdfParser(scene, gui, iface);

  describe('Parse color test, string to json', function() {
    it('should return a json color', function() {
      var color = {r: 212, g: 199, b: 0.2, a: 0.9};
      expect(sdfparser.parseColor('212 199 0.2 0.9')).toEqual(color);
      color = {r: 0, g: 300, b: 0.0001, a: -278};
      expect(sdfparser.parseColor('0 300 0.0001 -278')).toEqual(color);
      // Shouldn't equal
      expect(sdfparser.parseColor('0 300 0.0001-278')).not.toEqual(color);
      expect(sdfparser.parseColor('0 300 0.0001')).not.toEqual(color);
      expect(sdfparser.parseColor('0 A 0.0001-278')).not.toEqual(color);
    });
  });

  describe('Parse string size test, string to json', function() {
    it('should return a json', function() {
      var size = {x: 0.092, y: 1, z: 1.1};
      expect(sdfparser.parseSize('0.092 1 1.1')).toEqual(size);
      // Shouldn't equal
      expect(sdfparser.parseSize('0.0 9.2. 11.1')).not.toEqual(size);
      expect(sdfparser.parseSize('11 2121')).not.toEqual(size);
      expect(sdfparser.parseSize('x 21 z')).not.toEqual(size);
    });
  });

  describe('Parse 3DVector test, string to json', function() {
    it('should return a json object', function() {
      var vec = {x: 1.001, y: 3, z: 0.0001};
      expect(sdfparser.parse3DVector('1.001 3 0.0001')).toEqual(vec);
      // Shouldn't equal
      expect(sdfparser.parse3DVector('1.001 3 0.0.0001')).not.toEqual(vec);
      expect(sdfparser.parse3DVector('1 21')).not.toEqual(vec);
      expect(sdfparser.parse3DVector('a 20 c')).not.toEqual(vec);
    });
  });

  describe('Parse scale test, string to Vector3', function() {
    it('should return a vector3 object', function() {
      var vec = new THREE.Vector3(0.1,0.4,0.66);
      expect(sdfparser.parseScale('0.1 0.4 0.66')).toEqual(vec);
      // Shouldn't equal
      expect(sdfparser.parseScale('0..1 0.4 0.66')).not.toEqual(vec);
      expect(sdfparser.parseScale('0.104 0.66')).not.toEqual(vec);
      expect(sdfparser.parseScale('1 2 A')).not.toEqual(vec);
    });
  });

  describe('Spawn a light from SDF', function() {
    it('Should create a THREE.Object3D of type directional light', function() {
      var sdfLight, obj3D;

      sdfLight = '<?xml version="1.0" ?>'+
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

      obj3D = sdfparser.spawnFromSDF(sdfLight);
      expect(obj3D.color.r).toEqual(0.8);
      expect(obj3D.color.g).toEqual(0.8);
      expect(obj3D.color.b).toEqual(0.8);
      expect(obj3D.color.b).toEqual(1);
      expect(obj3D.intensity).toEqual(0.9);
      expect(obj3D.type).toEqual('DirectionalLight');
      expect(obj3D.name).toEqual('sun');
    });
  });

  describe('Spawn a box from SDF, initialize and verify its position', function() {
    it('Should spawn in the right position', function() {
      var pose, rotation, sdf, obj3D;

      position = {x:3, y:1, z:1};
      rotation = {x:0.5, y:1, z:0};
      sdf = sdfparser.createBoxSDF(position, rotation);
      obj3D = sdfparser.spawnFromSDF(sdf);
      expect(obj3D.position.x).toEqual(position.x);
      expect(obj3D.position.y).toEqual(position.y);
      expect(obj3D.position.z).toEqual(position.z);
      // Shouldn't equal
      expect(obj3D.position.z).not.toEqual(0.9);
      // How does it transform the rotation angels into Eulers?
      // expect(rotation.x).toEqual(sdfparser.spawnFromSDF(sdf).rotation.x);
      // expect(rotation.y).toEqual(sdfparser.spawnFromSDF(sdf).rotation.y);
      // expect(rotation.z).toEqual(sdfparser.spawnFromSDF(sdf).rotation.z);      
    });
  });

  // TODO: test sdfParser.createMaterial
  // have to be able to load the materials with no gzserver
  // or an another solution

});
