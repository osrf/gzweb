describe('GzOgre2Json tests', function() {

  describe('Parse material strings', function() {

    it('should parse deep properties', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material Beer/Diffuse
{
  technique
  {
    pass
    {
      texture_unit
      {
        texture beer.png
        filtering anistropic
        max_anisotropy 16
      }
    }
  }
}
`;

      // Parse
      expect(o2j.Parse(str)).toBeTruthy();

      // Check materialObj
      expect(o2j.materialObj).toBeDefined();
      expect(o2j.materialObj.length).toEqual(1);
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
            ).toBeDefined();
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
            ).toBeDefined();
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
            ).toBeDefined();
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
            ).toBeDefined();

      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['texture']
            ).toBeDefined();
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['texture']
            ).toEqual('beer.png');

      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['filtering']
            ).toBeDefined();
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['filtering']
            ).toEqual('anistropic');

      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['max_anisotropy']
            ).toBeDefined();
      expect(o2j.materialObj
                 [0]
                 ['Beer/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['max_anisotropy']
            ).toEqual('16');

      // Check materials
      expect(o2j.materials).toBeDefined();
      expect(o2j.materials
                 ['Beer/Diffuse']
            ).toBeDefined();
      expect(o2j.materials
                 ['Beer/Diffuse']
                 ['texture']
            ).toBeDefined();
      expect(o2j.materials
                 ['Beer/Diffuse']
                 ['texture']
            ).toEqual('beer.png');

    });

    it('should parse array properties', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material many_arrays
{
  technique
  {
    pass
    {
      ambient 0.7 0.8 0.9 1.0
      emissive 0.2 0.3 0.4

      texture_unit
      {
        texture coupling_hexagon.png
        scale 0.3 0.4
      }
    }
  }
}
`;

      // Parse
      expect(o2j.Parse(str)).toBeTruthy();

      // Check materialObj
      expect(o2j.materialObj).toBeDefined();
      expect(o2j.materialObj.length).toEqual(1);

      const ambient = o2j.materialObj
                 [0]
                 ['many_arrays']
                 ['technique']
                 ['pass']
                 ['ambient']
      expect(ambient).toBeDefined();
      expect(ambient.length).toEqual(4);
      expect(ambient[0]).toEqual("0.7");
      expect(ambient[1]).toEqual("0.8");
      expect(ambient[2]).toEqual("0.9");
      expect(ambient[3]).toEqual("1.0");

      const emissive = o2j.materialObj
                 [0]
                 ['many_arrays']
                 ['technique']
                 ['pass']
                 ['emissive']
      expect(emissive).toBeDefined();
      expect(emissive.length).toEqual(3);
      expect(emissive[0]).toEqual("0.2");
      expect(emissive[1]).toEqual("0.3");
      expect(emissive[2]).toEqual("0.4");

      const scale = o2j.materialObj
                 [0]
                 ['many_arrays']
                 ['technique']
                 ['pass']
                 ['texture_unit']
                 ['scale']
      expect(scale).toBeDefined();
      expect(scale.length).toEqual(2);
      expect(scale[0]).toEqual("0.3");
      expect(scale[1]).toEqual("0.4");

      // Check materials
      expect(o2j.materials).toBeDefined();
      expect(o2j.materials
                 ['many_arrays']
            ).toBeDefined();
      expect(o2j.materials
                 ['many_arrays']
                 ['texture']
            ).toBeDefined();
      expect(o2j.materials
                 ['many_arrays']
                 ['texture']
            ).toEqual('coupling_hexagon.png');
    });

    it('should parse multiple properties', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material Dumpster/Diffuse
{
  receive_shadows off
  technique
  {
    pass
    {
      texture_unit
      {
        texture Dumpster_Diffuse.png
      }
    }
  }
}

material Dumpster/Specular
{
  receive_shadows off
  technique
  {
    pass
    {
      texture_unit
      {
        texture Dumpster_Spec.png
      }
    }
  }
}
`;

      // Parse
      expect(o2j.Parse(str)).toBeTruthy();

      // Check materialObj
      expect(o2j.materialObj).toBeDefined();
      expect(o2j.materialObj.length).toEqual(2);

      expect(o2j.materialObj
                 [0]
                 ['Dumpster/Diffuse']
            ).toBeDefined();

      expect(o2j.materialObj
                 [1]
                 ['Dumpster/Specular']
            ).toBeDefined();

      // Check materials
      expect(o2j.materials).toBeDefined();

      expect(o2j.materials
                 ['Dumpster/Diffuse']
                 ['texture']
            ).toEqual('Dumpster_Diffuse.png');

      expect(o2j.materials
                 ['Dumpster/Specular']
                 ['texture']
            ).toEqual('Dumpster_Spec.png');
    });

    it('should parse sibling objects', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material FireStation/Diffuse
{
  receive_shadows off
  technique
  {
    pass
    {
      texture_unit
      {
        texture FireStation_Diffuse.png
      }

      rtshader_system
      {
        lighting_stage normal_map FireStation_Normal.png tangent_space 0
      }
    }
  }
}
`;

      // Parse
      expect(o2j.Parse(str)).toBeTruthy();

      // Check materialObj
      expect(o2j.materialObj).toBeDefined();
      expect(o2j.materialObj.length).toEqual(1);

      expect(o2j.materialObj
                 [0]
                 ['FireStation/Diffuse']
                 ['technique']
                 ['pass']
                 ['texture_unit']
            ).toBeDefined();

      expect(o2j.materialObj
                 [0]
                 ['FireStation/Diffuse']
                 ['technique']
                 ['pass']
                 ['rtshader_system']
            ).toBeDefined();

      // Check materials
      expect(o2j.materials).toBeDefined();

      expect(o2j.materials
                 ['FireStation/Diffuse']
                 ['texture']
            ).toEqual('FireStation_Diffuse.png');
    });
  });

});
