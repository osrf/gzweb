describe('Gui tests', function() {

  beforeEach(function(){
    module('gzangular');
    loadFixtures('myfixture.html');
  });

  var $controller;
  var scene;
  var gui;
  var sdfparser;

  beforeAll(function(){
    // Initializing object used in the test.
    scene = new GZ3D.Scene();
    gui = new GZ3D.Gui(scene);
    sdfparser = new GZ3D.SdfParser(scene, gui);
  });

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names
    // when matching
    $controller = _$controller_;
  }));

  // Initialization test
  describe('Test gzgui init', function() {
    it('Should verify the status of the gui after initialization', function() {

      expect(gui.emitter).toEqual(globalEmitter);

      expect(gui.spawnState).toEqual(null);
      expect(gui.longPressContainerState).toEqual(null);
      expect(gui.showNotifications).toEqual(false);
      expect(gui.openTreeWhenSelected).toEqual(false);
      expect(gui.modelStatsDirty).toEqual(false);

      // On globalEmitter, emitter events

      // Manipulation modes
      expect(scene.manipulationMode).toEqual('view');
      globalEmitter.emit('manipulation_mode', 'translate');
      expect(scene.manipulationMode).toEqual('translate');
      globalEmitter.emit('manipulation_mode', 'rotate');
      expect(scene.manipulationMode).toEqual('rotate');

      expect($('#view-mode').prop('checked')).toEqual(true);

      globalEmitter.emit('show_grid', 'show');
      expect(scene.grid.visible).toEqual(true);
      globalEmitter.emit('show_grid', 'hide');
      expect(scene.grid.visible).toEqual(false);

      expect(scene.modelManipulator.snapDist).toEqual(null);
      globalEmitter.emit('snap_to_grid');
      expect(scene.modelManipulator.snapDist).toEqual(0.5);
      globalEmitter.emit('snap_to_grid');
      expect(scene.modelManipulator.snapDist).toEqual(null);

      expect(gui.showNotifications).toEqual(false);
      globalEmitter.emit('toggle_notifications');
      expect(gui.showNotifications).toEqual(true);

      expect(gui.openTreeWhenSelected).toEqual(false);
      globalEmitter.emit('openTreeWhenSelected');
      expect(gui.openTreeWhenSelected).toEqual(true)
    });
  });

  describe('Test getNameFromPath()', function() {
    it('Should return thr model title given the model path', function() {

      expect(getNameFromPath('box')).toEqual('Box');
      expect(getNameFromPath('spotlight')).toEqual('Spot Light');
      expect(getNameFromPath('stone_10_2_5_1cm')).toEqual(
          'Stone 10 x 2.5 x 1 cm');
      expect(getNameFromPath('depth_camera')).toEqual('Depth Camera');
      expect(getNameFromPath('cinder_block_wide')).toEqual('Cinder Block Wide');
      expect(getNameFromPath('polaris_ranger_xp900_no_roll_cage')).toEqual(
          'Polaris Ranger without roll cage');
    });
  });

  // Test buttons/clicks
  describe('Gui clicks test', function() {

    beforeAll(function(){
      expect(globalEmitter).toBeDefined();
      spyOn(globalEmitter, 'emit');
    });

    beforeEach(function(){
      globalEmitter.emit.calls.reset();
    });

    it('should enter translate mode', function() {

      var spyEvent = spyOnEvent('#translate-mode', 'click')
      $('#translate-mode').click()
      expect('click').toHaveBeenTriggeredOn('#translate-mode')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('manipulation_mode',
          'translate');
    });

    it('should enter view mode', function() {

      var spyEvent = spyOnEvent('#view-mode', 'click')
      $('#view-mode').click()
      expect('click').toHaveBeenTriggeredOn('#view-mode')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('manipulation_mode',
          'view');
    });

    it('should enter rotate mode', function() {

      var spyEvent = spyOnEvent('#rotate-mode', 'click')
      $('#rotate-mode').click()
      expect('click').toHaveBeenTriggeredOn('#rotate-mode')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('manipulation_mode',
          'rotate');
    });

    it('should close tabs when clicking on open one', function() {

      var spyEvent = spyOnEvent('.tab', 'click')
      $('#mainMenuTab').click()
      expect('click').toHaveBeenTriggeredOn('.tab')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', true);
    });

    it('should close tabs when clicking on closePanels class', function() {

      var spyEvent = spyOnEvent('.closePanels', 'click')
      $('.closePanels')[0].click()
      expect('click').toHaveBeenTriggeredOn('.closePanels')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', true);
    });

    it('should start spawning box', function() {

      var spyEvent = spyOnEvent('[id^="header-insert-"]', 'click')
      $('#header-insert-box').click()
      expect('click').toHaveBeenTriggeredOn('[id^="header-insert-"]')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
      expect(globalEmitter.emit).toHaveBeenCalledWith('spawn_entity_start',
          'box');
    });

    it('should play', function() {

      var spyEvent = spyOnEvent('#play', 'click')
      $('#play').click()
      expect('click').toHaveBeenTriggeredOn('#play')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('notification_popup',
          'Physics engine running');
      expect(globalEmitter.emit).toHaveBeenCalledWith('pause', false);
    });

    // TODO: Test clock popup on mobile
    it('should open clock popup', function() {

      // $('#clock').popup();

      // var spyEvent = spyOnEvent('#clock', 'click')
      // $('#clock').click()
      // expect('click').toHaveBeenTriggeredOn('#clock')
      // expect(spyEvent).toHaveBeenTriggered()
      // expect(globalEmitter.emit).not.toHaveBeenCalled();
    });

    it('should reset models', function() {

      var spyEvent = spyOnEvent('#reset-model', 'click')
      $('#reset-model').click()
      expect('click').toHaveBeenTriggeredOn('#reset-model')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('reset', 'model');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should reset world', function() {

      var spyEvent = spyOnEvent('#reset-world', 'click')
      $('#reset-world').click()
      expect('click').toHaveBeenTriggeredOn('#reset-world')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('reset', 'world');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should reset view', function() {

      globalEmitter.emit.calls.reset();
      var spyEvent = spyOnEvent('#reset-view', 'click')
      $('#reset-view').click()
      expect('click').toHaveBeenTriggeredOn('#reset-view')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('view_reset');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should view grid', function() {

      var spyEvent = spyOnEvent('#view-grid', 'click')
      $('#view-grid').click()
      expect('click').toHaveBeenTriggeredOn('#view-grid')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('show_grid', 'toggle');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should view collisions', function() {

      var spyEvent = spyOnEvent('#view-collisions', 'click')
      $('#view-collisions').click()
      expect('click').toHaveBeenTriggeredOn('#view-collisions')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('show_collision');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should view orbit indicator', function() {

      var spyEvent = spyOnEvent('#view-orbit-indicator', 'click')
      $('#view-orbit-indicator').click()
      expect('click').toHaveBeenTriggeredOn('#view-orbit-indicator')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('show_orbit_indicator');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should snap to grid', function() {

      var spyEvent = spyOnEvent('#snap-to-grid', 'click')
      $('#snap-to-grid').click()
      expect('click').toHaveBeenTriggeredOn('#snap-to-grid')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('snap_to_grid');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should open tree when selected', function() {

      var spyEvent = spyOnEvent('#open-tree-when-selected', 'click')
      $('#open-tree-when-selected').click()
      expect('click').toHaveBeenTriggeredOn('#open-tree-when-selected')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('openTreeWhenSelected');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should toggle notifications', function() {

      var spyEvent = spyOnEvent('#toggle-notifications', 'click')
      $('#toggle-notifications').click()
      expect('click').toHaveBeenTriggeredOn('#toggle-notifications')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(2);
      expect(globalEmitter.emit).toHaveBeenCalledWith('toggle_notifications');
      expect(globalEmitter.emit).toHaveBeenCalledWith('closeTabs', false);
    });

    it('should view transparent', function() {

      $('#model-popup').popup();

      var spyEvent = spyOnEvent('#view-transparent', 'click')
      $('#view-transparent').click()
      expect('click').toHaveBeenTriggeredOn('#view-transparent')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('set_view_as',
          'transparent');
    });

    it('should view wireframe', function() {

      $('#model-popup').popup();

      var spyEvent = spyOnEvent('#view-wireframe', 'click')
      $('#view-wireframe').click()
      expect('click').toHaveBeenTriggeredOn('#view-wireframe')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('set_view_as',
          'wireframe');
    });

    it('should not view joints if there isn\'t an entity with joints selected',
      function() {

      $('#model-popup').popup();

      var spyEvent = spyOnEvent('#view-joints', 'click')
      $('#view-joints').click()
      expect('click').toHaveBeenTriggeredOn('#view-joints')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not view COM if there isn\'t an entity with mass selected',
      function() {

      $('#model-popup').popup();

      var spyEvent = spyOnEvent('#view-com', 'click')
      $('#view-com').click()
      expect('click').toHaveBeenTriggeredOn('#view-com')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not view inertia if there isn\'t an entity with mass selected',
      function() {

      $('#model-popup').popup();

      var spyEvent = spyOnEvent('#view-inertia', 'click')
      $('#view-inertia').click()
      expect('click').toHaveBeenTriggeredOn('#view-inertia')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit).not.toHaveBeenCalled();
    });

    it('should delete entity', function() {

      $('#model-popup').popup();

      var spyEvent = spyOnEvent('#delete-entity', 'click')
      $('#delete-entity').click()
      expect('click').toHaveBeenTriggeredOn('#delete-entity')
      expect(spyEvent).toHaveBeenTriggered()
      expect(globalEmitter.emit.calls.count()).toEqual(1);
      expect(globalEmitter.emit).toHaveBeenCalledWith('delete_entity');

    });
  });
});
