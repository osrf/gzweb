/*global $:false */
/*global angular*/

var guiEvents = new EventEmitter2({ verbose: true });

var emUnits = function(value)
    {
      return value*parseFloat($('body').css('font-size'));
    };

var isTouchDevice = 'ontouchstart' in window || 'onmsgesturechange' in window;

var isWideScreen = function()
    {
      return $(window).width() / emUnits(1) > 35;
    };
var isTallScreen = function()
    {
      return $(window).height() / emUnits(1) > 35;
    };
var lastOpenMenu = {mainMenu: 'mainMenu', insertMenu: 'insertMenu',
    treeMenu: 'treeMenu'};

var tabColors = {selected: 'rgb(34, 170, 221)', unselected: 'rgb(42, 42, 42)'};

var modelList =
  [
    {path:'buildings', title:'Buildings', examplePath:'house_1', models:
    [
      {modelPath:'fast_food', modelTitle:'Fast Food'},
      {modelPath:'gas_station', modelTitle:'Gas Station'},
      {modelPath:'house_1', modelTitle:'House 1'},
      {modelPath:'house_2', modelTitle:'House 2'},
      {modelPath:'house_3', modelTitle:'House 3'},
      {modelPath:'iss', modelTitle:'International Space Station'},
      {modelPath:'iss_half', modelTitle:'ISS half'},
      {modelPath:'kitchen_dining', modelTitle:'Kitchen and Dining'},
      {modelPath:'office_building', modelTitle:'Office Building'},
      {modelPath:'powerplant', modelTitle:'Power Plant'},
      {modelPath:'starting_pen', modelTitle:'Starting Pen'},
      {modelPath:'willowgarage', modelTitle:'Willow Garage'}
    ]},

    {path:'furniture', title:'Furniture', examplePath:'table', models:
    [
      {modelPath:'bookshelf', modelTitle:'Book Shelf'},
      {modelPath:'cabinet', modelTitle:'Cabinet'},
      {modelPath:'drc_practice_door_4x8', modelTitle:'4x8 Doorway'},
      {modelPath:'drc_practice_ladder', modelTitle:'Ladder'},
      {modelPath:'hinged_door', modelTitle:'Hinged Door'},
      {modelPath:'table', modelTitle:'Table'},
      {modelPath:'table_marble', modelTitle:'Table Marble'},

      {modelPath:'drc_practice_ball_valve', modelTitle:'Ball Valve'},
      {modelPath:'drc_practice_handle_wheel_valve', modelTitle:'Handle Wheel Valve'},
      {modelPath:'drc_practice_hand_wheel_valve', modelTitle:'Hand Wheel Valve'},
      {modelPath:'drc_practice_wheel_valve', modelTitle:'Wheel Valve'},
      {modelPath:'drc_practice_wheel_valve_large', modelTitle:'Wheel Valve Large'},
      {modelPath:'door_handle', modelTitle:'Door Handle'},

      {modelPath:'drc_practice_ball_valve_wall', modelTitle:'Wall (Ball Valve)'},
      {modelPath:'drc_practice_handle_wheel_valve_wall', modelTitle:'Wall (Handle Wheel Valve)'},
      {modelPath:'drc_practice_hand_wheel_valve_wall', modelTitle:'Wall (Hand Wheel Valve)'},
      {modelPath:'drc_practice_valve_wall', modelTitle:'Wall (Valve)'},
      {modelPath:'drc_practice_wheel_valve_wall', modelTitle:'Wall (Wheel Valve)'},
      {modelPath:'drc_practice_wheel_valve_large_wall', modelTitle:'Wall (Wheel Valve Large)'},
      {modelPath:'grey_wall', modelTitle:'Grey Wall'},
      {modelPath:'asphalt_plane', modelTitle:'Asphalt Plane'},
      {modelPath:'drc_practice_base_4x8', modelTitle:'Debris base'},
      {modelPath:'ground_plane', modelTitle:'Ground Plane'},
      {modelPath:'nist_maze_wall_120', modelTitle:'120 Maze Wall'},
      {modelPath:'nist_maze_wall_240', modelTitle:'240 Maze Wall'},
      {modelPath:'nist_maze_wall_triple_holes_120', modelTitle:'120 Maze Wall Triple Holes'},
      {modelPath:'nist_simple_ramp_120', modelTitle:'Simple Ramp'},
      {modelPath:'nist_stairs_120', modelTitle:'Stairs'}
    ]},

    {path:'kitchen', title:'Kitchen', examplePath:'bowl', models:
    [
      {modelPath:'beer', modelTitle:'Beer'},
      {modelPath:'bowl', modelTitle:'Bowl'},
      {modelPath:'coke_can', modelTitle:'Coke Can'},
      {modelPath:'saucepan', modelTitle:'Saucepan'}
    ]},

    {path:'robocup', title:'Robocup', examplePath:'robocup09_spl_field', models:
    [
      {modelPath:'robocup09_spl_field', modelTitle:'2009 SPL Field'},
      {modelPath:'robocup14_spl_field', modelTitle:'2014 SPL Field'},
      {modelPath:'robocup_3Dsim_field', modelTitle:'3D Sim. Field'},
      {modelPath:'robocup14_spl_goal', modelTitle:'SPL Goal'},
      {modelPath:'robocup_3Dsim_goal', modelTitle:'3D Sim. Goal'},
      {modelPath:'robocup_spl_ball', modelTitle:'SPL Ball'},
      {modelPath:'robocup_3Dsim_ball', modelTitle:'3D Sim. Ball'}
    ]},

    {path:'robots', title:'Robots', examplePath:'pr2', models:
    [
      {modelPath:'create', modelTitle:'Create'},
      {modelPath:'husky', modelTitle:'Husky'},
      {modelPath:'irobot_hand', modelTitle:'iRobot Hand'},
      {modelPath:'pioneer2dx', modelTitle:'Pioneer 2DX'},
      {modelPath:'pioneer3at', modelTitle:'Pioneer 3AT'},
      {modelPath:'pr2', modelTitle:'PR2'},
      {modelPath:'robonaut', modelTitle:'Robonaut'},
      {modelPath:'simple_arm', modelTitle:'Simple Arm'},
      {modelPath:'simple_arm_gripper', modelTitle:'Simple Arm and Gripper'},
      {modelPath:'simple_gripper', modelTitle:'Simple Gripper'},
      {modelPath:'turtlebot', modelTitle:'TurtleBot'},
      {modelPath:'youbot', modelTitle:'YouBot'}
    ]},

    {path:'sensors', title:'Sensors', examplePath:'kinect', models:
    [
      {modelPath:'camera', modelTitle:'Camera'},
      {modelPath:'stereo_camera', modelTitle:'Stereo Camera'},
      {modelPath:'hokuyo', modelTitle:'Hokuyo'},
      {modelPath:'kinect', modelTitle:'Kinect'}
    ]},

    {path:'street', title:'Street', examplePath:'fire_hydrant', models:
    [
      {modelPath:'cinder_block', modelTitle:'Cinder Block'},
      {modelPath:'cinder_block_2', modelTitle:'Cinder Block 2'},
      {modelPath:'cinder_block_wide', modelTitle:'Cinder Block Wide'},
      {modelPath:'construction_barrel', modelTitle:'Construction Barrel'},
      {modelPath:'construction_cone', modelTitle:'Construction Cone'},
      {modelPath:'drc_practice_angled_barrier_45', modelTitle:'Angled Barrier 45'},
      {modelPath:'drc_practice_angled_barrier_135', modelTitle:'Angled Barrier 135'},
      {modelPath:'drc_practice_block_wall', modelTitle:'Block Wall'},
      {modelPath:'drc_practice_orange_jersey_barrier', modelTitle:'Jersey Barrier (Orange)'},
      {modelPath:'drc_practice_white_jersey_barrier', modelTitle:'Jersey Barrier (White)'},
      {modelPath:'drc_practice_truss', modelTitle:'Truss'},
      {modelPath:'drc_practice_yellow_parking_block', modelTitle:'Parking Block'},
      {modelPath:'dumpster', modelTitle:'Dumpster'},
      {modelPath:'fire_hydrant', modelTitle:'Fire Hydrant'},
      {modelPath:'jersey_barrier', modelTitle:'Jersey Barrier'},
      {modelPath:'lamp_post', modelTitle:'Lamp Post'},
      {modelPath:'mailbox', modelTitle:'Mailbox'},
      {modelPath:'mud_box', modelTitle:'Mud Box'},
      {modelPath:'nist_fiducial_barrel', modelTitle:'Fiducial Barrel'},
      {modelPath:'speed_limit_sign', modelTitle:'Speed Limit Sign'},
      {modelPath:'stop_sign', modelTitle:'Stop Sign'}

    ]},

    {path:'tools', title:'Tools', examplePath:'cordless_drill', models:
    [
      {modelPath:'cordless_drill', modelTitle:'Cordless Drill'},
      {modelPath:'fire_hose_long', modelTitle:'Fire Hose'},
      {modelPath:'fire_hose_long_curled', modelTitle:'Fire Hose Long Curled'},
      {modelPath:'hammer', modelTitle:'Hammer'},
      {modelPath:'monkey_wrench', modelTitle:'Monkey Wrench'},
      {modelPath:'polaris_ranger_ev', modelTitle:'Polaris Ranger EV'},
      {modelPath:'polaris_ranger_xp900', modelTitle:'Polaris Ranger XP900'},
      {modelPath:'polaris_ranger_xp900_no_roll_cage', modelTitle:'Polaris Ranger without roll cage'},
      {modelPath:'utility_cart', modelTitle:'Utility Cart'}
    ]},

    {path:'misc', title:'Misc.', examplePath:'double_pendulum_with_base', models:
    [
      {modelPath:'double_pendulum_with_base', modelTitle:'Double Pendulum With Base'},
      {modelPath:'breakable_test', modelTitle:'Breakable_test'},
      {modelPath:'brick_box_3x1x3', modelTitle:'Brick Box 3x1x3'},
      {modelPath:'cube_20k', modelTitle:'Cube 20k'},
      {modelPath:'drc_practice_2x4', modelTitle:'2x4 Lumber'},
      {modelPath:'drc_practice_2x6', modelTitle:'2x6 Lumber'},
      {modelPath:'drc_practice_4x4x20', modelTitle:'4x4x20 Lumber'},
      {modelPath:'drc_practice_4x4x40', modelTitle:'4x4x40 Lumber'},
      {modelPath:'drc_practice_blue_cylinder', modelTitle:'Blue Cylinder'},
      {modelPath:'drc_practice_wood_slats', modelTitle:'Wood Slats'},
      {modelPath:'nist_elevated_floor_120', modelTitle:'Elevated Floor 120'}
    ]}
  ];

