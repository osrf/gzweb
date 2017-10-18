jasmine.getFixtures().fixturesPath = 'base/gz3d/test/fixture';

describe('Gui tests', function() {

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
      var scene = new GZ3D.Scene();
      var gui = new GZ3D.Gui(scene);
      var sdfparser = new GZ3D.SdfParser(scene, gui);


      // Initialize test
      describe('Test gzgui init', function() {
        it('Should verify the status of the gui after initialization', function() {

          expect(gui.spawnState).toEqual(null);
          expect(gui.longPressContainerState).toEqual(null);
          expect(gui.showNotifications).toEqual(false);
          expect(gui.openTreeWhenSelected).toEqual(false);
          expect(gui.modelStatsDirty).toEqual(false);

          // On guiEvents, emitter events

          // Manipulation modes
          expect(scene.manipulationMode).toEqual('view');
          guiEvents.emit('manipulation_mode', 'translate');
          expect(scene.manipulationMode).toEqual('translate');
          guiEvents.emit('manipulation_mode', 'rotate');
          expect(scene.manipulationMode).toEqual('rotate');

          expect($('#view-mode').prop('checked')).toEqual(true);

          guiEvents.emit('show_grid', 'show');
          expect(scene.grid.visible).toEqual(true);
          guiEvents.emit('show_grid', 'hide');
          expect(scene.grid.visible).toEqual(false);

          expect(scene.modelManipulator.snapDist).toEqual(null);
          guiEvents.emit('snap_to_grid');
          expect(scene.modelManipulator.snapDist).toEqual(0.5);
          guiEvents.emit('snap_to_grid');
          expect(scene.modelManipulator.snapDist).toEqual(null);

          expect(gui.showNotifications).toEqual(false);
          guiEvents.emit('toggle_notifications');
          expect(gui.showNotifications).toEqual(false);

          // TODO: test set_view_as after finishing model spawning test.

          // TODO: test delete_entity after finishing model spawning test.
        });
      });

      // Intialize test
      describe('Test getNameFromPath()', function() {
        it('Should return thr model title given the model path', function() {

          expect(getNameFromPath('box')).toEqual('Box');
          expect(getNameFromPath('spotlight')).toEqual('Spot Light');
          expect(getNameFromPath('stone_10_2_5_1cm')).toEqual('Stone 10 x 2.5 x 1 cm');
          expect(getNameFromPath('depth_camera')).toEqual('Depth Camera');
          expect(getNameFromPath('cinder_block_wide')).toEqual('Cinder Block Wide');
          expect(getNameFromPath('polaris_ranger_xp900_no_roll_cage')).toEqual('Polaris Ranger without roll cage');
        });
      });


      // Test buttons/clicks
      describe('Gui clicks test', function() {
        it('Should ensure all clickable elements are working', function() {

          var spyEvent = spyOnEvent('#translate-mode', 'click')
          $('#translate-mode').click()
          expect('click').toHaveBeenTriggeredOn('#translate-mode')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-mode', 'click')
          $('#view-mode').click()
          expect('click').toHaveBeenTriggeredOn('#view-mode')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#rotate-mode', 'click')
          $('#rotate-mode').click()
          expect('click').toHaveBeenTriggeredOn('#rotate-mode')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('.tab', 'click')
          $('.tab').click()
          expect('click').toHaveBeenTriggeredOn('.tab')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('.closePanels', 'click')
          $('.closePanels').click()
          expect('click').toHaveBeenTriggeredOn('.closePanels')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('[id^="header-insert-"]', 'click')
          $('[id^="header-insert-"]').click()
          expect('click').toHaveBeenTriggeredOn('[id^="header-insert-"]')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#play', 'click')
          $('#play').click()
          expect('click').toHaveBeenTriggeredOn('#play')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#clock', 'click')
          $('#clock').click()
          expect('click').toHaveBeenTriggeredOn('#clock')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#reset-model', 'click')
          $('#reset-model').click()
          expect('click').toHaveBeenTriggeredOn('#reset-model')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#reset-world', 'click')
          $('#reset-world').click()
          expect('click').toHaveBeenTriggeredOn('#reset-world')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#reset-view', 'click')
          $('#reset-view').click()
          expect('click').toHaveBeenTriggeredOn('#reset-view')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-mode', 'click')
          $('#view-mode').click()
          expect('click').toHaveBeenTriggeredOn('#view-mode')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-grid', 'click')
          $('#view-grid').click()
          expect('click').toHaveBeenTriggeredOn('#view-grid')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-collisions', 'click')
          $('#view-collisions').click()
          expect('click').toHaveBeenTriggeredOn('#view-collisions')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-orbit-indicator', 'click')
          $('#view-orbit-indicator').click()
          expect('click').toHaveBeenTriggeredOn('#view-orbit-indicator')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#snap-to-grid', 'click')
          $('#snap-to-grid').click()
          expect('click').toHaveBeenTriggeredOn('#snap-to-grid')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#open-tree-when-selected', 'click')
          $('#open-tree-when-selected').click()
          expect('click').toHaveBeenTriggeredOn('#open-tree-when-selected')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#toggle-notifications', 'click')
          $('#toggle-notifications').click()
          expect('click').toHaveBeenTriggeredOn('#toggle-notifications')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-transparent', 'click')
          $('#view-transparent').click()
          expect('click').toHaveBeenTriggeredOn('#view-transparent')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-wireframe', 'click')
          $('#view-wireframe').click()
          expect('click').toHaveBeenTriggeredOn('#view-wireframe')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#view-joints', 'click')
          $('#view-joints').click()
          expect('click').toHaveBeenTriggeredOn('#view-joints')
          expect(spyEvent).toHaveBeenTriggered()

          var spyEvent = spyOnEvent('#delete-entity', 'click')
          $('#delete-entity').click()
          expect('click').toHaveBeenTriggeredOn('#delete-entity')
          expect(spyEvent).toHaveBeenTriggered()
        });
      });
});
