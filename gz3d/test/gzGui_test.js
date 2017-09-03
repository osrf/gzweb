jasmine.getFixtures().fixturesPath = 'base/gz3d/test/fixture';

describe('Sdf Parser tests', function() {

      beforeEach(function(){
          module('gzangular');
          loadFixtures('myfixture.html');                   
        });

      var $controller;

      beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
      }));

      // Initializing object used in the test.
      scene = new GZ3D.Scene();
      gui = new GZ3D.Gui(scene);
      iface = new GZ3D.GZIface(scene, gui);
      sdfparser = new GZ3D.SdfParser(scene, gui, iface);

      describe('Test gzscene Set Pose', function() {
        it('Position and orientation of the returned model should match', function() {
          
          var model, pos, ori, quaternion;
          pos = new THREE.Vector3(-1,0.5,3);
          ori = new THREE.Quaternion(0.1,-0.3,2,0);
          model = new THREE.Object3D();
          scene.setPose(model, pos, ori);
          expect(model.position).toEqual(pos);

          quaternion = model.quaternion;
          expect(quaternion.x).toEqual(ori.x);
          expect(quaternion.y).toEqual(ori.y);
          expect(quaternion.z).toEqual(ori.z);
          expect(quaternion.w).toEqual(ori.w);

          // var evt = document.createEvent("MouseEvents");
          // evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
          // document.body.dispatchEvent(evt);
        });
      });

      describe('Test gzscene Set SDFParser', function() {
        it('Should return scene\'s SdfParser ', function() {

          scene.setSDFParser(sdfparser);
          expect(scene.spawnModel.sdfParser).toEqual(sdfparser);
        });
      });


      // Test manipulation_mode
      describe('Test manipulation mode', function() {
        // For some reasone that I yet to discover, 
        // I've to do this for the eventEmiiter to work!
        // else we get "Error: cannot call methods on popup prior \
        // to initialization; attempted to call method 'close'"
        describe('Reintialize', function() {
          // Initializing object used in the test.
          scene = new GZ3D.Scene();
          gui = new GZ3D.Gui(scene);
          iface = new GZ3D.GZIface(scene, gui);
          sdfparser = new GZ3D.SdfParser(scene, gui, iface);
        });

        it('Should change manipulation mode to translate', function() {
          guiEvents.emit('manipulation_mode', 'translate');
            
          expect(scene.manipulationMode).not.toEqual('view');  
          expect(scene.manipulationMode).toEqual('translate');
        });              
      });



});