$(function()
{
  //Initialize
  if ('ontouchstart' in window || 'onmsgesturechange' in window)
  {
    $('body').addClass('isTouchDevice');
  }

  // Toggle items
  $('#view-collisions').buttonMarkup({icon: 'false'});
  $('#snap-to-grid').buttonMarkup({icon: 'false'});
  $('#open-tree-when-selected').buttonMarkup({icon: 'false'});
  $('#view-transparent').buttonMarkup({icon: 'false'});
  $('#view-wireframe').buttonMarkup({icon: 'false'});
  guiEvents.emit('toggle_notifications');

  $( '#clock-touch' ).popup('option', 'arrow', 't');
  $('#notification-popup-screen').remove();
  $('.tab').css('border-left-color', tabColors.unselected);

  if (isWideScreen())
  {
    guiEvents.emit('openTab', 'mainMenu', 'mainMenu');
  }

  if (isTallScreen())
  {
    $('.collapsible_header').click();
    $('#expand-MODELS').click();
    $('#expand-LIGHTS').click();
  }

  // Touch devices
  if (isTouchDevice)
  {
    $('.mouse-only')
        .css('display','none');

    $('#play-header-fieldset')
        .css('position', 'absolute')
        .css('right', '13.6em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#clock-header-fieldset')
        .css('position', 'absolute')
        .css('right', '10.2em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#mode-header-fieldset')
        .css('position', 'absolute')
        .css('right', '0.5em')
        .css('top', '0.15em')
        .css('z-index', '1000');

    $('.gzGUI').touchstart(function(event){
        guiEvents.emit('pointerOnMenu');
    });

    $('.gzGUI').touchend(function(event){
        guiEvents.emit('pointerOffMenu');
    });

    // long press on canvas
    var press_time_container = 400;
    $('#container')
      .on('touchstart', function (event) {
        $(this).data('checkdown', setTimeout(function () {
          guiEvents.emit('longpress_container_start',event);
        }, press_time_container));
      })
      .on('touchend', function (event) {
        clearTimeout($(this).data('checkdown'));
        guiEvents.emit('longpress_container_end',event,false);
      })
      .on('touchmove', function (event) {
        clearTimeout($(this).data('checkdown'));
        $(this).data('checkdown', setTimeout(function () {
          guiEvents.emit('longpress_container_start',event);
        }, press_time_container));
        guiEvents.emit('longpress_container_move',event);
      });

    // long press on insert menu item
    var press_time_insert = 400;
    $('[id^="insert-entity-"]')
      .on('touchstart', function (event) {
        var path = $(this).attr('id');
        path = path.substring(14); // after 'insert-entity-'
        $(this).data('checkdown', setTimeout(function () {
          guiEvents.emit('longpress_insert_start', event, path);
        }, press_time_insert));
      })
      .on('touchend', function (event) {
        clearTimeout($(this).data('checkdown'));
        guiEvents.emit('longpress_insert_end',event,false);
      })
      .on('touchmove', function (event) {
        clearTimeout($(this).data('checkdown'));
        guiEvents.emit('longpress_insert_move',event);
      });
  }
  // Mouse devices
  else
  {
    $('.touch-only')
        .css('display','none');

    $('[id^="insert-entity-"]')
      .click(function(event) {
        var path = $(this).attr('id');
        path = path.substring(14); // after 'insert-entity-'
        guiEvents.emit('spawn_entity_start', path);
      })
      .on('mousedown', function(event) {
        event.preventDefault();
      });

    $('#play-header-fieldset')
        .css('position', 'absolute')
        .css('right', '41.2em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#clock-mouse')
        .css('position', 'absolute')
        .css('right', '29.0em')
        .css('top', '0.5em')
        .css('z-index', '100')
        .css('width', '11em')
        .css('height', '2.5em')
        .css('background-color', '#333333')
        .css('padding', '3px')
        .css('border-radius', '5px');

    $('#mode-header-fieldset')
        .css('position', 'absolute')
        .css('right', '24.4em')
        .css('top', '0.15em')
        .css('z-index', '1000');

    $('#box-header-fieldset')
        .css('position', 'absolute')
        .css('right', '15.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#sphere-header-fieldset')
        .css('position', 'absolute')
        .css('right', '12.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#cylinder-header-fieldset')
        .css('position', 'absolute')
        .css('right', '9.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#pointlight-header-fieldset')
        .css('position', 'absolute')
        .css('right', '6.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#spotlight-header-fieldset')
        .css('position', 'absolute')
        .css('right', '3.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#directionallight-header-fieldset')
        .css('position', 'absolute')
        .css('right', '0.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('.gzGUI').mouseenter(function(event){
        guiEvents.emit('pointerOnMenu');
    });

    $('.gzGUI').mouseleave(function(event){
        guiEvents.emit('pointerOffMenu');
    });

    // right-click
    $('#container').mousedown(function(event)
        {
          event.preventDefault();
          if(event.which === 3)
          {
            guiEvents.emit('right_click', event);
          }
        });

    $('#model-popup-screen').mousedown(function(event)
        {
          $('#model-popup').popup('close');
        });
  }

  $('.tab').click(function()
      {
        var idTab = $(this).attr('id');
        var idMenu = idTab.substring(0,idTab.indexOf('Tab'));

        if($('#'+idTab).css('border-left-color') === tabColors.unselected)
        {
          guiEvents.emit('openTab', lastOpenMenu[idMenu], idMenu);
        }
        else
        {
          guiEvents.emit('closeTabs', true);
        }
      });

  $('.panelTitle').click(function()
      {
        guiEvents.emit('closeTabs', true);
      });

  $('.panelSubTitle').click(function()
      {
        var id = $('.leftPanels:visible').attr('id');
        id = id.substring(0,id.indexOf('-'));
        guiEvents.emit('openTab', id, id);
      });

  $('#view-mode').click(function()
      {
        guiEvents.emit('manipulation_mode', 'view');
      });
  $('#translate-mode').click(function()
      {
        guiEvents.emit('manipulation_mode', 'translate');
      });
  $('#rotate-mode').click(function()
      {
        guiEvents.emit('manipulation_mode', 'rotate');
      });

  $('[id^="header-insert-"]').click(function()
      {
        var entity = $(this).attr('id');
        entity = entity.substring(14); // after 'header-insert-'
        guiEvents.emit('closeTabs', false);
        guiEvents.emit('spawn_entity_start', entity);
      });

  $('#play').click(function()
      {
        if ( $('#playText').html().indexOf('Play') !== -1 )
        {
          guiEvents.emit('pause', false);
          guiEvents.emit('notification_popup','Physics engine running');
        }
        else
        {
          guiEvents.emit('pause', true);
          guiEvents.emit('notification_popup','Physics engine paused');
        }
      });
  $('#clock').click(function()
      {
        if ($.mobile.activePage.find('#clock-touch').parent().
            hasClass('ui-popup-active'))
        {
          $( '#clock-touch' ).popup('close');
        }
        else
        {
          var position = $('#clock').offset();
          $('#clock-touch').popup('open', {
              x:position.left+emUnits(1.6),
              y:emUnits(4)});
        }
      });

  $('#reset-model').click(function()
      {
        guiEvents.emit('model_reset');
        guiEvents.emit('closeTabs', false);
      });
  $('#reset-world').click(function()
      {
        guiEvents.emit('world_reset');
        guiEvents.emit('closeTabs', false);
      });
  $('#reset-view').click(function()
      {
        guiEvents.emit('view_reset');
        guiEvents.emit('closeTabs', false);
      });
  $('#view-grid').click(function()
      {
        guiEvents.emit('show_grid', 'toggle');
        guiEvents.emit('closeTabs', false);
      });
  $('#view-collisions').click(function()
      {
        guiEvents.emit('show_collision');
        guiEvents.emit('closeTabs', false);
      });
  $( '#snap-to-grid' ).click(function() {
    guiEvents.emit('snap_to_grid');
    guiEvents.emit('closeTabs', false);
  });
  $( '#open-tree-when-selected' ).click(function() {
    guiEvents.emit('openTreeWhenSelected');
    guiEvents.emit('closeTabs', false);
  });
  $( '#toggle-notifications' ).click(function() {
    guiEvents.emit('toggle_notifications');
    guiEvents.emit('closeTabs', false);
  });

  // Disable Esc key to close panel
  $('body').on('keyup', function(event)
      {
        if (event.which === 27)
        {
          return false;
        }
      });

  // Object menu
  $( '#view-transparent' ).click(function() {
    $('#model-popup').popup('close');
    guiEvents.emit('set_view_as','transparent');
  });

  $( '#view-wireframe' ).click(function() {
    $('#model-popup').popup('close');
    guiEvents.emit('set_view_as','wireframe');
  });

  $( '#delete-entity' ).click(function() {
    guiEvents.emit('delete_entity');
  });

  $(window).resize(function()
  {
    guiEvents.emit('resizePanel');
  });
});

