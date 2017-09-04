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
