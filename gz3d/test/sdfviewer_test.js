describe('SDFviewer related tests', function() {

    var scene = new GZ3D.Scene();
    var sdfparser = new GZ3D.SdfParser(scene);

    describe('Add a model to the scene using custom urls', function() {
      it('should add a model to the scene and then removes it', function() {

        // eslint-disable-next-line max-len
        var urls = ['https://staging-api.ignitionfuel.org/1.0/models/47d0a5c4-5e34-4f95-a1d9-3f00ef86d6f7/files/model.sdf',
        // eslint-disable-next-line max-len
        'https://staging-api.ignitionfuel.org/1.0/models/47d0a5c4-5e34-4f95-a1d9-3f00ef86d6f7/files/meshes/number.dae'];

        sdfparser.usingFilesUrls = true;
        sdfparser.addUrl(urls[0]);
        sdfparser.addUrl(urls[1]);

        var obj = sdfparser.loadSDF();
        scene.add(obj);

        model = scene.getByName('number1');

        expect(model).not.toEqual(undefined);
        scene.remove(model);
        model = scene.getByName('number1');
        expect(model).toEqual(undefined);
    });
  });
});