function getNameFromPath(path)
{
  if(path === 'box')
  {
    return 'Box';
  }
  if(path === 'sphere')
  {
    return 'Sphere';
  }
  if(path === 'cylinder')
  {
    return 'Cylinder';
  }
  if(path === 'pointlight')
  {
    return 'Point Light';
  }
  if(path === 'spotlight')
  {
    return 'Spot Light';
  }
  if(path === 'directionallight')
  {
    return 'Directional Light';
  }

  for(var i = 0; i < modelList.length; ++i)
  {
    for(var j = 0; j < modelList[i].models.length; ++j)
    {
      if(modelList[i].models[j].modelPath === path)
      {
        return modelList[i].models[j].modelTitle;
      }
    }
  }
}

// World tree
var gzangular = angular.module('gzangular',[]);
// add ng-right-click
gzangular.directive('ngRightClick', function($parse)
{
  return function(scope, element, attrs)
      {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event)
            {
              scope.$apply(function()
                  {
                    event.preventDefault();
                    fn(scope, {$event:event});
                  });
            });
      };
});

gzangular.controller('treeControl', ['$scope', function($scope)
{
  $scope.updateStats = function()
  {
    $scope.models = modelStats;
    $scope.lights = lightStats;
    $scope.scene = sceneStats;
    $scope.physics = physicsStats;
    if (!$scope.$$phase)
    {
      $scope.$apply();
    }
  };

  $scope.selectEntity = function (name)
  {
    $('#model-popup').popup('close');
    guiEvents.emit('openTab', 'propertyPanel-'+name, 'treeMenu');
    guiEvents.emit('selectEntity', name);
  };

  $scope.openEntityMenu = function (event, name)
  {
    $('#model-popup').popup('close');
    guiEvents.emit('openEntityPopup', event, name);
  };

  $scope.closePanels = function ()
  {
    guiEvents.emit('closeTabs', true);
  };

  $scope.backToTree = function ()
  {
    guiEvents.emit('openTab', 'treeMenu', 'treeMenu');
  };

  $scope.expandTree = function (tree)
  {
    var idContent = 'expandable-' + tree;
    var idHeader = 'expand-' + tree;

    if ($('#' + idContent).is(':visible'))
    {
      $('#' + idContent).hide();
      $('#' + idHeader+' img').css('transform','rotate(0deg)')
                              .css('-webkit-transform','rotate(0deg)')
                              .css('-ms-transform','rotate(0deg)');
    }
    else
    {
      $('#' + idContent).show();
      $('#' + idHeader+' img').css('transform','rotate(90deg)')
                              .css('-webkit-transform','rotate(90deg)')
                              .css('-ms-transform','rotate(90deg)');
    }
  };

  $scope.expandProperty = function (prop, modelName, subPropShortName, subPropName, parentProp)
  {
    var idContent = 'expandable-' + prop + '-' + modelName;
    var idHeader = 'expand-' + prop + '-' + modelName;

    var idContentOthers, idHeaderOthers;

    if (subPropShortName)
    {
      idContentOthers = idContent;
      idHeaderOthers = idHeader;
      idContent = idContent + '-' + subPropShortName;
      idHeader = idHeader + '-' + subPropShortName;
    }

    if ($('#' + idContent).is(':visible'))
    {
      $('#' + idContent).hide();
      $('#' + idHeader+' img').css('transform','rotate(0deg)')
                              .css('-webkit-transform','rotate(0deg)')
                              .css('-ms-transform','rotate(0deg)');
    }
    else
    {
      if (subPropShortName && (prop === 'link' || prop === 'joint'))
      {
        $('[id^="' + idContentOthers + '-"]').hide();
        $('[id^="' + idHeaderOthers + '-"] img')
            .css('transform','rotate(0deg)')
            .css('-webkit-transform','rotate(0deg)')
            .css('-ms-transform','rotate(0deg)');
      }

      $('#' + idContent).show();
      $('#' + idHeader+' img').css('transform','rotate(90deg)')
                              .css('-webkit-transform','rotate(90deg)')
                              .css('-ms-transform','rotate(90deg)');

      if (prop === 'pose' && parentProp === 'link')
      {
        guiEvents.emit('setPoseStats', modelName, subPropName);
      }
    }
  };

  $scope.changePose = function(prop1, prop2, name, value)
  {
    guiEvents.emit('setPose', prop1, prop2, name, value);
  };

  $scope.changeLight = function(prop, name, value)
  {
    guiEvents.emit('setLight', prop, name, value);
  };

  $scope.toggleProperty = function(prop, entity, subEntity)
  {
    // only for links so far
    guiEvents.emit('toggleProperty', prop, entity, subEntity);
  };
}]);

