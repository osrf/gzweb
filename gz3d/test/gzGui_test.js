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

      GZ3D.Gui.prototype.init = function()
      {
        this.spawnState = null;
        this.longPressContainerState = null;
        this.showNotifications = false;
        this.openTreeWhenSelected = false;
        this.modelStatsDirty = false;
      
        var that = this;
      
        // throttle model pose updates, otherwise complex model kills framerate
        setInterval(function() {
          if (that.modelStatsDirty)
          {
            that.updateStats();
            that.modelStatsDirty = false;
          }
        }, 20);
      
        // On guiEvents, emitter events
        guiEvents.on('manipulation_mode',
            function(mode)
            {
              that.scene.setManipulationMode(mode);
              var space = that.scene.modelManipulator.space;
      
              if (mode === 'view')
              {
                guiEvents.emit('notification_popup', 'View mode');
              }
              else
              {
                guiEvents.emit('notification_popup',
                    mode.charAt(0).toUpperCase()+
                    mode.substring(1)+' mode in '+
                    space.charAt(0).toUpperCase()+
                    space.substring(1)+' space');
              }
            }
        );
      
        // Create temp model
        guiEvents.on('spawn_entity_start', function(entity)
            {
              // manually trigger view mode
              that.scene.setManipulationMode('view');
              $('#view-mode').prop('checked', true);
              $('input[type="radio"]').checkboxradio('refresh');
      
              var name = getNameFromPath(entity);
      
              that.spawnState = 'START';
              that.scene.spawnModel.start(entity,function(obj)
                  {
                    that.emitter.emit('entityCreated', obj, entity);
                  });
              guiEvents.emit('notification_popup',
                  'Place '+name+' at the desired position');
            }
        );
      
        // Move temp model by touch
        guiEvents.on('spawn_entity_move', function(event)
            {
              that.spawnState = 'MOVE';
              that.scene.spawnModel.onTouchMove(event,false);
            }
        );
        // Place temp model by touch
        guiEvents.on('spawn_entity_end', function()
            {
              if (that.spawnState === 'MOVE')
              {
                that.scene.spawnModel.onTouchEnd();
              }
              that.spawnState = null;
            }
        );
      
        guiEvents.on('world_reset', function()
            {
              that.emitter.emit('reset', 'world');
              guiEvents.emit('notification_popup','Reset world');
            }
        );
      
        guiEvents.on('model_reset', function()
            {
              that.emitter.emit('reset', 'model');
              guiEvents.emit('notification_popup','Reset model poses');
            }
        );
      
        guiEvents.on('view_reset', function()
            {
              that.scene.resetView();
              guiEvents.emit('notification_popup','Reset view');
            }
        );
      
        guiEvents.on('pause', function(paused)
            {
              that.emitter.emit('pause', paused);
            }
        );
      
        guiEvents.on('show_collision', function()
            {
              that.scene.showCollision(!that.scene.showCollisions);
              if(!that.scene.showCollisions)
              {
                $('#view-collisions').buttonMarkup({icon: 'false'});
                guiEvents.emit('notification_popup','Hiding collisions');
              }
              else
              {
                $('#view-collisions').buttonMarkup({icon: 'check'});
                guiEvents.emit('notification_popup','Viewing collisions');
              }
            }
        );
      
        guiEvents.on('show_grid', function(option)
            {
              if (option === 'show')
              {
                that.scene.grid.visible = true;
              }
              else if (option === 'hide')
              {
                that.scene.grid.visible = false;
              }
              else if (option === 'toggle')
              {
                that.scene.grid.visible = !that.scene.grid.visible;
              }
      
              if(!that.scene.grid.visible)
              {
                $('#view-grid').buttonMarkup({icon: 'false'});
                guiEvents.emit('notification_popup','Hiding grid');
              }
              else
              {
                $('#view-grid').buttonMarkup({icon: 'check'});
                guiEvents.emit('notification_popup','Viewing grid');
              }
            }
        );
      
         guiEvents.on('show_orbit_indicator', function()
            {
              that.scene.controls.showTargetIndicator =
                  !that.scene.controls.showTargetIndicator;
              if(!that.scene.controls.showTargetIndicator)
              {
                $('#view-orbit-indicator').buttonMarkup({icon: 'false'});
                guiEvents.emit('notification_popup','Hiding orbit indicator');
              }
              else
              {
                $('#view-orbit-indicator').buttonMarkup({icon: 'check'});
                guiEvents.emit('notification_popup','Viewing orbit indicator');
              }
            }
        );
      
        guiEvents.on('snap_to_grid',
            function ()
            {
              if(that.scene.modelManipulator.snapDist === null)
              {
                $('#snap-to-grid').buttonMarkup({icon: 'check'});
                that.scene.modelManipulator.snapDist = 0.5;
                that.scene.spawnModel.snapDist = that.scene.modelManipulator.snapDist;
                guiEvents.emit('notification_popup','Snapping to grid');
              }
              else
              {
                $('#snap-to-grid').buttonMarkup({icon: 'false'});
                that.scene.modelManipulator.snapDist = null;
                that.scene.spawnModel.snapDist = null;
                guiEvents.emit('notification_popup','Not snapping to grid');
              }
            }
        );
      
        guiEvents.on('openTreeWhenSelected', function ()
            {
              this.openTreeWhenSelected = !this.openTreeWhenSelected;
              if(!this.openTreeWhenSelected)
              {
                $('#open-tree-when-selected').buttonMarkup({icon: 'false'});
              }
              else
              {
                $('#open-tree-when-selected').buttonMarkup({icon: 'check'});
              }
            }
        );
      
        guiEvents.on('toggle_notifications', function ()
            {
              this.showNotifications = !this.showNotifications;
              if(!this.showNotifications)
              {
                $('#toggle-notifications').buttonMarkup({icon: 'false'});
              }
              else
              {
                $('#toggle-notifications').buttonMarkup({icon: 'check'});
              }
            }
        );
      
      
        guiEvents.on('longpress_container_start',
            function (event)
            {
              if (event.originalEvent.touches.length !== 1 ||
                  that.scene.modelManipulator.hovered ||
                  that.scene.spawnModel.active)
              {
                guiEvents.emit('longpress_container_end', event.originalEvent,true);
              }
              else
              {
                that.scene.showRadialMenu(event);
                that.longPressContainerState = 'START';
              }
            }
        );
      
        guiEvents.on('longpress_container_end', function(event,cancel)
            {
              if (that.longPressContainerState !== 'START')
              {
                that.longPressContainerState = 'END';
                return;
              }
              that.longPressContainerState = 'END';
              if (that.scene.radialMenu.showing)
              {
                if (cancel)
                {
                  that.scene.radialMenu.hide(event);
                }
                else
                {
                that.scene.radialMenu.hide(event, function(type,entity)
                    {
                      if (type === 'delete')
                      {
                        that.emitter.emit('deleteEntity',entity);
                        that.scene.setManipulationMode('view');
                        $( '#view-mode' ).prop('checked', true);
                        $('input[type="radio"]').checkboxradio('refresh');
                      }
                      else if (type === 'translate')
                      {
                        $('#translate-mode').click();
                        $('input[type="radio"]').checkboxradio('refresh');
                        that.scene.attachManipulator(entity,type);
                      }
                      else if (type === 'rotate')
                      {
                        $( '#rotate-mode' ).click();
                        $('input[type="radio"]').checkboxradio('refresh');
                        that.scene.attachManipulator(entity,type);
                      }
                      else if (type === 'transparent')
                      {
                        guiEvents.emit('set_view_as','transparent');
                      }
                      else if (type === 'wireframe')
                      {
                        guiEvents.emit('set_view_as','wireframe');
                      }
                      else if (type === 'joints')
                      {
                        that.scene.selectEntity(entity);
                        guiEvents.emit('view_joints');
                      }
      
                    });
                }
              }
            }
        );
      
        guiEvents.on('longpress_container_move', function(event)
            {
              if (event.originalEvent.touches.length !== 1)
              {
                guiEvents.emit('longpress_container_end',event.originalEvent,true);
              }
              else
              {
                if (that.longPressContainerState !== 'START')
                {
                  return;
                }
                if (that.scene.radialMenu.showing)
                {
                  that.scene.radialMenu.onLongPressMove(event);
                }
              }
            }
        );
      
        guiEvents.on('longpress_insert_start', function (event, path)
            {
              navigator.vibrate(50);
              guiEvents.emit('spawn_entity_start', path);
              event.stopPropagation();
            }
        );
      
        guiEvents.on('longpress_insert_end', function(event)
            {
              guiEvents.emit('spawn_entity_end');
            }
        );
      
        guiEvents.on('longpress_insert_move', function(event)
            {
              guiEvents.emit('spawn_entity_move', event);
              event.stopPropagation();
            }
        );
      
        var notificationTimeout;
        guiEvents.on('notification_popup',
            function (notification, duration)
            {
              if (this.showNotifications)
              {
                clearTimeout(notificationTimeout);
                $( '#notification-popup' ).popup('close');
                $( '#notification-popup' ).html('&nbsp;'+notification+'&nbsp;');
                $( '#notification-popup' ).popup('open', {
                    y:window.innerHeight-50});
      
                if (duration === undefined)
                {
                  duration = 2000;
                }
                notificationTimeout = setTimeout(function()
                {
                  $( '#notification-popup' ).popup('close');
                }, duration);
              }
            }
        );
      
        guiEvents.on('right_click', function (event)
            {
              that.scene.onRightClick(event, function(entity)
                  {
                    that.openEntityPopup(event, entity);
                  });
            }
        );
      
        guiEvents.on('set_view_as', function (viewAs)
            {
              that.scene.setViewAs(that.scene.selectedEntity, viewAs);
            }
        );
      
        guiEvents.on('view_joints', function ()
            {
              that.scene.viewJoints(that.scene.selectedEntity);
            }
        );
      
        guiEvents.on('delete_entity', function ()
            {
              that.emitter.emit('deleteEntity',that.scene.selectedEntity);
              $('#model-popup').popup('close');
              that.scene.selectEntity(null);
            }
        );
      
        guiEvents.on('pointerOnMenu', function ()
            {
              that.scene.pointerOnMenu = true;
            }
        );
      
        guiEvents.on('pointerOffMenu', function ()
            {
              that.scene.pointerOnMenu = false;
            }
        );
      
        guiEvents.on('openTab', function (id, parentId)
            {
              lastOpenMenu[parentId] = id;
      
              $('.leftPanels').hide();
              $('#'+id).show();
      
              $('.tab').css('border-left-color', tabColors.unselected);
              $('#'+parentId+'Tab').css('border-left-color', tabColors.selected);
      
              if (id.indexOf('propertyPanel-') >= 0)
              {
                var entityName = id.substring(id.indexOf('-')+1);
                var object = that.scene.getByName(
                    convertNameId(entityName, true));
      
                var stats = {};
                stats.name = entityName;
      
                stats.pose = {};
                stats.pose.position = {x: object.position.x,
                                       y: object.position.y,
                                       z: object.position.z};
      
                stats.pose.orientation = {x: object.quaternion._x,
                                          y: object.quaternion._y,
                                          z: object.quaternion._z,
                                          w: object.quaternion._w};
              }
      
              guiEvents.emit('resizePanel');
            }
        );
      
        guiEvents.on('closeTabs', function (force)
            {
              // Close for narrow viewports, force to always close
              if (force || !isWideScreen())
              {
                $('.leftPanels').hide();
                $('.tab').css('left', '0em');
                $('.tab').css('border-left-color', tabColors.unselected);
              }
            }
        );
      
        guiEvents.on('setTreeSelected', function (object)
            {
              for (var i = 0; i < modelStats.length; ++i)
              {
                if (modelStats[i].name === object)
                {
                  modelStats[i].selected = 'selectedTreeItem';
                  if (this.openTreeWhenSelected)
                  {
                    guiEvents.emit('openTab', 'propertyPanel-'+
                        convertNameId(object), 'treeMenu');
                  }
                }
                else
                {
                  modelStats[i].selected = 'unselectedTreeItem';
                }
              }
              for (i = 0; i < lightStats.length; ++i)
              {
                if (lightStats[i].name === object)
                {
                  lightStats[i].selected = 'selectedTreeItem';
                  if (this.openTreeWhenSelected)
                  {
                    guiEvents.emit('openTab', 'propertyPanel-' +
                        convertNameId(object), 'treeMenu');
                  }
                }
                else
                {
                  lightStats[i].selected = 'unselectedTreeItem';
                }
              }
              that.updateStats();
            }
        );
      
        guiEvents.on('setTreeDeselected', function ()
            {
              for (var i = 0; i < modelStats.length; ++i)
              {
                modelStats[i].selected = 'unselectedTreeItem';
              }
              for (i = 0; i < lightStats.length; ++i)
              {
                lightStats[i].selected = 'unselectedTreeItem';
              }
              that.updateStats();
            }
        );
      
        guiEvents.on('selectEntity', function (name)
            {
              var object = that.scene.getByName(name);
              that.scene.selectEntity(object);
            }
        );
      
        guiEvents.on('openEntityPopup', function (event, name)
            {
              if (!isTouchDevice)
              {
                var object = that.scene.getByName(name);
                that.openEntityPopup(event, object);
              }
            }
        );
      
        guiEvents.on('setPoseStats', function (modelName, linkName)
            {
              var object;
              if (linkName === undefined)
              {
                object = that.scene.getByName(modelName);
              }
              else
              {
                object = that.scene.getByName(linkName);
              }
      
              var stats = {};
              stats.name = object.name;
              stats.pose = {};
              stats.pose.position = {x: object.position.x,
                                     y: object.position.y,
                                     z: object.position.z};
              stats.pose.orientation = {x: object.quaternion._x,
                                        y: object.quaternion._y,
                                        z: object.quaternion._z,
                                        w: object.quaternion._w};
      
              if (object.children[0] instanceof THREE.Light)
              {
                that.setLightStats(stats, 'update');
              }
              else
              {
                that.setModelStats(stats, 'update');
              }
            }
        );
      
        guiEvents.on('resizePanel', function ()
            {
              if ($('.leftPanels').is(':visible'))
              {
                if (isWideScreen())
                {
                  $('.tab').css('left', '23em');
                }
                else
                {
                  $('.tab').css('left', '10.5em');
                }
              }
      
              if ($('.propertyPanels').is(':visible'))
              {
                var maxWidth = $(window).width();
                if (isWideScreen())
                {
                  maxWidth = emUnits(23);
                }
      
                $('.propertyPanels').css('width', maxWidth);
              }
            }
        );
      
        guiEvents.on('setPose', function (prop1, prop2, name, value)
            {
              if (value === undefined)
              {
                return;
              }
      
              var entity = that.scene.getByName(name);
              if (prop1 === 'orientation')
              {
                entity['rotation']['_'+prop2] = value;
                entity['quaternion'].setFromEuler(entity['rotation']);
              }
              else
              {
                entity[prop1][prop2] = value;
              }
              entity.updateMatrixWorld();
      
              if (entity.children[0] &&
                 (entity.children[0] instanceof THREE.SpotLight ||
                  entity.children[0] instanceof THREE.DirectionalLight))
              {
                var lightObj = entity.children[0];
                var dir = new THREE.Vector3(0,0,0);
                dir.copy(entity.direction);
                entity.localToWorld(dir);
                lightObj.target.position.copy(dir);
              }
      
              that.scene.emitter.emit('entityChanged', entity);
            }
        );
      
        guiEvents.on('setLight', function (prop, name, value)
            {
              if (value === undefined)
              {
                return;
              }
      
              var entity = that.scene.getByName(name);
              var lightObj = entity.children[0];
              if (prop === 'diffuse')
              {
                lightObj.color = new THREE.Color(value);
              }
              else if (prop === 'specular')
              {
                entity.serverProperties.specular = new THREE.Color(value);
              }
              else if (prop === 'range')
              {
                lightObj.distance = value;
              }
              else if (prop === 'attenuation_constant')
              {
                entity.serverProperties.attenuation_constant = value;
              }
              else if (prop === 'attenuation_linear')
              {
                entity.serverProperties.attenuation_linear = value;
                lightObj.intensity = lightObj.intensity/(1+value);
              }
              else if (prop === 'attenuation_quadratic')
              {
                entity.serverProperties.attenuation_quadratic = value;
                lightObj.intensity = lightObj.intensity/(1+value);
              }
      
              // updating color too often, maybe only update when popup is closed
              that.scene.emitter.emit('entityChanged', entity);
            }
        );
      
        guiEvents.on('toggleProperty', function (prop, subEntityName)
            {
              var entity = that.scene.getByName(subEntityName);
              entity.serverProperties[prop] = !entity.serverProperties[prop];
      
              that.scene.emitter.emit('linkChanged', entity);
            }
        );
      };


      // Intialize test
      describe('Test gzgui init', function() {
        it('Should verify the status of the gui after initialization', function() {

          expect(gui.spawnState).toEqual(null);
          expect(gui.longPressContainerState).toEqual(null);
          expect(gui.showNotifications).toEqual(false);
          expect(gui.openTreeWhenSelected).toEqual(false);
          expect(gui.modelStatsDirty).toEqual(false);


          // On guiEvents, emitter events
          guiEvents.emit('manipulation_mode', 'translate');
          expect(scene.manipulationMode).toEqual('translate');
          guiEvents.emit('manipulation_mode', 'rotate');
          expect(scene.manipulationMode).toEqual('rotate');

          expect($('#view-mode').prop('checked')).toEqual(true);
          // guiEvents.emit('spawn_entity_start', 'box');

          console.log(scene.grid.visible);

          guiEvents.emit('show_grid', 'show');
          expect(scene.grid.visible).toEqual(true);
          guiEvents.emit('show_grid', 'hide');
          expect(scene.grid.visible).toEqual(false);

          expect(scene.modelManipulator.snapDist).toEqual(null);
          guiEvents.emit('snap_to_grid');
          expect(scene.modelManipulator.snapDist).toEqual(0.5);
          guiEvents.emit('snap_to_grid');
          expect(scene.modelManipulator.snapDist).toEqual(null);
          
          expect(gui.openTreeWhenSelected).toEqual(false);
          guiEvents.emit('openTreeWhenSelected');
          // expect(scene.modelManipulator.snapDist).toEqual(0.5);
          // guiEvents.emit('snap_to_grid');
          


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
