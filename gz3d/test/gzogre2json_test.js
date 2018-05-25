describe('GzOgre2Json tests', function() {

  const utilsPath = 'http://localhost:9876/base/gz3d/test/utils/';

  describe('Parse material strings', function() {

    it('should parse deep properties', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material Beer/Diffuse
{
  technique
  {
    pass
    {
      depth_check off
      depth_write on

      texture_unit tex
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

      var pass = o2j.materialObj
          [0]
          ['Beer/Diffuse']
          ['technique']
          ['pass'];
      expect(pass).toBeDefined();

      expect(pass['depth_check']).toBeDefined();
      expect(pass['depth_check']).toEqual('off');

      expect(pass['depth_write']).toBeDefined();
      expect(pass['depth_write']).toEqual('on');

      var textUnit = pass['texture_unit'];
      expect(textUnit).toBeDefined();

      expect(textUnit['texture']).toBeDefined();
      expect(textUnit['texture']).toEqual('beer.png');

      expect(textUnit['filtering']).toBeDefined();
      expect(textUnit['filtering']).toEqual('anistropic');

      expect(textUnit['max_anisotropy']).toBeDefined();
      expect(textUnit['max_anisotropy']).toEqual('16');

      // Check materials
      expect(o2j.materials).toBeDefined();

      const mat = o2j.materials['Beer/Diffuse'];
      expect(mat).toBeDefined();

      expect(mat['texture']).toBeDefined();
      expect(mat['texture']).toEqual('beer.png');

      expect(mat['depth_check']).toBeDefined();
      expect(mat['depth_check']).toEqual(false);

      expect(mat['depth_write']).toBeDefined();
      expect(mat['depth_write']).toEqual(true);
    });

    it('should parse array properties', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material many_arrays
{
  technique
  {
    pass
    {
      ambient 0.7   0.8   0.9    1.0
      emissive 0.2 0.3 0.4
      specular 1.0 0.9 0.8 0.7
      diffuse 0.0 0.0 0.0 1.0

      texture_unit
      {
        texture coupling_hexagon.png
        scale 0.3 0.4
        alpha_op_ex source1 src_manual src_current 0.5
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

      const pass = o2j.materialObj
                 [0]
                 ['many_arrays']
                 ['technique']
                 ['pass'];
      expect(pass).toBeDefined();

      expect(pass['ambient']).toBeDefined();
      expect(pass['ambient'].length).toEqual(4);
      expect(pass['ambient']).toEqual(['0.7', '0.8', '0.9', '1.0']);

      expect(pass['emissive']).toBeDefined();
      expect(pass['emissive'].length).toEqual(3);
      expect(pass['emissive']).toEqual(['0.2', '0.3', '0.4']);

      expect(pass['specular']).toBeDefined();
      expect(pass['specular'].length).toEqual(4);
      expect(pass['specular']).toEqual(['1.0', '0.9', '0.8', '0.7']);

      expect(pass['diffuse']).toBeDefined();
      expect(pass['diffuse'].length).toEqual(4);
      expect(pass['diffuse']).toEqual(['0.0', '0.0', '0.0', '1.0']);

      expect(pass['texture_unit']['scale']).toBeDefined();
      expect(pass['texture_unit']['scale'].length).toEqual(2);
      expect(pass['texture_unit']['scale']).toEqual(['0.3', '0.4']);

      expect(pass['texture_unit']['alpha_op_ex']).toBeDefined();
      expect(pass['texture_unit']['alpha_op_ex'].length).toEqual(4);
      expect(pass['texture_unit']['alpha_op_ex']).toEqual(['source1',
          'src_manual', 'src_current', '0.5']);

      // Check materials
      expect(o2j.materials).toBeDefined();

      var mat = o2j.materials['many_arrays'];
      expect(mat).toBeDefined();

      expect(mat['texture']).toBeDefined();
      expect(mat['texture']).toEqual('coupling_hexagon.png');

      expect(mat['scale']).toBeDefined();
      expect(mat['scale']).toEqual([0.3, 0.4]);

      expect(mat['ambient']).toBeDefined();
      expect(mat['ambient']).toEqual([0.7, 0.8, 0.9, 1.0]);

      expect(mat['emissive']).toBeDefined();
      expect(mat['emissive']).toEqual([0.2, 0.3, 0.4]);

      expect(mat['specular']).toBeDefined();
      expect(mat['specular']).toEqual([1.0, 0.9, 0.8, 0.7]);

      expect(mat['diffuse']).toBeDefined();
      expect(mat['diffuse']).toEqual([0.0, 0.0, 0.0, 1.0]);

      expect(mat['opacity']).toBeDefined();
      expect(mat['opacity']).toEqual(0.5);
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

    it('should gracefully handle malformed materials', function() {

      let o2j = new GZ3D.Ogre2Json();

      expect(o2j.Parse("banana")).not.toBeTruthy();
      expect(o2j.Parse("{}")).not.toBeTruthy();
    });

    it('should ignore comments', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material FireStation/Diffuse
{
  // inline comment
  receive_shadows off   // another comment
  /* property value */
  transparency_casts_shadows on /* more comments */
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
            ).toBeDefined();

      expect(o2j.materialObj
                 [0]
                 ['FireStation/Diffuse']
                 ['receive_shadows']
            ).toBeDefined();

      expect(o2j.materialObj
                 [0]
                 ['FireStation/Diffuse']
                 ['property']
            ).not.toBeDefined();

      expect(o2j.materialObj
                 [0]
                 ['FireStation/Diffuse']
                 ['transparency_casts_shadows']
            ).toBeDefined();
    });

    it('should handle programs', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material OakTree/Branch
{
}

vertex_program caster_vp_glsl glsl
{
  source caster_vp.glsl
}

material OakTree/Bark
{
}

fragment_program caster_fp_glsl glsl
{
  source caster_fp.glsl
}
`;

      // Parse
      expect(o2j.Parse(str)).toBeTruthy();

      // Check materialObj
      expect(o2j.materialObj).toBeDefined();
      expect(o2j.materialObj.length).toEqual(4);

      // Check materials exist
      expect(o2j.materialObj[0]['OakTree/Branch']).toBeDefined();
      expect(o2j.materialObj[2]['OakTree/Bark']).toBeDefined();

      // Check programs exist
      expect(o2j.materialObj[1]['vertex_program_caster_vp_glsl_glsl'])
          .toBeDefined();
      expect(o2j.materialObj[3]['fragment_program_caster_fp_glsl_glsl'])
          .toBeDefined();
    });

    it('should handle program refs and inline {}', function() {

      let o2j = new GZ3D.Ogre2Json();
      const str = `material OakTree/shadow_caster_alpha
{ technique
  {
    pass
    {
      vertex_program_ref caster_vp_glsl
      {
      }

      fragment_program_ref caster_fp_glsl {}
    }
  }
}
`;

      // Parse
      expect(o2j.Parse(str)).toBeTruthy();

      // Check refs
      expect(o2j.materialObj
          [0]['OakTree/shadow_caster_alpha']
          ['technique']
          ['pass']
          ['vertex_program_ref_caster_vp_glsl']
          ).toBeDefined();

      // Check refs
      expect(o2j.materialObj
          [0]['OakTree/shadow_caster_alpha']
          ['technique']
          ['pass']
          ['fragment_program_ref_caster_fp_glsl']
          ).toBeDefined();
    });
  });

  describe('Loading from URL', function() {

    it('should load existing material', function(done) {

      let o2j = new GZ3D.Ogre2Json();
      o2j.LoadFromUrl(utilsPath + 'beer/materials/scripts/beer.material')
        .then((success) =>
          {
            expect(success).toEqual(true);
            expect(o2j.materials['Beer/Diffuse']).toBeDefined();
            done();
          })
        .catch(() =>
          {
            fail();
          })
    });

    it('should fail to load inexistent material', function(done) {

      let o2j = new GZ3D.Ogre2Json();
      o2j.LoadFromUrl(utilsPath + 'bad/bad.material')
        .then(() =>
          {
            fail();
          })
        .catch((error) =>
          {
            expect(error).toEqual('Not Found');
            done();
          })
    });

    it('should fail to load malformed material', function(done) {

      let o2j = new GZ3D.Ogre2Json();
      o2j.LoadFromUrl(utilsPath + 'beer/materials/scripts/bad.material')
        .then((success) =>
          {
            expect(success).toEqual(false);
            done();
          })
        .catch(() =>
          {
            fail();
          })
    });
  });

});