// Insert menu
gzangular.controller('insertControl', ['$scope', function($scope)
{
  $scope.categories = modelList;

  $scope.openCategory = function(category)
  {
    var categoryID = 'insertMenu-'+category;
    guiEvents.emit('openTab', categoryID, 'insertMenu');
  };

  $scope.spawnEntity = function(path)
  {
    guiEvents.emit('spawn_entity_start', path);
  };
}]);


/**
 * Graphical user interface
 * @constructor
 * @param {GZ3D.Scene} scene - A scene to connect to
 */
GZ3D.Gui = function(scene)
{
  this.scene = scene;
  this.domElement = scene.getDomElement();
  this.init();
  this.emitter = new EventEmitter2({verbose: true});
  this.guiEvents = guiEvents;
};

/**
 * Initialize GUI
 */
GZ3D.Gui.prototype.init = function()
{
  this.spawnState = null;
  this.longPressContainerState = null;
  this.showNotifications = false;
  this.openTreeWhenSelected = false;

  var that = this;

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

              guiEvents.emit('notification_popup',
                  name+' inserted');
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
                  guiEvents.emit('notification_popup','Model deleted');
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

  guiEvents.on('delete_entity', function ()
      {
        that.emitter.emit('deleteEntity',that.scene.selectedEntity);
        guiEvents.emit('notification_popup','Model deleted');
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
          var object = that.scene.getByName(entityName);

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
              guiEvents.emit('openTab', 'propertyPanel-'+object, 'treeMenu');
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
              guiEvents.emit('openTab', 'propertyPanel-'+object, 'treeMenu');
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
            $('.tab').css('left', '15em');
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
            maxWidth = emUnits(15);
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
        if (prop === 'diffuse')
        {
          entity.children[0].color = new THREE.Color(value);
        }
        else if (prop === 'specular')
        {
          entity.serverProperties.specular = new THREE.Color(value);
        }
        else if (prop === 'range')
        {
          entity.children[0].distance = value;
        }
        else if (prop === 'attenuation_constant')
        {
          // Adjust according to factor
          var factor = 1;
          if (entity instanceof THREE.PointLight)
          {
            factor = 1.5;
          }
          else if (entity instanceof THREE.SpotLight)
          {
            factor = 5;
          }
          value *= factor;

          entity.children[0].intensity = value;
        }
        else if (prop === 'attenuation_linear')
        {
          entity.serverProperties.attenuation_linear = value;
        }
        else if (prop === 'attenuation_quadratic')
        {
          entity.serverProperties.attenuation_quadratic = value;
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

/**
 * Play/pause simulation
 * @param {boolean} paused
 */
GZ3D.Gui.prototype.setPaused = function(paused)
{
  if (paused)
  {
    $('#playText').html(
        '<img style="height:1.2em" src="style/images/play.png" title="Play">');
  }
  else
  {
    $('#playText').html(
        '<img style="height:1.2em" src="style/images/pause.png" title="Pause">'
        );
  }
};

/**
 * Update displayed real time
 * @param {string} realTime
 */
GZ3D.Gui.prototype.setRealTime = function(realTime)
{
  $('.real-time-value').text(realTime);
};

/**
 * Update displayed simulation time
 * @param {string} simTime
 */
GZ3D.Gui.prototype.setSimTime = function(simTime)
{
  $('.sim-time-value').text(simTime);
};

var sceneStats = {};
/**
 * Update scene stats on scene tree
 * @param {} stats
 */
GZ3D.Gui.prototype.setSceneStats = function(stats)
{
  sceneStats['ambient'] = this.round(stats.ambient);
  sceneStats['background'] = this.round(stats.background);
};

var physicsStats = {};
/**
 * Update physics stats on scene tree
 * @param {} stats
 */
GZ3D.Gui.prototype.setPhysicsStats = function(stats)
{
  physicsStats = stats;
  physicsStats['enable_physics'] = this.trueOrFalse(
      physicsStats['enable_physics']);
  physicsStats['max_step_size'] = this.round(physicsStats['max_step_size']);
  physicsStats['gravity'] = this.round(physicsStats['gravity']);
  physicsStats['sor'] = this.round(physicsStats['sor']);
  physicsStats['cfm'] = this.round(physicsStats['cfm']);
  physicsStats['erp'] = this.round(physicsStats['erp']);
  physicsStats['contact_max_correcting_vel'] = this.round(
      physicsStats['contact_max_correcting_vel']);
  physicsStats['contact_surface_layer'] = this.round(
      physicsStats['contact_surface_layer']);
};

var modelStats = [];
/**
 * Update model stats on property panel
 * @param {} stats
 * @param {} action: 'update' / 'delete'
 */
GZ3D.Gui.prototype.setModelStats = function(stats, action)
{
  var modelName = stats.name;
  var linkShortName;

  // if it's a link
  if (stats.name.indexOf('::') >= 0)
  {
    modelName = stats.name.substring(0, stats.name.indexOf('::'));
    linkShortName = stats.name.substring(stats.name.lastIndexOf('::')+2);
  }

  if (action === 'update')
  {
    var model = $.grep(modelStats, function(e)
        {
          return e.name === modelName;
        });

    var formatted;

    // New model
    if (model.length === 0)
    {
      var thumbnail = this.findModelThumbnail(modelName);

      formatted = this.formatStats(stats);

      modelStats.push(
          {
            name: modelName,
            thumbnail: thumbnail,
            selected: 'unselectedTreeItem',
            is_static: this.trueOrFalse(stats.is_static),
            position: formatted.pose.position,
            orientation: formatted.pose.orientation,
            links: [],
            joints: []
          });

      var newModel = modelStats[modelStats.length-1];

      // links
      for (var l = 0; l < stats.link.length; ++l)
      {
        var shortName = stats.link[l].name.substring(
            stats.link[l].name.lastIndexOf('::')+2);

        formatted = this.formatStats(stats.link[l]);

        newModel.links.push(
            {
              name: stats.link[l].name,
              shortName: shortName,
              self_collide: this.trueOrFalse(stats.link[l].self_collide),
              gravity: this.trueOrFalse(stats.link[l].gravity),
              kinematic: this.trueOrFalse(stats.link[l].kinematic),
              canonical: this.trueOrFalse(stats.link[l].canonical),
              position: formatted.pose.position,
              orientation: formatted.pose.orientation,
              inertial: formatted.inertial
            });
      }

      // joints
      for (var j = 0; j < stats.joint.length; ++j)
      {
        var jointShortName = stats.joint[j].name.substring(
            stats.joint[j].name.lastIndexOf('::')+2);
        var parentShortName = stats.joint[j].parent.substring(
            stats.joint[j].parent.lastIndexOf('::')+2);
        var childShortName = stats.joint[j].child.substring(
            stats.joint[j].child.lastIndexOf('::')+2);

        var type;
        switch (stats.joint[j].type)
        {
          case 1:
              type = 'Revolute';
              break;
          case 2:
              type = 'Revolute2';
              break;
          case 3:
              type = 'Prismatic';
              break;
          case 4:
              type = 'Universal';
              break;
          case 5:
              type = 'Ball';
              break;
          case 6:
              type = 'Screw';
              break;
          case 7:
              type = 'Gearbox';
              break;
          default:
              type = 'Unknown';
        }

        formatted = this.formatStats(stats.joint[j]);

        newModel.joints.push(
            {
              name: stats.joint[j].name,
              shortName: jointShortName,
              type: type,
              parent: stats.joint[j].parent,
              parentShortName: parentShortName,
              child: stats.joint[j].child,
              childShortName: childShortName,
              position: formatted.pose.position,
              orientation: formatted.pose.orientation,
              axis1: formatted.axis1,
              axis2: formatted.axis2
            });
      }
    }
    // Update existing model
    else
    {
      var link;

      if (stats.link && stats.link[0])
      {
        var LinkShortName = stats.link[0].name;

        link = $.grep(model[0].links, function(e)
            {
              return e.shortName === LinkShortName;
            });

        if (link[0].self_collide)
        {
          link[0].self_collide = this.trueOrFalse(stats.link[0].self_collide);
        }
        if (link[0].gravity)
        {
          link[0].gravity = this.trueOrFalse(stats.link[0].gravity);
        }
        if (link[0].kinematic)
        {
          link[0].kinematic = this.trueOrFalse(stats.link[0].kinematic);
        }
      }

      // Update pose stats only if they're being displayed and are not focused
      if (!((linkShortName &&
          !$('#expandable-pose-'+modelName+'-'+linkShortName).is(':visible'))||
          (!linkShortName &&
          !$('#expandable-pose-'+modelName).is(':visible'))||
          $('#expandable-pose-'+modelName+' input').is(':focus')))
      {

        if (stats.position)
        {
          stats.pose = {};
          stats.pose.position = stats.position;
          stats.pose.orientation = stats.orientation;
        }

        if (stats.pose)
        {
          formatted = this.formatStats(stats);

          if (linkShortName === undefined)
          {
            model[0].position = formatted.pose.position;
            model[0].orientation = formatted.pose.orientation;
          }
          else
          {
            link = $.grep(model[0].links, function(e)
              {
                return e.shortName === linkShortName;
              });

            link[0].position = formatted.pose.position;
            link[0].orientation = formatted.pose.orientation;
          }
        }
      }
    }
  }
  else if (action === 'delete')
  {
    this.deleteFromStats('model', modelName);
  }

  this.updateStats();
};

var lightStats = [];
/**
 * Update light stats on property panel
 * @param {} stats
 * @param {} action: 'update' / 'delete'
 */
GZ3D.Gui.prototype.setLightStats = function(stats, action)
{
  var name = stats.name;

  if (action === 'update')
  {
    var light = $.grep(lightStats, function(e)
        {
          return e.name === name;
        });

    var formatted;

    // New light
    if (light.length === 0)
    {
      var type = stats.type;

      var thumbnail;
      switch(type)
      {
        case 2:
            thumbnail = 'style/images/spotlight.png';
            break;
        case 3:
            thumbnail = 'style/images/directionallight.png';
            break;
        default:
            thumbnail = 'style/images/pointlight.png';
      }

      stats.attenuation = {constant: stats.attenuation_constant,
                           linear: stats.attenuation_linear,
                           quadratic: stats.attenuation_quadratic};

      formatted = this.formatStats(stats);

      var direction;
      if (stats.direction)
      {
        direction = stats.direction;
      }

      lightStats.push(
          {
            name: name,
            thumbnail: thumbnail,
            selected: 'unselectedTreeItem',
            position: formatted.pose.position,
            orientation: formatted.pose.orientation,
            diffuse: formatted.diffuse,
            specular: formatted.specular,
            color: formatted.color,
            range: stats.range,
            attenuation: this.round(stats.attenuation, true),
            direction: direction
          });
    }
    else
    {
      formatted = this.formatStats(stats);

      if (stats.pose)
      {
        light[0].position = formatted.pose.position;
        light[0].orientation = formatted.pose.orientation;
      }

      if (stats.diffuse)
      {
        light[0].diffuse = formatted.diffuse;
      }

      if (stats.specular)
      {
        light[0].specular = formatted.specular;
      }
    }
  }
  else if (action === 'delete')
  {
    this.deleteFromStats('light', name);
  }

  this.updateStats();
};

/**
 * Find thumbnail
 * @param {} instanceName
 * @returns string
 */
GZ3D.Gui.prototype.findModelThumbnail = function(instanceName)
{
  for(var i = 0; i < modelList.length; ++i)
  {
    for(var j = 0; j < modelList[i].models.length; ++j)
    {
      var path = modelList[i].models[j].modelPath;
      if(instanceName.indexOf(path) >= 0)
      {
        return '/assets/'+path+'/thumbnails/0.png';
      }
    }
  }
  if(instanceName.indexOf('box') >= 0)
  {
    return 'style/images/box.png';
  }
  if(instanceName.indexOf('sphere') >= 0)
  {
    return 'style/images/sphere.png';
  }
  if(instanceName.indexOf('cylinder') >= 0)
  {
    return 'style/images/cylinder.png';
  }
  return 'style/images/box.png';
};

/**
 * Update model stats
 */
GZ3D.Gui.prototype.updateStats = function()
{
  var tree = angular.element($('#treeMenu')).scope();
  tree.updateStats();
};

/**
 * Open entity (model/light) context menu
 * @param {} event
 * @param {THREE.Object3D} entity
 */
GZ3D.Gui.prototype.openEntityPopup = function(event, entity)
{
  this.scene.selectEntity(entity);
  $('.ui-popup').popup('close');

  if (entity.children[0] instanceof THREE.Light)
  {
    $('#view-transparent').css('visibility','collapse');
    $('#view-wireframe').css('visibility','collapse');
    $('#model-popup').popup('open',
      {x: event.clientX + emUnits(6),
       y: event.clientY + emUnits(-5)});
  }
  else
  {
    if (this.scene.selectedEntity.viewAs === 'transparent')
    {
      $('#view-transparent').buttonMarkup({icon: 'check'});
    }
    else
    {
      $('#view-transparent').buttonMarkup({icon: 'false'});
    }

    if (this.scene.selectedEntity.viewAs === 'wireframe')
    {
      $('#view-wireframe').buttonMarkup({icon: 'check'});
    }
    else
    {
      $('#view-wireframe').buttonMarkup({icon: 'false'});
    }
    $('#view-transparent').css('visibility','visible');
    $('#view-wireframe').css('visibility','visible');
    $('#model-popup').popup('open',
      {x: event.clientX + emUnits(6),
       y: event.clientY + emUnits(0)});
  }
};

/**
 * Format stats message for proper display
 * @param {} stats
 * @returns {position, orientation, inertial, diffuse, specular, attenuation}
 */
GZ3D.Gui.prototype.formatStats = function(stats)
{
  var position, orientation;
  var quat, rpy;
  if (stats.pose)
  {
    position = this.round(stats.pose.position, true);

    quat = new THREE.Quaternion(stats.pose.orientation.x,
        stats.pose.orientation.y, stats.pose.orientation.z,
        stats.pose.orientation.w);

    rpy = new THREE.Euler();
    rpy.setFromQuaternion(quat);

    orientation = {roll: rpy._x, pitch: rpy._y, yaw: rpy._z};
    orientation = this.round(orientation, true);
  }
  var inertial;
  if (stats.inertial)
  {
    inertial = this.round(stats.inertial);

    var inertialPose = stats.inertial.pose;
    inertial.pose = {};

    inertial.pose.position = {x: inertialPose.position.x,
                              y: inertialPose.position.y,
                              z: inertialPose.position.z};

    inertial.pose.position = this.round(inertial.pose.position);

    quat = new THREE.Quaternion(inertialPose.orientation.x,
        inertialPose.orientation.y, inertialPose.orientation.z,
        inertialPose.orientation.w);

    rpy = new THREE.Euler();
    rpy.setFromQuaternion(quat);

    inertial.pose.orientation = {roll: rpy._x, pitch: rpy._y, yaw: rpy._z};
    inertial.pose.orientation = this.round(inertial.pose.orientation);
  }
  var diffuse, colorHex, comp;
  var color = {};
  if (stats.diffuse)
  {
    diffuse = this.round(stats.diffuse);

    colorHex = {};
    for (comp in diffuse)
    {
      colorHex[comp] = diffuse[comp].toString(16);
      if (colorHex[comp].length === 1)
      {
        colorHex[comp] = '0' + colorHex[comp];
      }
    }
    color.diffuse = '#' + colorHex['r'] + colorHex['g'] + colorHex['b'];
  }
  var specular;
  if (stats.specular)
  {
    specular = this.round(stats.specular);

    colorHex = {};
    for (comp in specular)
    {
      colorHex[comp] = specular[comp].toString(16);
      if (colorHex[comp].length === 1)
      {
        colorHex[comp] = '0' + colorHex[comp];
      }
    }
    color.specular = '#' + colorHex['r'] + colorHex['g'] + colorHex['b'];
  }
  var axis1;
  if (stats.axis1)
  {
    axis1 = {};
    axis1 = this.round(stats.axis1);
    axis1.direction = this.round(stats.axis1.xyz);
  }
  var axis2;
  if (stats.axis2)
  {
    axis2 = {};
    axis2 = this.round(stats.axis2);
    axis2.direction = this.round(stats.axis2.xyz);
  }

  return {pose: {position: position, orientation: orientation},
          inertial: inertial,
          diffuse: diffuse,
          specular: specular,
          color: color,
          axis1: axis1,
          axis2: axis2};
};

/**
 * Round numbers to 3 decimals and format colors
 * @param {} stats
 * @param {} returnNumber - not fixed to 3 decimals, for input fields
 * @returns stats
 */
GZ3D.Gui.prototype.round = function(stats, returnNumber)
{
  if (typeof stats === 'number')
  {
    if (returnNumber)
    {
      stats = Math.round(stats*1000)/1000;
    }
    else
    {
      stats = parseFloat(Math.round(stats*1000)/1000)
          .toFixed(3);
    }
  }
  else // array of numbers
  {
    for (var key in stats)
    {
      if (typeof stats[key] === 'number')
      {
        // colors
        if (key === 'r' || key === 'g' || key === 'b' || key === 'a')
        {
          stats[key] = Math.round(stats[key] * 255);
        }
        else
        {
          if (returnNumber)
          {
            stats[key] = Math.round(stats[key]*1000)/1000;
          }
          else
          {
            stats[key] = parseFloat(Math.round(stats[key]*1000)/1000)
                .toFixed(3);
          }
        }
      }
    }
  }
  return stats;
};

/**
 * Format toggle items
 * @param {} stats: true / false
 * @returns {icon, title}
 */
GZ3D.Gui.prototype.trueOrFalse = function(stats)
{
  return stats ?
      {icon: 'true', title: 'True'} :
      {icon: 'false', title: 'False'};
};

/**
 * Delete an entity from stats list
 * @param {} type: 'model' / 'light'
 * @param {} name
 */
GZ3D.Gui.prototype.deleteFromStats = function(type, name)
{
  var list = (type === 'model') ? modelStats : lightStats;

  for (var i = 0; i < list.length; ++i)
  {
    if (list[i].name === name)
    {
      if ($('#propertyPanel-'+name).is(':visible'))
      {
        guiEvents.emit('openTab', 'treeMenu', 'treeMenu');
      }

      list.splice(i, 1);
      break;
    }
  }
};

