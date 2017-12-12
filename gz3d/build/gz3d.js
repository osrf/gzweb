var GZ3D = GZ3D || {
  REVISION : '1'
};

var globalEmitter = new EventEmitter2({verboseMemoryLeak: true});

/*global $:false */
/*global angular*/

var emUnits = function(value)
    {
      return value*parseFloat($('body').css('font-size'));
    };

// Assuming all mobile devices are touch devices.
var isTouchDevice = /Mobi/.test(navigator.userAgent);

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
    {path:'buildings', title:'Buildings',
    examplePath1:'fast_food', examplePath2:'kitchen_dining',
      examplePath3:'house_1', models:
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
      {modelPath:'willowgarage', modelTitle:'Willow Garage'},
      {modelPath:'cafe', modelTitle:'Cafe'},
      {modelPath:'box_target_green', modelTitle:'Box target (green)'},
      {modelPath:'box_target_red', modelTitle:'Box target (red)'},
      {modelPath:'hoop_red', modelTitle:'Hoop (red)'},
      {modelPath:'control_console', modelTitle:'Control Console'}
    ]},

    {path:'furniture', title:'Furniture',
    examplePath1:'hinged_door', examplePath2:'bookshelf', examplePath3:'table',
      models:
    [
      {modelPath:'bookshelf', modelTitle:'Book Shelf'},
      {modelPath:'cabinet', modelTitle:'Cabinet'},
      {modelPath:'drc_practice_door_4x8', modelTitle:'4x8 Doorway'},
      {modelPath:'drc_practice_ladder', modelTitle:'Ladder'},
      {modelPath:'hinged_door', modelTitle:'Hinged Door'},
      {modelPath:'table', modelTitle:'Table'},
      {modelPath:'table_marble', modelTitle:'Table Marble'},
      {modelPath:'cafe_table', modelTitle:'Cafe table'},

      {modelPath:'drc_practice_ball_valve', modelTitle:'Ball Valve'},
      {modelPath:'drc_practice_handle_wheel_valve',
        modelTitle:'Handle Wheel Valve'},
      {modelPath:'drc_practice_hand_wheel_valve',
        modelTitle:'Hand Wheel Valve'},
      {modelPath:'drc_practice_wheel_valve',
        modelTitle:'Wheel Valve'},
      {modelPath:'drc_practice_wheel_valve_large',
        modelTitle:'Wheel Valve Large'},
      {modelPath:'door_handle', modelTitle:'Door Handle'},

      {modelPath:'drc_practice_ball_valve_wall',
        modelTitle:'Wall (Ball Valve)'},
      {modelPath:'drc_practice_handle_wheel_valve_wall',
        modelTitle:'Wall (Handle Wheel Valve)'},
      {modelPath:'drc_practice_hand_wheel_valve_wall',
        modelTitle:'Wall (Hand Wheel Valve)'},
      {modelPath:'drc_practice_valve_wall', modelTitle:'Wall (Valve)'},
      {modelPath:'drc_practice_wheel_valve_wall',
        modelTitle:'Wall (Wheel Valve)'},
      {modelPath:'drc_practice_wheel_valve_large_wall',
        modelTitle:'Wall (Wheel Valve Large)'},
      {modelPath:'grey_wall', modelTitle:'Grey Wall'},
      {modelPath:'asphalt_plane', modelTitle:'Asphalt Plane'},
      {modelPath:'drc_practice_base_4x8', modelTitle:'Debris base'},
      {modelPath:'ground_plane', modelTitle:'Ground Plane'},
      {modelPath:'nist_maze_wall_120', modelTitle:'120 Maze Wall'},
      {modelPath:'nist_maze_wall_240', modelTitle:'240 Maze Wall'},
      {modelPath:'nist_maze_wall_triple_holes_120',
        modelTitle:'120 Maze Wall Triple Holes'},
      {modelPath:'nist_simple_ramp_120', modelTitle:'Simple Ramp'},
      {modelPath:'nist_stairs_120', modelTitle:'Stairs'}
    ]},

    {path:'kitchen', title:'Kitchen',
    examplePath1:'saucepan',  examplePath2:'beer',  examplePath3:'bowl',
      models:
    [
      {modelPath:'beer', modelTitle:'Beer'},
      {modelPath:'bowl', modelTitle:'Bowl'},
      {modelPath:'coke_can', modelTitle:'Coke Can'},
      {modelPath:'saucepan', modelTitle:'Saucepan'},
      {modelPath:'plastic_cup', modelTitle:'Plastic Cup'}
    ]},

    {path:'robocup', title:'Robocup', examplePath1:'robocup_3Dsim_ball',
    examplePath2:'robocup14_spl_goal', examplePath3:'robocup09_spl_field',
      models:
    [
      {modelPath:'robocup09_spl_field', modelTitle:'2009 SPL Field'},
      {modelPath:'robocup14_spl_field', modelTitle:'2014 SPL Field'},
      {modelPath:'robocup_3Dsim_field', modelTitle:'3D Sim. Field'},
      {modelPath:'robocup14_spl_goal', modelTitle:'SPL Goal'},
      {modelPath:'robocup_3Dsim_goal', modelTitle:'3D Sim. Goal'},
      {modelPath:'robocup_spl_ball', modelTitle:'SPL Ball'},
      {modelPath:'robocup_3Dsim_ball', modelTitle:'3D Sim. Ball'}
    ]},

    {path:'first', title:'FIRST', examplePath1:'frc2016_field',
    examplePath2:'frc2016_chevaldefrise', examplePath3:'frc_field_2015',
      models:
    [
      {modelPath:'frc2016_chevaldefrise', modelTitle:'Cheval de Frise'},
      {modelPath:'frc2016_drawbridge', modelTitle:'Draw Bridge'},
      {modelPath:'frc2016_field', modelTitle:'2016 Field'},
      {modelPath:'frc2016_lowbar', modelTitle:'Low Bar'},
      {modelPath:'frc2016_moat', modelTitle:'Moat'},
      {modelPath:'frc2016_portcullis', modelTitle:'Portcullis'},
      {modelPath:'frc2016_ramparts', modelTitle:'Ramparts'},
      {modelPath:'frc2016_rockwall', modelTitle:'Rockwall'},
      {modelPath:'frc2016_roughterrain', modelTitle:'Rough Terrain'},
      {modelPath:'frc2016_sallyport', modelTitle:'Sallyport'},
      {modelPath:'frc_field_2015', modelTitle:'2015 Field'}
    ]},

    {path:'robots', title:'Robots',
    examplePath1:'pioneer3at', examplePath2:'turtlebot', examplePath3:'pr2',
      models:
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
      {modelPath:'youbot', modelTitle:'YouBot'},
      {modelPath:'cart_rigid_suspension', modelTitle:'Cart: rigid suspension'},
      {modelPath:'cart_soft_suspension', modelTitle:'Cart: soft suspension'},
      {modelPath:'cessna', modelTitle:'Cessna'},
      {modelPath:'follower_vehicle', modelTitle:'Follower Vehicle'},
      {modelPath:'iris_with_standoffs', modelTitle:'Iris with Standoffs'},
      {modelPath:'iris_with_standoffs_demo',
        modelTitle:'Iris with Standoffs (demo)'},
      {modelPath:'mpl_right_arm', modelTitle:'MPL right arm'},
      {modelPath:'mpl_right_forearm', modelTitle:'MPL right forearm'},
      {modelPath:'parrot_bebop_2', modelTitle:'Parrot Bebop 2'},
      {modelPath:'quadrotor', modelTitle:'Quadrotor'},
      {modelPath:'submarine', modelTitle:'Submarine'},
      {modelPath:'submarine_buoyant', modelTitle:'Submarine (buoyant)'},
      {modelPath:'submarine_sinking', modelTitle:'Submarine (sinking)'},
      {modelPath:'warehouse_robot', modelTitle:'Warehouse Robot'},
      {modelPath:'zephyr_delta_wing', modelTitle:'Zephyr Delta Wing'}
    ]},

    {path:'sensors', title:'Sensors',
    examplePath1:'camera', examplePath2:'hokuyo', examplePath3:'kinect',
      models:
    [
      {modelPath:'camera', modelTitle:'Camera'},
      {modelPath:'stereo_camera', modelTitle:'Stereo Camera'},
      {modelPath:'hokuyo', modelTitle:'Hokuyo'},
      {modelPath:'kinect', modelTitle:'Kinect'},
      {modelPath:'depth_camera', modelTitle:'Depth Camera'},
      {modelPath:'gimbal_small_2d', modelTitle:'Gimbal Small 2D'},
      {modelPath:'velodyne_hdl32', modelTitle:'Velodyne HDL-32'}
    ]},

    {path:'street', title:'Street', examplePath1:'dumpster',
    examplePath2:'drc_practice_angled_barrier_45', examplePath3:'fire_hydrant',
      models:
    [
      {modelPath:'cinder_block', modelTitle:'Cinder Block'},
      {modelPath:'cinder_block_2', modelTitle:'Cinder Block 2'},
      {modelPath:'cinder_block_wide', modelTitle:'Cinder Block Wide'},
      {modelPath:'construction_barrel', modelTitle:'Construction Barrel'},
      {modelPath:'construction_cone', modelTitle:'Construction Cone'},
      {modelPath:'drc_practice_angled_barrier_45',
        modelTitle:'Angled Barrier 45'},
      {modelPath:'drc_practice_angled_barrier_135',
        modelTitle:'Angled Barrier 135'},
      {modelPath:'drc_practice_block_wall', modelTitle:'Block Wall'},
      {modelPath:'drc_practice_orange_jersey_barrier',
        modelTitle:'Jersey Barrier (Orange)'},
      {modelPath:'drc_practice_white_jersey_barrier',
        modelTitle:'Jersey Barrier (White)'},
      {modelPath:'drc_practice_truss', modelTitle:'Truss'},
      {modelPath:'drc_practice_yellow_parking_block',
        modelTitle:'Parking Block'},
      {modelPath:'dumpster', modelTitle:'Dumpster'},
      {modelPath:'fire_hydrant', modelTitle:'Fire Hydrant'},
      {modelPath:'jersey_barrier', modelTitle:'Jersey Barrier'},
      {modelPath:'lamp_post', modelTitle:'Lamp Post'},
      {modelPath:'mailbox', modelTitle:'Mailbox'},
      {modelPath:'mud_box', modelTitle:'Mud Box'},
      {modelPath:'nist_fiducial_barrel', modelTitle:'Fiducial Barrel'},
      {modelPath:'speed_limit_sign', modelTitle:'Speed Limit Sign'},
      {modelPath:'stop_sign', modelTitle:'Stop Sign'},
      {modelPath:'first_2015_trash_can', modelTitle:'Trash Can'},
      {modelPath:'person_standing', modelTitle:'Person Standning'},
      {modelPath:'person_walking', modelTitle:'Person Walking'}
    ]},

    {path:'tools', title:'Tools', examplePath1:'hammer',
    examplePath2:'polaris_ranger_ev', examplePath3:'cordless_drill', models:
    [
      {modelPath:'cordless_drill', modelTitle:'Cordless Drill'},
      {modelPath:'fire_hose_long', modelTitle:'Fire Hose'},
      {modelPath:'fire_hose_long_curled', modelTitle:'Fire Hose Long Curled'},
      {modelPath:'hammer', modelTitle:'Hammer'},
      {modelPath:'monkey_wrench', modelTitle:'Monkey Wrench'},
      {modelPath:'polaris_ranger_ev', modelTitle:'Polaris Ranger EV'},
      {modelPath:'polaris_ranger_xp900', modelTitle:'Polaris Ranger XP900'},
      {modelPath:'polaris_ranger_xp900_no_roll_cage',
        modelTitle:'Polaris Ranger without roll cage'},
      {modelPath:'utility_cart', modelTitle:'Utility Cart'},
      {modelPath:'car_wheel', modelTitle:'Car Wheel'},
      {modelPath:'arm_part', modelTitle:'Arm Part'},
      {modelPath:'gear_part', modelTitle:'Gear Part'},
      {modelPath:'gasket_part', modelTitle:'Gasket Part'},
      {modelPath:'disk_part', modelTitle:'Disk Part'},
      {modelPath:'pulley_part', modelTitle:'Pulley Part'},
      {modelPath:'piston_rod_part', modelTitle:'Piston Rod Part'},
      {modelPath:'t_brace_part', modelTitle:'T Brace Part'},
      {modelPath:'u_joint_part', modelTitle:'U Joint Part'}
    ]},

    {path:'misc', title:'Misc.', examplePath1:'brick_box_3x1x3',
    examplePath2:'drc_practice_4x4x20',
      examplePath3:'double_pendulum_with_base', models:
    [
      {modelPath:'double_pendulum_with_base',
        modelTitle:'Double Pendulum With Base'},
      {modelPath:'breakable_test', modelTitle:'Breakable_test'},
      {modelPath:'brick_box_3x1x3', modelTitle:'Brick Box 3x1x3'},
      {modelPath:'cardboard_box', modelTitle:'Cardboard Box'},
      {modelPath:'cube_20k', modelTitle:'Cube 20k'},
      {modelPath:'cricket_ball', modelTitle:'Cricket Ball'},
      {modelPath:'marble_1_5cm', modelTitle:'Marble 1.5 cm'},
      {modelPath:'metal_peg', modelTitle:'Metal Peg'},
      {modelPath:'metal_peg_board', modelTitle:'Metal Peg Board'},
      {modelPath:'mars_rover', modelTitle:'Mars Rover'},
      {modelPath:'stone_10_2_5_1cm', modelTitle:'Stone 10 x 2.5 x 1 cm'},
      {modelPath:'tube_2_25cm', modelTitle:'Tube 2.25 cm'},
      {modelPath:'tube_9_5mm', modelTitle:'Tube 9.5 mm'},
      {modelPath:'wood_block_10_2_1cm', modelTitle:'Wood Block 10 x 2 x 1 cm'},
      {modelPath:'wood_cube_10cm', modelTitle:'Wood Cube 10 cm'},
      {modelPath:'wood_cube_2_5cm', modelTitle:'Wood Cube 2.5 cm'},
      {modelPath:'wood_cube_5cm', modelTitle:'Wood Cube 5 cm'},
      {modelPath:'wood_cube_7_5cm', modelTitle:'Wood Cube 7.5 cm'},
      {modelPath:'wooden_board', modelTitle:'Wooden Board'},
      {modelPath:'wooden_case', modelTitle:'Wooden Case'},
      {modelPath:'wooden_case_metal_peg', modelTitle:'Wooden Case Metal Peg '},
      {modelPath:'wooden_case_wooden_peg', modelTitle:'Wooden Case Wooden Peg'},
      {modelPath:'wooden_peg', modelTitle:'Wooden Peg'},
      {modelPath:'wooden_peg_board', modelTitle:'Wooden Peg Board'},
      {modelPath:'drc_practice_2x4', modelTitle:'2x4 Lumber'},
      {modelPath:'drc_practice_2x6', modelTitle:'2x6 Lumber'},
      {modelPath:'drc_practice_4x4x20', modelTitle:'4x4x20 Lumber'},
      {modelPath:'drc_practice_4x4x40', modelTitle:'4x4x40 Lumber'},
      {modelPath:'drc_practice_blue_cylinder', modelTitle:'Blue Cylinder'},
      {modelPath:'drc_practice_wood_slats', modelTitle:'Wood Slats'},
      {modelPath:'nist_elevated_floor_120', modelTitle:'Elevated Floor 120'},
      {modelPath:'number1', modelTitle:'Number 1'},
      {modelPath:'number2', modelTitle:'Number 2'},
      {modelPath:'number3', modelTitle:'Number 3'},
      {modelPath:'number4', modelTitle:'Number 4'},
      {modelPath:'number5', modelTitle:'Number 5'},
      {modelPath:'number6', modelTitle:'Number 6'},
      {modelPath:'number7', modelTitle:'Number 7'},
      {modelPath:'number8', modelTitle:'Number 8'},
      {modelPath:'number9', modelTitle:'Number 9'},
      {modelPath:'ragdoll', modelTitle:'Ragdoll'},
      {modelPath:'textured_shapes', modelTitle:'Textured shapes'}
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
  $('#view-joints').buttonMarkup({icon: 'false'});
  $('#view-com').buttonMarkup({icon: 'false'});
  globalEmitter.emit('toggle_notifications');
  globalEmitter.emit('show_orbit_indicator');

  $( '#clock-touch' ).popup('option', 'arrow', 't');
  $('#notification-popup-screen').remove();
  $('.tab').css('border-left-color', tabColors.unselected);

  if (isWideScreen())
  {
    globalEmitter.emit('openTab', 'mainMenu', 'mainMenu');
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
    $('#logplay-slider')
        .css('width','100%');

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
        globalEmitter.emit('pointerOnMenu');
    });

    $('.gzGUI').touchend(function(event){
        globalEmitter.emit('pointerOffMenu');
    });

    // long press on canvas
    var press_time_container = 400;
    $('#container')
      .on('touchstart', function (event) {
        $(this).data('checkdown', setTimeout(function () {
          globalEmitter.emit('longpress_container_start',event);
        }, press_time_container));
      })
      .on('touchend', function (event) {
        clearTimeout($(this).data('checkdown'));
        globalEmitter.emit('longpress_container_end',event,false);
      })
      .on('touchmove', function (event) {
        clearTimeout($(this).data('checkdown'));
        $(this).data('checkdown', setTimeout(function () {
          globalEmitter.emit('longpress_container_start',event);
        }, press_time_container));
        globalEmitter.emit('longpress_container_move',event);
      });

    // long press on insert menu item
    var press_time_insert = 400;
    $('[id^="insert-entity-"]')
      .on('touchstart', function (event) {
        var path = $(this).attr('id');
        path = path.substring(14); // after 'insert-entity-'
        $(this).data('checkdown', setTimeout(function () {
          globalEmitter.emit('longpress_insert_start', event, path);
        }, press_time_insert));
      })
      .on('touchend', function (event) {
        clearTimeout($(this).data('checkdown'));
        globalEmitter.emit('longpress_insert_end',event,false);
      })
      .on('touchmove', function (event) {
        clearTimeout($(this).data('checkdown'));
        globalEmitter.emit('longpress_insert_move',event);
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
        globalEmitter.emit('spawn_entity_start', path);
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
        .css('width', '11.5em')
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
        globalEmitter.emit('pointerOnMenu');
    });

    $('.gzGUI').mouseleave(function(event){
        globalEmitter.emit('pointerOffMenu');
    });

    // right-click
    $('#container').mousedown(function(event)
        {
          event.preventDefault();
          if(event.which === 3)
          {
            globalEmitter.emit('right_click', event);
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
          globalEmitter.emit('openTab', lastOpenMenu[idMenu], idMenu);
        }
        else
        {
          globalEmitter.emit('closeTabs', true);
        }
      });

  $('.closePanels').click(function()
      {
        globalEmitter.emit('closeTabs', true);
      });

  $('#view-mode').click(function()
      {
        globalEmitter.emit('manipulation_mode', 'view');
      });
  $('#translate-mode').click(function()
      {
        globalEmitter.emit('manipulation_mode', 'translate');
      });
  $('#rotate-mode').click(function()
      {
        globalEmitter.emit('manipulation_mode', 'rotate');
      });

  $('[id^="header-insert-"]').click(function()
      {
        var entity = $(this).attr('id');
        entity = entity.substring(14); // after 'header-insert-'
        globalEmitter.emit('closeTabs', false);
        globalEmitter.emit('spawn_entity_start', entity);
      });

  $('#play').click(function()
      {
        if ( $('#playText').html().indexOf('Play') !== -1 )
        {
          globalEmitter.emit('pause', false);
          globalEmitter.emit('notification_popup','Physics engine running');
        }
        else
        {
          globalEmitter.emit('pause', true);
          globalEmitter.emit('notification_popup','Physics engine paused');
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
          $('#notification-popup').popup('close');
          $('#clock-touch').popup('open', {
              x:position.left+emUnits(1.6),
              y:emUnits(4)});
        }
      });

  $('#reset-model').click(function()
      {
        globalEmitter.emit('reset', 'model');
        globalEmitter.emit('closeTabs', false);
      });
  $('#reset-world').click(function()
      {
        globalEmitter.emit('reset', 'world');
        globalEmitter.emit('closeTabs', false);
      });
  $('#reset-view').click(function()
      {
        globalEmitter.emit('view_reset');
        globalEmitter.emit('closeTabs', false);
      });
  $('#view-grid').click(function()
      {
        globalEmitter.emit('show_grid', 'toggle');
        globalEmitter.emit('closeTabs', false);
      });
  $('#view-collisions').click(function()
      {
        globalEmitter.emit('show_collision');
        globalEmitter.emit('closeTabs', false);
      });
  $('#view-orbit-indicator').click(function()
      {
        globalEmitter.emit('show_orbit_indicator');
        globalEmitter.emit('closeTabs', false);
      });
  $( '#snap-to-grid' ).click(function()
      {
        globalEmitter.emit('snap_to_grid');
        globalEmitter.emit('closeTabs', false);
      });
  $( '#open-tree-when-selected' ).click(function()
      {
        globalEmitter.emit('openTreeWhenSelected');
        globalEmitter.emit('closeTabs', false);
      });
  $( '#toggle-notifications' ).click(function()
      {
        globalEmitter.emit('toggle_notifications');
        globalEmitter.emit('closeTabs', false);
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
    globalEmitter.emit('set_view_as','transparent');
  });

  $( '#view-wireframe' ).click(function() {
    $('#model-popup').popup('close');
    globalEmitter.emit('set_view_as','wireframe');
  });

  $( '#view-joints' ).click(function() {
    if ($('#view-joints a').css('color') === 'rgb(255, 255, 255)')
    {
      $('#model-popup').popup('close');
      globalEmitter.emit('view_joints');
    }
  });

  $( '#view-com' ).click(function() {
    if ($('#view-com a').css('color') === 'rgb(255, 255, 255)')
    {
      $('#model-popup').popup('close');
      globalEmitter.emit('view_com');
    }
  });

  $( '#view-inertia' ).click(function() {
    if ($('#view-inertia a').css('color') === 'rgb(255, 255, 255)')
    {
      $('#model-popup').popup('close');
      globalEmitter.emit('view_inertia');
    }
  });

  $( '#delete-entity' ).click(function()
  {
    globalEmitter.emit('delete_entity');
  });
  $(window).resize(function()
  {
    globalEmitter.emit('resizePanel');
  });

  $('#logplay-slider-input').on('slidestop', function(event, ui)
  {
    globalEmitter.emit('logPlaySlideStop', $('#logplay-slider-input').val());
  });
  $('#logplay-slider-input').on('slidestart', function(event, ui)
  {
    globalEmitter.emit('logPlaySlideStart');
  });
  $('#logplay-rewind').click(function()
      {
        globalEmitter.emit('logPlayRewind');
      });
  $('#logplay-stepback').click(function()
      {
        globalEmitter.emit('logPlayStepback');
      });
  $('#logplay-play').click(function()
      {
        if ( $('#logplay-playText').html().indexOf('Play') !== -1 )
        {
          globalEmitter.emit('pause', false);
        }
        else
        {
          globalEmitter.emit('pause', true);
        }
      });
  $('#logplay-stepforward').click(function()
      {
        globalEmitter.emit('logPlayStepforward');
      });
  $('#logplay-forward').click(function()
      {
        globalEmitter.emit('logPlayForward');
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
    globalEmitter.emit('openTab', 'propertyPanel-' + convertNameId(name),
        'treeMenu');
    globalEmitter.emit('selectEntity', name);
  };

  $scope.openEntityMenu = function (event, name)
  {
    $('#model-popup').popup('close');
    globalEmitter.emit('openEntityPopup', event, name);
  };

  $scope.openTab = function (tab)
  {
    globalEmitter.emit('openTab', tab, 'treeMenu');
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

  $scope.expandProperty = function (prop, modelName, subPropShortName,
    subPropName, parentProp)
  {
    var modelId = convertNameId(modelName);
    var idContent = 'expandable-' + prop + '-' + modelId;
    var idHeader = 'expand-' + prop + '-' + modelId;

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
        globalEmitter.emit('setPoseStats', modelName, subPropName);
      }
    }
  };

  $scope.changePose = function(prop1, prop2, name, value)
  {
    globalEmitter.emit('setPose', prop1, prop2, convertNameId(name), value);
  };

  $scope.changeLight = function(prop, name, value)
  {
    globalEmitter.emit('setLight', prop, convertNameId(name), value);
  };

  $scope.toggleProperty = function(prop, entity, subEntity)
  {
    // only for links so far
    globalEmitter.emit('toggleProperty', prop, entity, subEntity);
  };
}]);

// Insert menu
gzangular.controller('insertControl', ['$scope', function($scope)
{
  $scope.categories = modelList;

  $scope.spawnEntity = function(path)
  {
    globalEmitter.emit('spawn_entity_start', path);
  };

  $scope.openTab = function (tab)
  {
    globalEmitter.emit('openTab', tab, 'insertMenu');
  };
}]);


/**
 * Graphical user interface
 * @constructor
 * @param {GZ3D.Scene} scene - A scene to connect to
 */
GZ3D.Gui = function(scene)
{
  this.emitter = globalEmitter || new EventEmitter2({verboseMemoryLeak: true});
  this.scene = scene;
  this.domElement = scene.getDomElement();
  this.spawnState = null;
  this.longPressContainerState = null;
  this.showNotifications = false;
  this.openTreeWhenSelected = false;
  this.modelStatsDirty = false;

  this.logPlay = new GZ3D.LogPlay();

  var that = this;

  // throttle model pose updates, otherwise complex model kills framerate
  setInterval(function() {
    if (that.modelStatsDirty)
    {
      that.updateStats();
      that.modelStatsDirty = false;
    }
  }, 20);

  // On manipulation
  this.emitter.on('manipulation_mode',
      function(mode)
      {
        that.scene.setManipulationMode(mode);
        var space = that.scene.modelManipulator.space;

        if (mode === 'view')
        {
          that.emitter.emit('notification_popup', 'View mode');
        }
        else
        {
          that.emitter.emit('notification_popup',
              mode.charAt(0).toUpperCase()+
              mode.substring(1)+' mode in '+
              space.charAt(0).toUpperCase()+
              space.substring(1)+' space');
        }
      }
  );

  // Create temp model
  this.emitter.on('spawn_entity_start', function(entity)
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
        that.emitter.emit('notification_popup',
            'Place '+name+' at the desired position');
      }
  );

  // Move temp model by touch
  this.emitter.on('spawn_entity_move', function(event)
      {
        that.spawnState = 'MOVE';
        that.scene.spawnModel.onTouchMove(event,false);
      }
  );
  // Place temp model by touch
  this.emitter.on('spawn_entity_end', function()
      {
        if (that.spawnState === 'MOVE')
        {
          that.scene.spawnModel.onTouchEnd();
        }
        that.spawnState = null;
      }
  );

  this.emitter.on('reset', function(resetType)
      {
        if (resetType === 'world')
        {
          that.emitter.emit('notification_popup','Reset world');
        }
        else if (resetType === 'model')
        {
          that.emitter.emit('notification_popup','Reset model poses');
        }
      }
  );

  this.emitter.on('model_reset', function()
      {
        // TODO: no need to emit another one
        that.emitter.emit('reset', 'model');
        that.emitter.emit('notification_popup','Reset model poses');
      }
  );

  this.emitter.on('view_reset', function()
      {
        that.scene.resetView();
        that.emitter.emit('notification_popup','Reset view');
      }
  );

  this.emitter.on('show_collision', function()
      {
        that.scene.showCollision(!that.scene.showCollisions);
        if(!that.scene.showCollisions)
        {
          $('#view-collisions').buttonMarkup({icon: 'false'});
          that.emitter.emit('notification_popup','Hiding collisions');
        }
        else
        {
          $('#view-collisions').buttonMarkup({icon: 'check'});
          that.emitter.emit('notification_popup','Viewing collisions');
        }
      }
  );

  this.emitter.on('show_grid', function(option)
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
          that.emitter.emit('notification_popup','Hiding grid');
        }
        else
        {
          $('#view-grid').buttonMarkup({icon: 'check'});
          that.emitter.emit('notification_popup','Viewing grid');
        }
      }
  );

   this.emitter.on('show_orbit_indicator', function()
      {
        that.scene.controls.showTargetIndicator =
            !that.scene.controls.showTargetIndicator;
        if(!that.scene.controls.showTargetIndicator)
        {
          $('#view-orbit-indicator').buttonMarkup({icon: 'false'});
          that.emitter.emit('notification_popup','Hiding orbit indicator');
        }
        else
        {
          $('#view-orbit-indicator').buttonMarkup({icon: 'check'});
          that.emitter.emit('notification_popup','Viewing orbit indicator');
        }
      }
  );

  this.emitter.on('snap_to_grid',
      function ()
      {
        if(that.scene.modelManipulator.snapDist === null)
        {
          $('#snap-to-grid').buttonMarkup({icon: 'check'});
          that.scene.modelManipulator.snapDist = 0.5;
          that.scene.spawnModel.snapDist = that.scene.modelManipulator.snapDist;
          that.emitter.emit('notification_popup','Snapping to grid');
        }
        else
        {
          $('#snap-to-grid').buttonMarkup({icon: 'false'});
          that.scene.modelManipulator.snapDist = null;
          that.scene.spawnModel.snapDist = null;
          that.emitter.emit('notification_popup','Not snapping to grid');
        }
      }
  );

  this.emitter.on('openTreeWhenSelected', function ()
      {
        that.openTreeWhenSelected = !that.openTreeWhenSelected;
        if(!that.openTreeWhenSelected)
        {
          $('#open-tree-when-selected').buttonMarkup({icon: 'false'});
        }
        else
        {
          $('#open-tree-when-selected').buttonMarkup({icon: 'check'});
        }
      }
  );

  this.emitter.on('toggle_notifications', function ()
      {
        that.showNotifications = !that.showNotifications;
        if(!that.showNotifications)
        {
          $('#toggle-notifications').buttonMarkup({icon: 'false'});
        }
        else
        {
          $('#toggle-notifications').buttonMarkup({icon: 'check'});
        }
      }
  );


  this.emitter.on('longpress_container_start',
      function (event)
      {
        if (event.originalEvent.touches.length !== 1 ||
            that.scene.modelManipulator.hovered ||
            that.scene.spawnModel.active)
        {
          that.emitter.emit('longpress_container_end',
              event.originalEvent,true);
        }
        else
        {
          that.scene.showRadialMenu(event);
          that.longPressContainerState = 'START';
        }
      }
  );

  this.emitter.on('longpress_container_end', function(event,cancel)
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
                  that.emitter.emit('set_view_as','transparent');
                }
                else if (type === 'wireframe')
                {
                  that.emitter.emit('set_view_as','wireframe');
                }
                else if (type === 'joints')
                {
                  that.scene.selectEntity(entity);
                  that.emitter.emit('view_joints');
                }

              });
          }
        }
      }
  );

  this.emitter.on('longpress_container_move', function(event)
      {
        if (event.originalEvent.touches.length !== 1)
        {
          that.emitter.emit('longpress_container_end',event.originalEvent,true);
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

  this.emitter.on('longpress_insert_start', function (event, path)
      {
        navigator.vibrate(50);
        that.emitter.emit('spawn_entity_start', path);
        event.stopPropagation();
      }
  );

  this.emitter.on('longpress_insert_end', function(event)
      {
        that.emitter.emit('spawn_entity_end');
      }
  );

  this.emitter.on('longpress_insert_move', function(event)
      {
        that.emitter.emit('spawn_entity_move', event);
        event.stopPropagation();
      }
  );

  var notificationTimeout;
  this.emitter.on('notification_popup',
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

  this.emitter.on('right_click', function (event)
      {
        that.scene.onRightClick(event, function(entity)
            {
              that.openEntityPopup(event, entity);
            });
      }
  );

  this.emitter.on('set_view_as', function (viewAs)
      {
        that.scene.setViewAs(that.scene.selectedEntity, viewAs);
      }
  );

  this.emitter.on('view_joints', function ()
      {
        that.scene.viewJoints(that.scene.selectedEntity);
      }
  );

  this.emitter.on('view_inertia', function ()
      {
        that.scene.viewInertia(that.scene.selectedEntity);
      }
  );

  this.emitter.on('view_com', function ()
      {
        that.scene.viewCOM(that.scene.selectedEntity);
      }
  );

  this.emitter.on('delete_entity', function ()
      {
        that.emitter.emit('deleteEntity',that.scene.selectedEntity);
        $('#model-popup').popup('close');
        that.scene.selectEntity(null);
      }
  );

  this.emitter.on('pointerOnMenu', function ()
      {
        that.scene.pointerOnMenu = true;
      }
  );

  this.emitter.on('pointerOffMenu', function ()
      {
        that.scene.pointerOnMenu = false;
      }
  );

  this.emitter.on('openTab', function (id, parentId)
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

        that.emitter.emit('resizePanel');
      }
  );

  this.emitter.on('closeTabs', function (force)
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

  this.emitter.on('setTreeSelected', function (object)
      {
        for (var i = 0; i < modelStats.length; ++i)
        {
          if (modelStats[i].name === object)
          {
            modelStats[i].selected = 'selectedTreeItem';
            if (this.openTreeWhenSelected)
            {
              that.emitter.emit('openTab', 'propertyPanel-'+
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
              that.emitter.emit('openTab', 'propertyPanel-' +
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

  this.emitter.on('setTreeDeselected', function ()
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

  this.emitter.on('selectEntity', function (name)
      {
        var object = that.scene.getByName(name);
        that.scene.selectEntity(object);
      }
  );

  this.emitter.on('openEntityPopup', function (event, name)
      {
        if (!isTouchDevice)
        {
          var object = that.scene.getByName(name);
          that.openEntityPopup(event, object);
        }
      }
  );

  this.emitter.on('setPoseStats', function (modelName, linkName)
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

  this.emitter.on('resizePanel', function ()
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

  this.emitter.on('setPose', function (prop1, prop2, name, value)
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

  this.emitter.on('setLight', function (prop, name, value)
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

  this.emitter.on('toggleProperty', function (prop, subEntityName)
      {
        var entity = that.scene.getByName(subEntityName);
        entity.serverProperties[prop] = !entity.serverProperties[prop];

        that.scene.emitter.emit('linkChanged', entity);
      }
  );

  this.emitter.on('setLightStats', function (stats, action)
      {
        that.setLightStats(stats, action);
      }
  );

  this.emitter.on('setModelStats', function (stats, action)
      {
        that.setModelStats(stats, action);
      }
  );

  this.emitter.on('setSceneStats', function (stats)
      {
        that.setSceneStats(stats);
      }
  );

  this.emitter.on('setPhysicsStats', function (stats)
      {
        that.setPhysicsStats(stats);
      }
  );

  this.emitter.on('setPaused', function (stats)
      {
        that.setPaused(stats);
      }
  );

  this.emitter.on('setLogPlayVisible', function (stats)
      {
        that.setLogPlayVisible(stats);
      }
  );

  this.emitter.on('setLogPlayStats', function (simTime, startTime, endTime)
      {
        that.setLogPlayStats(simTime, startTime, endTime);
      }
  );

  this.emitter.on('setRealTime', function (stats)
      {
        that.setRealTime(stats);
      }
  );

  this.emitter.on('setSimTime', function (stats)
      {
        that.setSimTime(stats);
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
  // pause'd' event to inidicate simulation pause state has changed
  // this is different from the 'pause' event which indicates user has pressed
  // the play/pause button.
  this.emitter.emit('paused', paused);
};

/**
 * Update displayed real time
 * @param {string} realTime
 */
GZ3D.Gui.prototype.setRealTime = function(realTime)
{
  $('.real-time-value').text(formatTime(realTime));
};

/**
 * Update displayed simulation time
 * @param {string} simTime
 */
GZ3D.Gui.prototype.setSimTime = function(simTime)
{
  $('.sim-time-value').text(formatTime(simTime));
};

var sceneStats = {};
/**
 * Update scene stats on scene tree
 * @param {} stats
 */
GZ3D.Gui.prototype.setSceneStats = function(stats)
{
  sceneStats['ambient'] = this.round(stats.ambient, true);
  sceneStats['background'] = this.round(stats.background, true);
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
  physicsStats['max_step_size'] = this.round(
      physicsStats['max_step_size'], false, 3);
  physicsStats['gravity'] = this.round(
      physicsStats['gravity'], false, 3);
  physicsStats['sor'] = this.round(
      physicsStats['sor'], false, 3);
  physicsStats['cfm'] = this.round(
      physicsStats['cfm'], false, 3);
  physicsStats['erp'] = this.round(
      physicsStats['erp'], false, 3);
  physicsStats['contact_max_correcting_vel'] = this.round(
      physicsStats['contact_max_correcting_vel'], false, 3);
  physicsStats['contact_surface_layer'] = this.round(
      physicsStats['contact_surface_layer'], false, 3);

  this.updateStats();
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
            id: convertNameId(modelName),
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
      if (stats.link)
      {
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
      }

      // joints
      if (stats.joint)
      {
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
      this.updateStats();
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

        if (link[0])
        {
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
      }
      // Update pose stats only if they're being displayed and are not focused
      var modelId = convertNameId(modelName);
      if (!((linkShortName &&
          !$('#expandable-pose-'+modelId+'-'+linkShortName).is(':visible'))||
          (!linkShortName &&
          !$('#expandable-pose-'+modelId).is(':visible'))||
          $('#expandable-pose-'+modelId+' input').is(':focus')))
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
        // throttle model pose updates
        this.updateModelStatsAsync();
      }
    }
  }
  else if (action === 'delete')
  {
    this.deleteFromStats('model', modelName);
    this.updateStats();
  }
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
            id: convertNameId(name),
            thumbnail: thumbnail,
            selected: 'unselectedTreeItem',
            position: formatted.pose.position,
            orientation: formatted.pose.orientation,
            diffuse: formatted.diffuse,
            specular: formatted.specular,
            color: formatted.color,
            range: stats.range,
            attenuation: this.round(stats.attenuation, false, null),
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

GZ3D.Gui.prototype.updateModelStatsAsync = function()
{
  this.modelStatsDirty = true;
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
    $('#view-joints').css('visibility','collapse');
    $('#view-com').css('visibility','collapse');
    $('#view-inertia').css('visibility','collapse');
    $('#model-popup').popup('open',
      {x: event.clientX + emUnits(6),
       y: event.clientY + emUnits(-8)});
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

    if (entity.children.length === 0)
    {
      $('#view-inertia a').css('color', '#888888');
      $('#view-inertia').buttonMarkup({icon: 'false'});
      $('#view-com a').css('color', '#888888');
      $('#view-com').buttonMarkup({icon: 'false'});
    }
    else
    {
      $('#view-inertia a').css('color', '#ffffff');
      $('#view-com a').css('color', '#ffffff');
      if (entity.getObjectByName('INERTIA_VISUAL', true))
      {
        $('#view-inertia').buttonMarkup({icon: 'check'});
      }
      else
      {
        $('#view-inertia').buttonMarkup({icon: 'false'});
      }
      if (entity.getObjectByName('COM_VISUAL', true))
      {
        $('#view-com').buttonMarkup({icon: 'check'});
      }
      else
      {
        $('#view-com').buttonMarkup({icon: 'false'});
      }
    }

    if (entity.joint === undefined || entity.joint.length === 0)
    {
      $('#view-joints a').css('color', '#888888');
      $('#view-joints').buttonMarkup({icon: 'false'});
    }
    else
    {
      $('#view-joints a').css('color', '#ffffff');
      if (entity.getObjectByName('JOINT_VISUAL', true))
      {
        $('#view-joints').buttonMarkup({icon: 'check'});
      }
      else
      {
        $('#view-joints').buttonMarkup({icon: 'false'});
      }
    }

    $('#view-transparent').css('visibility','visible');
    $('#view-wireframe').css('visibility','visible');
    $('#view-joints').css('visibility','visible');
    $('#view-com').css('visibility','visible');
    $('#view-inertia').css('visibility','visible');
    $('#model-popup').popup('open',
      {x: event.clientX + emUnits(6),
       y: event.clientY + emUnits(0)});
  }
};

/* eslint-disable */
/**
 * Format stats message for proper display
 * @param {} stats
 * @returns {Object.<position, orientation, inertial,diffuse, specular, attenuation>}
 */
/* eslint-enable */
GZ3D.Gui.prototype.formatStats = function(stats)
{
  var position, orientation;
  var quat, rpy;
  if (stats.pose)
  {
    position = this.round(stats.pose.position, false, null);

    quat = new THREE.Quaternion(stats.pose.orientation.x,
        stats.pose.orientation.y, stats.pose.orientation.z,
        stats.pose.orientation.w);

    rpy = new THREE.Euler();
    rpy.setFromQuaternion(quat);

    orientation = {roll: rpy._x, pitch: rpy._y, yaw: rpy._z};
    orientation = this.round(orientation, false, null);
  }
  var inertial;
  if (stats.inertial)
  {
    inertial = this.round(stats.inertial, false, 3);

    var inertialPose = stats.inertial.pose;
    inertial.pose = {};

    inertial.pose.position = {x: inertialPose.position.x,
                              y: inertialPose.position.y,
                              z: inertialPose.position.z};

    inertial.pose.position = this.round(inertial.pose.position, false, 3);

    quat = new THREE.Quaternion(inertialPose.orientation.x,
        inertialPose.orientation.y, inertialPose.orientation.z,
        inertialPose.orientation.w);

    rpy = new THREE.Euler();
    rpy.setFromQuaternion(quat);

    inertial.pose.orientation = {roll: rpy._x, pitch: rpy._y, yaw: rpy._z};
    inertial.pose.orientation = this.round(inertial.pose.orientation, false, 3);
  }
  var diffuse, colorHex, comp;
  var color = {};
  if (stats.diffuse)
  {
    diffuse = this.round(stats.diffuse, true);

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
    specular = this.round(stats.specular, true);

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
    axis1.direction = this.round(stats.axis1.xyz, false, 3);
  }
  var axis2;
  if (stats.axis2)
  {
    axis2 = {};
    axis2 = this.round(stats.axis2);
    axis2.direction = this.round(stats.axis2.xyz, false, 3);
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
 * Round numbers and format colors
 * @param {} stats
 * @param {} decimals - number of decimals to display, null for input fields
 * @returns result
 */
GZ3D.Gui.prototype.round = function(stats, isColor, decimals)
{
  var result = stats;
  if (typeof result === 'number')
  {
    result = this.roundNumber(result, isColor, decimals);
  }
  else // array of numbers
  {
    result = this.roundArray(result, isColor, decimals);
  }
  return result;
};

/**
 * Round number and format color
 * @param {} stats
 * @param {} decimals - number of decimals to display, null for input fields
 * @returns result
 */
GZ3D.Gui.prototype.roundNumber = function(stats, isColor, decimals)
{
  var result = stats;
  if (isColor)
  {
    result = Math.round(result * 255);
  }
  else
  {
    if (decimals === null)
    {
      result = Math.round(result*1000)/1000;
    }
    else
    {
      result = result.toFixed(decimals);
    }
  }
  return result;
};

/**
 * Round each number in an array
 * @param {} stats
 * @param {} decimals - number of decimals to display, null for input fields
 * @returns result
 */
GZ3D.Gui.prototype.roundArray = function(stats, isColor, decimals)
{
  var result = stats;
  for (var key in result)
  {
    if (typeof result[key] === 'number')
    {
      result[key] = this.roundNumber(result[key], isColor, decimals);
    }
  }
  return result;
};

/**
 * Format toggle items
 * @param {} stats: true / false
 * @returns {Object.<icon, title>}
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
      if ($('#propertyPanel-'+ convertNameId(name)).is(':visible'))
      {
        this.emitter.emit('openTab', 'treeMenu', 'treeMenu');
      }

      list.splice(i, 1);
      break;
    }
  }
};

/**
 * Set the visibility of the log play back widget
 * @param {} visible
 */
GZ3D.Gui.prototype.setLogPlayVisible = function(visible)
{
  if (visible === this.logPlay.isVisible())
  {
    return;
  }

  this.logPlay.setVisible(visible);

  // update UI to be in log playback mode
  if (visible)
  {
    $('#editMenu').hide();
    $('#insertMenuTab').hide();
    $('#manipulatorModeFieldset').hide();
    $('#simpleShapesFieldset').hide();
    $('#lightsFieldset').hide();
    $('#clock-mouse').hide();
    $('#clock-header-fieldset').hide();
    $('#play-header-fieldset').hide();
  }
  else
  {
    $('#editMenu').show();
    $('#insertMenuTab').show();
    $('#manipulatorModeFieldset').show();
    $('#simpleShapesFieldset').show();
    $('#lightsFieldset').show();
    $('#clock-mouse').show();
    $('#clock-header-fieldset').show();
    $('#play-header-fieldset').show();
  }
};

/**
 * Set the log play back stats
 * @param {} simTime
 * @param {} startTime
 * @param {} endTime
 */
GZ3D.Gui.prototype.setLogPlayStats = function(simTime, startTime, endTime)
{
  this.logPlay.setStats(simTime, startTime, endTime);
  $('.end-time-value').text(formatTime(endTime));
};


/**
 * Convert name to id and vice versa
 * @param {} name Entity Name
 * @param {} reverse convert id to name
 */
var convertNameId = function(name, reverse)
{
  if (reverse)
  {
    return name.replace(new RegExp('_gzspace_', 'g'), ' ');
  }
  else
  {
    return name.replace(new RegExp(' ', 'g'), '_gzspace_');
  }
};

/**
 * Format time string
 * @param {} time object
 */
var formatTime = function(time)
{
  var timeSec = time.sec;
  var timeNSec = time.nsec;

  var timeDay = Math.floor(timeSec / 86400);
  timeSec -= timeDay * 86400;

  var timeHour = Math.floor(timeSec / 3600);
  timeSec -= timeHour * 3600;

  var timeMin = Math.floor(timeSec / 60);
  timeSec -= timeMin * 60;

  var timeMsec = Math.floor(timeNSec * 1e-6);

  var timeValue = '';

/*
  if (timeDay < 10)
  {
    timeValue += '0';
  }
  timeValue += timeDay.toFixed(0)  + ' ';
*/
  if (timeHour < 10)
  {
    timeValue += '0';
  }
  timeValue += timeHour.toFixed(0) + ':';
  if (timeMin < 10)
  {
    timeValue += '0';
  }
  timeValue += timeMin.toFixed(0) + ':';
  if (timeSec < 10)
  {
    timeValue += '0';
  }
  timeValue += timeSec.toFixed(0) + '.';

  timeValue += ('00' + timeMsec.toFixed(0)).slice(-3);

  return timeValue;
};

/**
 * Class responsible for communication with the backend via a websocket, it
 * forwards user commands to the server and propagates updates coming from the
 * server to other classes.
 * @constructor
 * @param {GZ3D.Scene} scene - A scene to connect to
 */
GZ3D.GZIface = function(scene, url)
{
  this.emitter = globalEmitter || new EventEmitter2({verboseMemoryLeak: true});
  this.scene = scene;
  this.url = url || (location.hostname + ':' + location.port);

  this.isConnected = false;

  this.material = [];
  this.entityMaterial = {};

  this.connect();
  this.visualsToAdd = [];

  this.numConnectionTrials = 0;
  this.maxConnectionTrials = 30; // try to connect 30 times
  this.timeToSleepBtwTrials = 1000; // wait 1 second between connection trials
};

/**
 * Attempt to establish websocket connection.
 */
GZ3D.GZIface.prototype.connect = function()
{
  this.webSocket = new ROSLIB.Ros({
    url : 'ws://' + this.url
  });

  var that = this;
  this.webSocket.on('connection', function() {
    that.onConnected();
  });
  this.webSocket.on('error', function() {
    that.onError();
  });

  this.numConnectionTrials++;
};

/**
 * Callback when the websocket fails to connect.
 */
GZ3D.GZIface.prototype.onError = function()
{
  // Notify others about connection failure only once
  if (this.numConnectionTrials === 1)
  {
    this.emitter.emit('connectionError');
  }

  var that = this;
  // retry to connect after certain time
  if (this.numConnectionTrials < this.maxConnectionTrials)
  {
    setTimeout(function() {
      that.connect();
    }, this.timeToSleepBtwTrials);
  }
};

/**
 * Callback when the websocket connects successfully.
 */
GZ3D.GZIface.prototype.onConnected = function()
{
  this.isConnected = true;
  this.emitter.emit('connection');

  this.heartbeatTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/heartbeat',
    messageType : 'heartbeat',
  });

  var that = this;
  var publishHeartbeat = function()
  {
    var hearbeatMsg =
    {
      alive : 1
    };
    that.heartbeatTopic.publish(hearbeatMsg);
  };

  setInterval(publishHeartbeat, 5000);

  var statusTopic = new ROSLIB.Topic({
    ros: this.webSocket,
    name: '~/status',
    messageType : 'status',
  });

  var statusUpdate = function(message)
  {
    if (message.status === 'error')
    {
      that.isConnected = false;
      this.emitter.emit('gzstatus', 'error');
    }
  };
  statusTopic.subscribe(statusUpdate.bind(this));

  var materialTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/material',
    messageType : 'material',
  });

  var materialUpdate = function(message)
  {
    this.material = message;
    this.emitter.emit('material', this.material);

  };
  materialTopic.subscribe(materialUpdate.bind(this));

  this.sceneTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/scene',
    messageType : 'scene',
  });

  var sceneUpdate = function(message)
  {
    if (message.name)
    {
      this.scene.name = message.name;
    }

    if (message.grid === true)
    {
      this.emitter.emit('show_grid', 'show');
    }

    if (message.ambient)
    {
      var ambient = new THREE.Color();
      ambient.r = message.ambient.r;
      ambient.g = message.ambient.g;
      ambient.b = message.ambient.b;

      this.scene.ambient.color = ambient;
    }

    if (message.background)
    {
      var background = new THREE.Color();
      background.r = message.background.r;
      background.g = message.background.g;
      background.b = message.background.b;

      this.scene.renderer.clear();
      this.scene.renderer.setClearColor(background, 1);
    }

    for (var i = 0; i < message.light.length; ++i)
    {
      var light = message.light[i];
      var lightObj = this.createLightFromMsg(light);
      this.scene.add(lightObj);
      this.emitter.emit('setLightStats', light, 'update');
    }

    for (var j = 0; j < message.model.length; ++j)
    {
      var model = message.model[j];
      var modelObj = this.createModelFromMsg(model);
      this.scene.add(modelObj);
      this.emitter.emit('setModelStats', model, 'update');
    }

    this.emitter.emit('setSceneStats', message);
    this.sceneTopic.unsubscribe();
  };
  this.sceneTopic.subscribe(sceneUpdate.bind(this));

  this.physicsTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/physics',
    messageType : 'physics',
  });

  var physicsUpdate = function(message)
  {
    this.emitter.emit('setPhysicsStats', message);
  };
  this.physicsTopic.subscribe(physicsUpdate.bind(this));

  // Update model pose
  var poseTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/pose/info',
    messageType : 'pose',
  });

  var poseUpdate = function(message)
  {
    var entity = this.scene.getByName(message.name);
    if (entity && entity !== this.scene.modelManipulator.object
        && entity.parent !== this.scene.modelManipulator.object)
    {
      this.scene.updatePose(entity, message.position, message.orientation);
      this.emitter.emit('setModelStats', message, 'update');
    }
  };

  poseTopic.subscribe(poseUpdate.bind(this));

  // Requests - for deleting models
  var requestTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/request',
    messageType : 'request',
  });

  var requestUpdate = function(message)
  {
    if (message.request === 'entity_delete')
    {
      var entity = this.scene.getByName(message.data);
      if (entity)
      {
        if (entity.children[0] instanceof THREE.Light)
        {
          this.emitter.emit('setLightStats', {name: message.data}, 'delete');
          this.emitter.emit('notification_popup', message.data+' deleted');
        }
        else
        {
          this.emitter.emit('setModelStats', {name: message.data}, 'delete');
          this.emitter.emit('notification_popup', message.data+' deleted');
        }
        this.scene.remove(entity);
      }
    }
  };

  requestTopic.subscribe(requestUpdate.bind(this));

  // Model info messages - currently used for spawning new models
  var modelInfoTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/model/info',
    messageType : 'model',
  });

  var modelUpdate = function(message)
  {
    if (!this.scene.getByName(message.name))
    {
      var modelObj = this.createModelFromMsg(message);
      if (modelObj)
      {
        this.scene.add(modelObj);
        this.emitter.emit('notification_popup', message.name+' inserted');
      }

      // visuals may arrive out of order (before the model msg),
      // add the visual in if we find its parent here
      var len = this.visualsToAdd.length;
      var i = 0;
      var j = 0;
      while (i < len)
      {
        var parentName = this.visualsToAdd[j].parent_name;
        if (parentName.indexOf(modelObj.name) >=0)
        {
          var parent = this.scene.getByName(parentName);
          var visualObj = this.createVisualFromMsg(this.visualsToAdd[j]);
          parent.add(visualObj);
          this.visualsToAdd.splice(j, 1);
        }
        else
        {
          j++;
        }
        i++;
      }
    }
    this.emitter.emit('setModelStats', message, 'update');
  };

  modelInfoTopic.subscribe(modelUpdate.bind(this));

  // Visual messages - currently just used for collision visuals
  var visualTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/visual',
    messageType : 'visual',
  });

  var visualUpdate = function(message)
  {
    if (!this.scene.getByName(message.name))
    {
      // accept only collision visual msgs for now
      if (message.name.indexOf('COLLISION_VISUAL') < 0)
      {
        return;
      }

      // delay the add if parent not found, this array will checked in
      // modelUpdate function
      var parent = this.scene.getByName(message.parent_name);
      if (message.parent_name && !parent)
      {
        this.visualsToAdd.push(message);
      }
      else
      {
        var visualObj = this.createVisualFromMsg(message);
        parent.add(visualObj);
      }
    }
  };

  visualTopic.subscribe(visualUpdate.bind(this));

  // world stats
  var worldStatsTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/world_stats',
    messageType : 'world_stats',
  });

  var worldStatsUpdate = function(message)
  {
    this.forwardWorldStats(message);
  };

  worldStatsTopic.subscribe(worldStatsUpdate.bind(this));

  // Spawn new lights
  var lightFactoryTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/factory/light',
    messageType : 'light',
  });

  var lightCreate = function(message)
  {
    var entity = this.scene.getByName(message.name);
    if (!entity)
    {
      var lightObj = this.createLightFromMsg(message);
      this.scene.add(lightObj);

      // For the inserted light to have effect
      var allObjects = [];
      this.scene.scene.getDescendants(allObjects);
      for (var l = 0; l < allObjects.length; ++l)
      {
        if (allObjects[l].material)
        {
          allObjects[l].material.needsUpdate = true;
        }
      }

      this.emitter.emit('notification_popup', message.name+' inserted');
    }
    this.emitter.emit('setLightStats', message, 'update');
  };

  lightFactoryTopic.subscribe(lightCreate.bind(this));

  // Update existing lights
  var lightModifyTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/light/modify',
    messageType : 'light',
  });

  var lightUpdate = function(message)
  {
    var entity = this.scene.getByName(message.name);
    if (entity && entity !== this.scene.modelManipulator.object
        && entity.parent !== this.scene.modelManipulator.object)
    {
      this.scene.updateLight(entity, message);
      this.emitter.emit('setLightStats', message, 'update');
    }
  };

  lightModifyTopic.subscribe(lightUpdate.bind(this));

  // heightmap
  this.heightmapDataService = new ROSLIB.Service({
    ros : this.webSocket,
    name : '~/heightmap_data',
    serviceType : 'heightmap_data'
  });

  // road
  this.roadService = new ROSLIB.Service({
    ros : this.webSocket,
    name : '~/roads',
    serviceType : 'roads'
  });

  var request = new ROSLIB.ServiceRequest({
      name : 'roads'
  });

  // send service request and load road on response
  this.roadService.callService(request,
  function(result)
  {
    var roadsObj = that.createRoadsFromMsg(result);
    this.scene.add(roadsObj);
  });

  // Model modify messages - for modifying models
  this.modelModifyTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/model/modify',
    messageType : 'model',
  });

  // Light messages - for modifying lights
  this.lightModifyTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/light/modify',
    messageType : 'light',
  });

  var publishEntityModify = function(entity)
  {
    var matrix = entity.matrixWorld;
    var translation = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, quaternion, scale);

    var entityMsg =
    {
      name : entity.name,
      id : entity.userData.id,
      createEntity : 0,
      position :
      {
        x : translation.x,
        y : translation.y,
        z : translation.z
      },
      orientation :
      {
        w: quaternion.w,
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z
      }
    };
    if (entity.children[0] &&
        entity.children[0] instanceof THREE.Light)
    {
      entityMsg.diffuse =
      {
        r: entity.children[0].color.r,
        g: entity.children[0].color.g,
        b: entity.children[0].color.b
      };
      entityMsg.specular =
      {
        r: entity.serverProperties.specular.r,
        g: entity.serverProperties.specular.g,
        b: entity.serverProperties.specular.b
      };
      entityMsg.direction = entity.direction;
      entityMsg.range = entity.children[0].distance;
      entityMsg.attenuation_constant =
        entity.serverProperties.attenuation_constant;
      entityMsg.attenuation_linear = entity.serverProperties.attenuation_linear;
      entityMsg.attenuation_quadratic =
        entity.serverProperties.attenuation_quadratic;

      that.lightModifyTopic.publish(entityMsg);
    }
    else
    {
      that.modelModifyTopic.publish(entityMsg);
    }
  };

  this.emitter.on('entityChanged', publishEntityModify);

  // Link messages - for modifying links
  this.linkModifyTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/link',
    messageType : 'link',
  });

  var publishLinkModify = function(entity, type)
  {
    var modelMsg =
    {
      name : entity.parent.name,
      id : entity.parent.userData.id,
      link:
      {
        name: entity.name,
        id: entity.userData.id,
        self_collide: entity.serverProperties.self_collide,
        gravity: entity.serverProperties.gravity,
        kinematic: entity.serverProperties.kinematic
      }
    };

    that.linkModifyTopic.publish(modelMsg);
  };

  this.emitter.on('linkChanged', publishLinkModify);

  // Factory messages - for spawning new models
  this.factoryTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/factory',
    messageType : 'factory',
  });

  // Factory messages - for spawning new lights
  this.lightFactoryTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/factory/light',
    messageType : 'light',
  });

  var publishFactory = function(model, type)
  {
    var matrix = model.matrixWorld;
    var translation = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, quaternion, scale);
    var entityMsg =
    {
      name : model.name,
      type : type,
      createEntity : 1,
      position :
      {
        x : translation.x,
        y : translation.y,
        z : translation.z
      },
      orientation :
      {
        w: quaternion.w,
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z
      }
    };
    if (model.children[0].children[0] instanceof THREE.Light)
    {
      that.lightFactoryTopic.publish(entityMsg);
    }
    else
    {
      that.factoryTopic.publish(entityMsg);
    }
  };

  // For deleting models
  this.deleteTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/entity_delete',
    messageType : 'entity_delete',
  });

  var publishDeleteEntity = function(entity)
  {
    var modelMsg =
    {
      name: entity.name
    };

    that.deleteTopic.publish(modelMsg);
  };

  this.emitter.on('deleteEntity',
      function(entity)
      {
        publishDeleteEntity(entity);
      }
  );

  // World control messages - for resetting world/models
  this.worldControlTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/world_control',
    messageType : 'world_control',
  });

  var publishWorldControl = function(state, resetType)
  {
    var worldControlMsg = {};
    if (state !== null)
    {
      worldControlMsg.pause = state;
    }
    if (resetType)
    {
      worldControlMsg.reset = resetType;
    }
    that.worldControlTopic.publish(worldControlMsg);
  };

  this.emitter.on('entityCreated', publishFactory);

  this.emitter.on('reset',
      function(resetType)
      {
        publishWorldControl(null, resetType);
      }
  );

  this.emitter.on('pause',
      function(paused)
      {
        publishWorldControl(paused, null);
      }
  );

  // Log play control messages
  this.playbackControlTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/playback_control',
    messageType : 'playback_control',
  });

  var publishPlaybackControl = function(playbackControl)
  {
    that.playbackControlTopic.publish(playbackControl);
  };

  this.emitter.on('logPlayChanged', publishPlaybackControl);
};

/**
 * Emit events with latest world stats
 * @param {Object} stats - World statistics message
 */
GZ3D.GZIface.prototype.forwardWorldStats = function(stats)
{
  if (stats.paused !== undefined)
  {
    this.emitter.emit('setPaused', stats.paused);
  }

  if (stats.log_playback_stats)
  {
    this.emitter.emit('setLogPlayVisible', true);
    this.emitter.emit('setLogPlayStats', stats.sim_time,
        stats.log_playback_stats.start_time,
        stats.log_playback_stats.end_time);
  }
  else
  {
    this.emitter.emit('setLogPlayVisible', false);
    this.emitter.emit('setRealTime', stats.real_time);
  }

  this.emitter.emit('setSimTime', stats.sim_time);
};

/**
 * Create new model based on a message.
 * @param {Object} model - Model message
 * @return {Object} Model object
 */
GZ3D.GZIface.prototype.createModelFromMsg = function(model)
{
  var modelObj = new THREE.Object3D();
  modelObj.name = model.name;
  modelObj.userData.id = model.id;
  if (model.pose)
  {
    this.scene.setPose(modelObj, model.pose.position, model.pose.orientation);
  }
  for (var j = 0; j < model.link.length; ++j)
  {
    var link = model.link[j];
    var linkObj = new THREE.Object3D();
    linkObj.name = link.name;
    linkObj.userData.id = link.id;
    linkObj.serverProperties =
        {
          self_collide: link.self_collide,
          gravity: link.gravity,
          kinematic: link.kinematic
        };

    if (link.inertial)
    {
      var inertialPose, inertialMass, inertia = {};
      linkObj.userData.inertial = {};
      inertialPose = link.inertial.pose;
      inertialMass = link.inertial.mass;
      inertia.ixx = link.inertial.ixx;
      inertia.ixy = link.inertial.ixy;
      inertia.ixz = link.inertial.ixz;
      inertia.iyy = link.inertial.iyy;
      inertia.iyz = link.inertial.iyz;
      inertia.izz = link.inertial.izz;
      linkObj.userData.inertial.inertia = inertia;
      if (inertialMass)
      {
        linkObj.userData.inertial.mass = inertialMass;
      }
      if (inertialPose)
      {
        linkObj.userData.inertial.pose = inertialPose;
      }
    }

    if (link.pose)
    {
      this.scene.setPose(linkObj, link.pose.position,
          link.pose.orientation);
    }
    modelObj.add(linkObj);
    for (var k = 0; k < link.visual.length; ++k)
    {
      var visual = link.visual[k];
      var visualObj = this.createVisualFromMsg(visual);
      if (visualObj && !visualObj.parent)
      {
        linkObj.add(visualObj);
      }
    }

    for (var l = 0; l < link.collision.length; ++l)
    {
      var collision = link.collision[l];
      for (var m = 0; m < link.collision[l].visual.length; ++m)
      {
        var collisionVisual = link.collision[l].visual[m];
        var collisionVisualObj = this.createVisualFromMsg(collisionVisual);
        if (collisionVisualObj && !collisionVisualObj.parent)
        {
          linkObj.add(collisionVisualObj);
        }
      }
    }
  }
  if (model.joint)
  {
    modelObj.joint = model.joint;
  }

  return modelObj;
};

/**
 * Create new visual based on a message.
 * @param {Object} visual - Visual message
 * @return {Object} Visual object
 */
GZ3D.GZIface.prototype.createVisualFromMsg = function(visual)
{
  if (visual.geometry)
  {
    var geom = visual.geometry;
    var visualObj = new THREE.Object3D();
    visualObj.name = visual.name;
    if (visual.pose)
    {
      this.scene.setPose(visualObj, visual.pose.position,
          visual.pose.orientation);
    }

    visualObj.castShadow = visual.cast_shadows;
    visualObj.receiveShadow = visual.receive_shadows;

    this.createGeom(geom, visual.material, visualObj);

    return visualObj;
  }
};

/**
 * Create new light based on a message.
 * @param {Object} light - Light message
 * @return {Object} Light object
 */
GZ3D.GZIface.prototype.createLightFromMsg = function(light)
{
  var obj, range, direction;

  if (light.type === 1)
  {
    direction = null;
    range = light.range;
  }
  else if (light.type === 2)
  {
    direction = light.direction;
    range = light.range;
  }
  else if (light.type === 3)
  {
    direction = light.direction;
    range = null;
  }

  // equation taken from
  // eslint-disable-next-line
  // https://docs.blender.org/manual/en/dev/render/blender_render/lighting/lights/light_attenuation.html
  var E = 1;
  var D = 1;
  var r = 1;
  var L = light.attenuation_linear;
  var Q = light.attenuation_quadratic;
  var intensity = E*(D/(D+L*r))*(Math.pow(D,2)/(Math.pow(D,2)+Q*Math.pow(r,2)));

  obj = this.scene.createLight(light.type, light.diffuse, intensity,
        light.pose, range, light.cast_shadows, light.name,
        direction, light.specular, light.attenuation_constant,
        light.attenuation_linear, light.attenuation_quadratic);

  return obj;
};

/**
 * Create new roads based on a message.
 * @param {Object} roads - Road message
 * @return {Object} Road object
 */
GZ3D.GZIface.prototype.createRoadsFromMsg = function(roads)
{
  var roadObj = new THREE.Object3D();

  var mat = this.material['Gazebo/Road'];
  var texture = null;
  if (mat)
  {
    texture = this.parseUri('media/materials/textures/' + mat['texture']);
  }
  var obj = this.scene.createRoads(roads.point, roads.width, texture);
  roadObj.add(obj);
  return roadObj;
};

/**
 * Substitute URI scheme with 'assets' or simply prepend 'assets' if URI
 * doesn't have a scheme.
 * @param {string} uri - Full URI including scheme
 * @return {string} Updated URI
 */
GZ3D.GZIface.prototype.parseUri = function(uri)
{
  var uriPath = 'assets';
  var idx = uri.indexOf('://');
  if (idx > 0)
  {
    idx +=3;
  }
  return uriPath + '/' + uri.substring(idx);
};

/**
 * Create geometry and append it to parent
 * @param {Object} geom - geometry message
 * @param {Object} material - material message
 * @param {Object} parent - parent object (i.e. visual)
 */
GZ3D.GZIface.prototype.createGeom = function(geom, material, parent)
{
  var obj;
  var uriPath = 'assets';
  var that = this;
  var mat = this.parseMaterial(material);

  if (geom.box)
  {
    obj = this.scene.createBox(geom.box.size.x, geom.box.size.y,
        geom.box.size.z);
  }
  else if (geom.cylinder)
  {
    obj = this.scene.createCylinder(geom.cylinder.radius,
        geom.cylinder.length);
  }
  else if (geom.sphere)
  {
    obj = this.scene.createSphere(geom.sphere.radius);
  }
  else if (geom.plane)
  {
    obj = this.scene.createPlane(geom.plane.normal.x, geom.plane.normal.y,
        geom.plane.normal.z, geom.plane.size.x, geom.plane.size.y);
  }
  else if (geom.mesh)
  {
    // get model name which the mesh is in
    var rootModel = parent;
    while (rootModel.parent)
    {
      rootModel = rootModel.parent;
    }

    // find model from database, download the mesh if it exists
    // var manifestXML;
    // var manifestURI = GAZEBO_MODEL_DATABASE_URI + '/manifest.xml';
    // var request = new XMLHttpRequest();
    // request.open('GET', manifestURI, false);
    // request.onreadystatechange = function(){
    //   if (request.readyState === 4)
    //   {
    //     if (request.status === 200 || request.status === 0)
    //     {
    //         manifestXML = request.responseXML;
    //     }
    //   }
    // };
    // request.send();

    // var uriPath;
    // var modelAvailable = false;
    // var modelsElem = manifestXML.getElementsByTagName('models')[0];
    // var i;
    // for (i = 0; i < modelsElem.getElementsByTagName('uri').length; ++i)
    // {
    //   var uri = modelsElem.getElementsByTagName('uri')[i];
    //   var model = uri.substring(uri.indexOf('://') + 3);
    //   if (model === rootModel)
    //   {
    //     modelAvailable = true;
    //   }
    // }

    // if (modelAvailable)
    {
      var meshUri = geom.mesh.filename;
      var submesh = geom.mesh.submesh;
      var centerSubmesh = geom.mesh.center_submesh;

      var uriType = meshUri.substring(0, meshUri.indexOf('://'));
      var modelName = '';
      // file:// or model://
      if (uriType === 'file' || uriType === 'model')
      {
        modelName = meshUri.substring(meshUri.indexOf('://') + 3);
      }
      // absolute path - happens when an urdf model is spawned
      // into gazebo through gazebo_ros_pkgs
      else if (meshUri.length > 0 && meshUri[0] === '/')
      {
        // hacky but try to guess the model name from uri based on the
        // meshes directory string
        var idx = meshUri.indexOf('/meshes/');
        if (idx > 1)
        {
          modelName = meshUri.substring(meshUri.lastIndexOf('/', idx-1));
        }
      }
      if (modelName.length > 0)
      {
        if (geom.mesh.scale)
        {
          parent.scale.x = geom.mesh.scale.x;
          parent.scale.y = geom.mesh.scale.y;
          parent.scale.z = geom.mesh.scale.z;
        }

        var modelUri = uriPath + '/' + modelName;
        // Use coarse version on touch devices
        if (modelUri.indexOf('.dae') !== -1 && isTouchDevice)
        {
          modelUri = modelUri.substring(0,modelUri.indexOf('.dae'));

          var checkModel = new XMLHttpRequest();
          checkModel.open('HEAD', modelUri+'_coarse.dae', false);
          checkModel.send();
          if (checkModel.status === 404)
          {
            modelUri = modelUri+'.dae';
          }
          else
          {
            modelUri = modelUri+'_coarse.dae';
          }
        }

        var ext = modelUri.substr(-4).toLowerCase();
        var materialName = parent.name + '::' + modelUri;
        this.entityMaterial[materialName] = mat;

        modelUri = 'http://' + this.url + '/' + modelUri;

        this.scene.loadMeshFromUri(modelUri, submesh, centerSubmesh,
          function(mesh) {
            if (mat)
            {
              // Because the stl mesh doesn't have any children we cannot set
              // the materials like other mesh types.
              if (modelUri.indexOf('.stl') === -1)
              {
                var allChildren = [];
                mesh.getDescendants(allChildren);
                for (var c = 0; c < allChildren.length; ++c)
                {
                  if (allChildren[c] instanceof THREE.Mesh)
                  {
                    that.scene.setMaterial(allChildren[c], mat);
                    break;
                  }
                }
              }
              else
              {
                that.scene.setMaterial(mesh, mat);
              }
            }
            else
            {
              if (ext === '.stl')
              {
                that.scene.setMaterial(mesh, {'ambient': [1,1,1,1]});
              }
            }
            parent.add(mesh);
            loadGeom(parent);
        });
      }
    }
  }
  else if (geom.heightmap)
  {
    var request = new ROSLIB.ServiceRequest({
      name : that.scene.name
    });

    // redirect the texture paths to the assets dir
    var textures = geom.heightmap.texture;
    for ( var k = 0; k < textures.length; ++k)
    {
      textures[k].diffuse = this.parseUri(textures[k].diffuse);
      textures[k].normal = this.parseUri(textures[k].normal);
    }

    var sizes = geom.heightmap.size;

    // send service request and load heightmap on response
    this.heightmapDataService.callService(request,
        function(result)
        {
          var heightmap = result.heightmap;
          // gazebo heightmap is always square shaped,
          // and a dimension of: 2^N + 1
          that.scene.loadHeightmap(heightmap.heights, heightmap.size.x,
              heightmap.size.y, heightmap.width, heightmap.height,
              heightmap.origin, textures,
              geom.heightmap.blend, parent);
            //console.log('Result for service call on ' + result);
        });

    //this.scene.loadHeightmap(parent)
  }

  if (obj)
  {
    if (mat)
    {
      // texture mapping for simple shapes and planes only,
      // not used by mesh and terrain
      this.scene.setMaterial(obj, mat);
    }
    obj.updateMatrix();
    parent.add(obj);
    loadGeom(parent);
  }

  function loadGeom(visualObj)
  {
    var allChildren = [];
    visualObj.getDescendants(allChildren);
    for (var c = 0; c < allChildren.length; ++c)
    {
      if (allChildren[c] instanceof THREE.Mesh)
      {
        allChildren[c].castShadow = true;
        allChildren[c].receiveShadow = true;

        if (visualObj.castShadows)
        {
          allChildren[c].castShadow = visualObj.castShadows;
        }
        if (visualObj.receiveShadows)
        {
          allChildren[c].receiveShadow = visualObj.receiveShadows;
        }

        if (visualObj.name.indexOf('COLLISION_VISUAL') >= 0)
        {
          allChildren[c].castShadow = false;
          allChildren[c].receiveShadow = false;

          allChildren[c].visible = this.scene.showCollisions;
        }
        break;
      }
    }
  }
};

/**
 * Parse a material message and return an object containing its properties.
 * @param {Object} material - material message
 * @return Object containing material properties
 */
GZ3D.GZIface.prototype.parseMaterial = function(material)
{
  if (!material)
  {
    return null;
  }

  var uriPath = 'assets';
  var texture;
  var normalMap;
  var textureUri;
  var ambient;
  var diffuse;
  var specular;
  var opacity;
  var scale;
  var mat;

  // get texture from material script
  var script  = material.script;
  if (script)
  {
    if (script.name)
    {
      mat = this.material[script.name];
      if (mat)
      {
        ambient = mat['ambient'];
        diffuse = mat['diffuse'];
        specular = mat['specular'];
        opacity = mat['opacity'];
        scale = mat['scale'];

        var textureName = mat['texture'];
        if (textureName)
        {
          for (var i = 0; i < script.uri.length; ++i)
          {
            // handle the weird case where empty scripts become converted to
            // a single '__default__' script
            var scriptUri = script.uri[i];
            if (scriptUri === '__default__')
            {
              scriptUri = 'file://media/materials/scripts/gazebo.material';
            }

            var type = scriptUri.substring(0,
                  scriptUri.indexOf('://'));

            if (type === 'model')
            {
              if (scriptUri.indexOf('textures') > 0)
              {
                textureUri = scriptUri.substring(
                    scriptUri.indexOf('://') + 3);
                break;
              }
            }
            else if (type === 'file')
            {
              if (scriptUri.indexOf('materials') > 0)
              {
                textureUri = scriptUri.substring(
                    scriptUri.indexOf('://') + 3,
                    scriptUri.indexOf('materials') + 9) + '/textures';
                break;
              }
            }
          }
          if (textureUri)
          {
            texture = uriPath + '/' +
                textureUri  + '/' + textureName;
          }
        }
      }
    }
  }

  // normal map
  if (material.normal_map)
  {
    var mapUri;
    if (material.normal_map.indexOf('://') > 0)
    {
      mapUri = material.normal_map.substring(
          material.normal_map.indexOf('://') + 3,
          material.normal_map.lastIndexOf('/'));
    }
    else
    {
      mapUri = textureUri;
    }
    if (mapUri)
    {
      var startIndex = material.normal_map.lastIndexOf('/') + 1;
      if (startIndex < 0)
      {
        startIndex = 0;
      }
      var normalMapName = material.normal_map.substr(startIndex,
          material.normal_map.lastIndexOf('.') - startIndex);
      normalMap = uriPath + '/' +
        mapUri  + '/' + normalMapName + '.png';
    }
  }

  return {
      texture: texture,
      normalMap: normalMap,
      ambient: ambient,
      diffuse: diffuse,
      specular: specular,
      opacity: opacity,
      scale: scale
  };
};

/*GZ3D.GZIface.prototype.createGeom = function(geom, material, parent)
{
  var obj;

  var uriPath = 'assets';
  var texture;
  var normalMap;
  var textureUri;
  var mat;
  if (material)
  {
    // get texture from material script
    var script  = material.script;
    if (script)
    {
      if (script.uri.length > 0)
      {
        if (script.name)
        {
          mat = this.material[script.name];
          if (mat)
          {
            var textureName = mat['texture'];
            if (textureName)
            {
              for (var i = 0; i < script.uri.length; ++i)
              {
                var type = script.uri[i].substring(0,
                      script.uri[i].indexOf('://'));

                if (type === 'model')
                {
                  if (script.uri[i].indexOf('textures') > 0)
                  {
                    textureUri = script.uri[i].substring(
                        script.uri[i].indexOf('://') + 3);
                    break;
                  }
                }
                else if (type === 'file')
                {
                  if (script.uri[i].indexOf('materials') > 0)
                  {
                    textureUri = script.uri[i].substring(
                        script.uri[i].indexOf('://') + 3,
                        script.uri[i].indexOf('materials') + 9) + '/textures';
                    break;
                  }
                }
              }
              if (textureUri)
              {
                texture = uriPath + '/' +
                    textureUri  + '/' + textureName;
              }
            }
          }
        }
      }
    }
    // normal map
    if (material.normal_map)
    {
      var mapUri;
      if (material.normal_map.indexOf('://') > 0)
      {
        mapUri = material.normal_map.substring(
            material.normal_map.indexOf('://') + 3,
            material.normal_map.lastIndexOf('/'));
      }
      else
      {
        mapUri = textureUri;
      }
      if (mapUri)
      {
        var startIndex = material.normal_map.lastIndexOf('/') + 1;
        if (startIndex < 0)
        {
          startIndex = 0;
        }
        var normalMapName = material.normal_map.substr(startIndex,
            material.normal_map.lastIndexOf('.') - startIndex);
        normalMap = uriPath + '/' +
          mapUri  + '/' + normalMapName + '.png';
      }

    }
  }

  if (geom.box)
  {
    obj = this.scene.createBox(geom.box.size.x, geom.box.size.y,
        geom.box.size.z);
  }
  else if (geom.cylinder)
  {
    obj = this.scene.createCylinder(geom.cylinder.radius,
        geom.cylinder.length);
  }
  else if (geom.sphere)
  {
    obj = this.scene.createSphere(geom.sphere.radius);
  }
  else if (geom.plane)
  {
    obj = this.scene.createPlane(geom.plane.normal.x, geom.plane.normal.y,
        geom.plane.normal.z, geom.plane.size.x, geom.plane.size.y);
  }
  else if (geom.mesh)
  {
    // get model name which the mesh is in
    var rootModel = parent;
    while (rootModel.parent)
    {
      rootModel = rootModel.parent;
    }

    {
      var meshUri = geom.mesh.filename;
      var submesh = geom.mesh.submesh;
      var centerSubmesh = geom.mesh.center_submesh;

      console.log(geom.mesh.filename + ' ' + submesh);

      var uriType = meshUri.substring(0, meshUri.indexOf('://'));
      if (uriType === 'file' || uriType === 'model')
      {
        var modelName = meshUri.substring(meshUri.indexOf('://') + 3);
        if (geom.mesh.scale)
        {
          parent.scale.x = geom.mesh.scale.x;
          parent.scale.y = geom.mesh.scale.y;
          parent.scale.z = geom.mesh.scale.z;
        }

        this.scene.loadMesh(uriPath + '/' + modelName, submesh, centerSubmesh,
            texture, normalMap, parent);
      }
    }
  }
  else if (geom.heightmap)
  {
    var that = this;
    var request = new ROSLIB.ServiceRequest({
      name : that.scene.name
    });

    // redirect the texture paths to the assets dir
    var textures = geom.heightmap.texture;
    for ( var k = 0; k < textures.length; ++k)
    {
      textures[k].diffuse = this.parseUri(textures[k].diffuse);
      textures[k].normal = this.parseUri(textures[k].normal);
    }

    var sizes = geom.heightmap.size;

    // send service request and load heightmap on response
    this.heightmapDataService.callService(request,
        function(result)
        {
          var heightmap = result.heightmap;
          // gazebo heightmap is always square shaped,
          // and a dimension of: 2^N + 1
          that.scene.loadHeightmap(heightmap.heights, heightmap.size.x,
              heightmap.size.y, heightmap.width, heightmap.height,
              heightmap.origin, textures,
              geom.heightmap.blend, parent);
            //console.log('Result for service call on ' + result);
        });

    //this.scene.loadHeightmap(parent)
  }

  // texture mapping for simple shapes and planes only,
  // not used by mesh and terrain
  if (obj)
  {

    if (mat)
    {
      obj.material = new THREE.MeshPhongMaterial();

      var ambient = mat['ambient'];
      if (ambient)
      {
        obj.material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
      }
      var diffuse = mat['diffuse'];
      if (diffuse)
      {
        obj.material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
      }
      var specular = mat['specular'];
      if (specular)
      {
        obj.material.specular.setRGB(specular[0], specular[1], specular[2]);
      }
      var opacity = mat['opacity'];
      if (opacity)
      {
        if (opacity < 1)
        {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      }

      //this.scene.setMaterial(obj, texture, normalMap);

      if (texture)
      {
        obj.material.map = THREE.ImageUtils.loadTexture(texture);
      }
      if (normalMap)
      {
        obj.material.normalMap = THREE.ImageUtils.loadTexture(normalMap);
      }
    }
    obj.updateMatrix();
    parent.add(obj);
  }
};
*/

var nsInSec = 1000000000;

/**
 * Correct the time so that small additions/substractions
 * preserve the internal seconds and nanoseconds separation
 * @param {} time - Time to be corrected
 */
var correctTime = function(time)
{
  var n = 0;
  // In the case sec and nsec have different signs, normalize
  if (time.sec > 0 && time.nsec < 0)
  {
    n = Math.floor(Math.abs(time.nsec / nsInSec) + 1);
    time.sec -= n;
    time.nsec += n * nsInSec;
  }
  if (time.sec < 0 && time.nsec > 0)
  {
    n = Math.floor(Math.abs(time.nsec / nsInSec) + 1);
    time.sec += n;
    time.nsec -= n * nsInSec;
  }

  // Make any corrections
  time.sec += Math.floor(time.nsec / nsInSec);
  time.nsec = Math.floor(time.nsec % nsInSec);
};


/*
 * Subtract time and preseve seconds and nanonsecods separation
 * @param {} timeA - Time being subtracted
 * @param {} timeB - Time to subtract
 */
var subtractTime = function(timeA, timeB)
{
  var result = {};
  result.sec = timeA.sec - timeB.sec;
  result.nsec = timeA.nsec - timeB.nsec;
  correctTime(result);
  return result;
};

/**
 * Provides an interface to control a running log playback. It sends events to
 * GzIface and updates some UI elements.
 * @constructor
 */
GZ3D.LogPlay = function()
{
  this.emitter = globalEmitter || new EventEmitter2({verboseMemoryLeak: true});
  this.visible = null;
  this.startTime = null;
  this.endTime = null;
  this.active = false;
  this.sliderRange = 100;
  this.visible = false;

  var that = this;

  // when slide pos changes
  this.emitter.on('logPlaySlideStop', function (value)
    {
      if (!that.startTime || !that.endTime)
      {
        return;
      }

      var rel = value / that.sliderRange;
      var seek = (that.startTime.sec + that.startTime.nsec * 1e-9) +
        rel * (that.totalTime.sec + that.totalTime.nsec * 1e-9);

      var playback = {};
      playback.seek = {};
      playback.seek.sec = Math.floor(seek);
      playback.seek.nsec = Math.round((seek - playback.seek.sec) * nsInSec);

      // publich playback control command msg
      that.emitter.emit('logPlayChanged', playback);
      that.active = false;
    }
  );

  this.emitter.on('logPlaySlideStart', function ()
    {
      that.active = true;
    }
  );

  this.emitter.on('logPlayRewind', function ()
    {
      var playback = {};
      playback.rewind = true;
      that.emitter.emit('logPlayChanged', playback);
    }
  );
  this.emitter.on('logPlayForward', function ()
    {
      var playback = {};
      playback.forward = true;
      that.emitter.emit('logPlayChanged', playback);
    }
  );
  this.emitter.on('logPlayStepforward', function ()
    {
      var playback = {};
      playback.multi_step = 1;
      that.emitter.emit('logPlayChanged', playback);
    }
  );
  this.emitter.on('logPlayStepback', function ()
    {
      var playback = {};
      playback.multi_step = -1;
      that.emitter.emit('logPlayChanged', playback);
    }
  );
  this.emitter.on('paused', function (paused)
    {
      if (paused)
      {
        $('#logplay-playText').html(
            '<img style="height:1.2em" src="style/images/play.png" ' +
            'title="Play">');
      }
      else
      {
        $('#logplay-playText').html(
            '<img style="height:1.2em" src="style/images/pause.png" ' +
            'title="Pause">');
      }
    }
  );
};

/**
 * get log playback widget visibility
 */
GZ3D.LogPlay.prototype.isVisible = function()
{
  return this.visible;
};

/**
 * Set log playback widget visibility
 */
GZ3D.LogPlay.prototype.setVisible = function(visible)
{
  if (visible === this.visible)
  {
    return;
  }
  this.visible = visible;

  if (this.visible)
  {
    $('#logplay').show();
  }
  else
  {
    $('#logplay').hide();
  }
};

/**
 * Set log playback stats based on data received
 */
GZ3D.LogPlay.prototype.setStats = function(simTime, startTime, endTime)
{
  this.simTime = simTime;

  if (!this.startTime || !this.endTime || !this.totalTime ||
      this.startTime.sec !== startTime.sec ||
      this.startTime.nsec !== startTime.nsec ||
      this.endTime.sec !== endTime.sec ||
      this.endTime.nsec !== endTime.nsec)
  {
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalTime = subtractTime(endTime, startTime);
  }

  if (!this.active)
  {
    // work out new slider value to set to
    var relTime = subtractTime(this.simTime, this.startTime);
    var newVal = (relTime.sec + relTime.nsec * 1e-9) /
        (this.totalTime.sec + this.totalTime.nsec * 1e-9);
    newVal = Math.max(newVal, 0);

    // slider range: 0 - 100
    $('#logplay-slider-input').val(newVal*this.sliderRange).slider('refresh');
    $('#logplay-slider-input').text(newVal*this.sliderRange).slider('refresh');
  }
};

// Based on TransformControls.js
// original author: arodic / https://github.com/arodic

/**
 * Manipulator to perform translate and rotate transforms on objects
 * within the scene.
 * @constructor
 */
GZ3D.Manipulator = function(camera, mobile, domElement, doc)
{
  // Needs camera for perspective
  this.camera = camera;

  // For mouse/touch events
  this.domElement = (domElement !== undefined) ? domElement : document;
  this.document = (doc !== undefined) ? doc : document;

  // Mobile / desktop
  this.mobile = (mobile !== undefined) ? mobile : false;

  // Object to be manipulated
  this.object = undefined;

  // translate / rotate
  this.mode = 'translate';

  // world / local
  this.space = 'world';

  // hovered used for backwards compatibility
  // Whenever it wasn't an issue, hovered and active were combined
  // into selected
  this.hovered = false;
  this.selected = 'null';

  this.scale = 1;

  this.snapDist = null;
  this.modifierAxis = new THREE.Vector3(1, 1, 1);
  this.gizmo = new THREE.Object3D();

  this.pickerNames = [];

  var scope = this;

  var changeEvent = {type: 'change'};

  var ray = new THREE.Raycaster();
  var pointerVector = new THREE.Vector2();

  var point = new THREE.Vector3();
  var offset = new THREE.Vector3();

  var rotation = new THREE.Vector3();
  var offsetRotation = new THREE.Vector3();

  var lookAtMatrix = new THREE.Matrix4();
  var eye = new THREE.Vector3();

  var tempMatrix = new THREE.Matrix4();
  var tempVector = new THREE.Vector3();
  var tempQuaternion = new THREE.Quaternion();
  var unitX = new THREE.Vector3(1, 0, 0);
  var unitY = new THREE.Vector3(0, 1, 0);
  var unitZ = new THREE.Vector3(0, 0, 1);

  var quaternionXYZ = new THREE.Quaternion();
  var quaternionX = new THREE.Quaternion();
  var quaternionY = new THREE.Quaternion();
  var quaternionZ = new THREE.Quaternion();
  var quaternionE = new THREE.Quaternion();

  var oldPosition = new THREE.Vector3();
  var oldRotationMatrix = new THREE.Matrix4();

  var parentRotationMatrix  = new THREE.Matrix4();
  var parentScale = new THREE.Vector3();

  var worldPosition = new THREE.Vector3();
  var worldRotation = new THREE.Vector3();
  var worldRotationMatrix  = new THREE.Matrix4();
  var camPosition = new THREE.Vector3();

  var hovered = null;
  var hoveredColor = new THREE.Color();

  // Picker currently selected (highlighted)
  var selectedPicker = null;
  var selectedColor = new THREE.Color();

  // Intersection planes
  var intersectionPlanes = {};
  var intersectionPlaneList = ['XY','YZ','XZ'];
  var currentPlane = 'XY';

  var planes = new THREE.Object3D();
  this.gizmo.add(planes);

  var planeMaterial = new THREE.MeshBasicMaterial(
      {visible: false, side: THREE.DoubleSide});
  for(var i in intersectionPlaneList)
  {
    intersectionPlanes[intersectionPlaneList[i]] =
        new THREE.Mesh(new THREE.PlaneGeometry(500, 500), planeMaterial);
    intersectionPlanes[intersectionPlaneList[i]].material.side =
        THREE.DoubleSide;
    planes.add(intersectionPlanes[intersectionPlaneList[i]]);
  }

  intersectionPlanes['YZ'].rotation.set(0, Math.PI/2, 0);
  intersectionPlanes['XZ'].rotation.set(-Math.PI/2, 0, 0);
  bakeTransformations(intersectionPlanes['YZ']);
  bakeTransformations(intersectionPlanes['XZ']);

  // Geometries

  var pickerAxes = {};
  var displayAxes = {};

  var HandleMaterial = function(parameters, over)
  {
    var material = new THREE.MeshBasicMaterial();
    if(over)
    {
      material.side = THREE.DoubleSide;
      material.depthTest = false;
      material.depthWrite = false;
    }
    material.transparent = true;
    material.setValues(parameters);
    if (parameters.opacity === undefined)
    {
      material.opacity = 0.5;
    }

    return material;
  };

  var LineMaterial = function(color, opacity)
  {
    var material = new THREE.LineBasicMaterial();
    material.color = color;
    material.depthTest = false;
    material.depthWrite = false;
    material.opacity = opacity !== undefined ? opacity : 1;
    material.transparent = true;
    return material;
  };

  // Colors
  var white = new THREE.Color(0xffffff);
  var gray = new THREE.Color(0x808080);
  var red = new THREE.Color(0xff0000);
  var green = new THREE.Color(0x00ff00);
  var blue = new THREE.Color(0x0000ff);
  var cyan = new THREE.Color(0x00ffff);
  var magenta = new THREE.Color(0xff00ff);
  var yellow = new THREE.Color(0xffff00);

  var geometry, mesh;

  // Translate

  pickerAxes['translate'] = new THREE.Object3D();
  displayAxes['translate'] = new THREE.Object3D();
  this.gizmo.add(pickerAxes['translate']);
  this.gizmo.add(displayAxes['translate']);

  // Picker cylinder
  if(this.mobile)
  {
    geometry = new THREE.CylinderGeometry(0.5, 0.01, 1.4, 10, 1, false);
  }
  else
  {
    geometry = new THREE.CylinderGeometry(0.2, 0.1, 0.8, 4, 1, false);
  }

  mesh = new THREE.Mesh(geometry,
      new HandleMaterial({color: red, visible: false, transparent: false}));
  mesh.position.x = 0.7;
  mesh.rotation.z = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'TX';
  pickerAxes['translate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry,
      new HandleMaterial({color: green, visible: false, transparent: false}));
  mesh.position.y = 0.7;
  bakeTransformations(mesh);
  mesh.name = 'TY';
  pickerAxes['translate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry,
      new HandleMaterial({color: blue, visible: false, transparent: false}));
  mesh.position.z = 0.7;
  mesh.rotation.x = Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'TZ';
  pickerAxes['translate'].add(mesh);
  this.pickerNames.push(mesh.name);

  if (this.mobile)
  {
    // Display cylinder
    geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 10, 1, false);

    var mTXColor = new HandleMaterial({color: red, transparent: true}, true);
    mesh = new THREE.Mesh(geometry, mTXColor);
    mesh.position.x = 0.5;
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TX';
    displayAxes['translate'].add(mesh);

    var mTYColor = new HandleMaterial({color: green, transparent: true}, true);
    mesh = new THREE.Mesh(geometry, mTYColor);
    mesh.position.y = 0.5;
    bakeTransformations(mesh);
    mesh.name = 'TY';
    displayAxes['translate'].add(mesh);

    var mTZColor = new HandleMaterial({color: blue, transparent: true}, true);
    mesh = new THREE.Mesh(geometry, mTZColor);
    mesh.position.z = 0.5;
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TZ';
    displayAxes['translate'].add(mesh);

    // Display cone (arrow tip)
    // make sure to reference the same material as the arrow body
    // so both can be corrected highlighted on touch start / end.
    geometry = new THREE.CylinderGeometry(0, 0.15, 0.4, 10, 1, false);

    mesh = new THREE.Mesh(geometry, mTXColor);
    mesh.position.x = 1.2;
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TX';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, mTYColor);
    mesh.position.y = 1.2;
    bakeTransformations(mesh);
    mesh.name = 'TY';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, mTZColor);
    mesh.position.z = 1.2;
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TZ';
    displayAxes['translate'].add(mesh);
  }
  else
  {
    // Display lines
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)
    );
    geometry.colors.push(
        red, red, green, green, blue, blue
    );
    var material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });
    mesh = new THREE.Line(geometry, material, THREE.LineSegments);
    displayAxes['translate'].add(mesh);

    // Display cone (arrow tip)
    geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 4, 1, true);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: red, opacity: 1}, true));
    mesh.position.x = 1.1;
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TX';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: green, opacity: 1}, true));
    mesh.position.y = 1.1;
    bakeTransformations(mesh);
    mesh.name = 'TY';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: blue, opacity: 1}, true));
    mesh.position.z = 1.1;
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TZ';
    displayAxes['translate'].add(mesh);

    // Picker and display octahedron for TXYZ
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0),
        new HandleMaterial({color: white, opacity: 0.25}, true));
    mesh.name = 'TXYZ';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0),
        new HandleMaterial({color: white, visible: false}, true));
    mesh.name = 'TXYZ';
    pickerAxes['translate'].add(mesh);

    // Picker and display planes
    geometry = new THREE.PlaneGeometry(0.3, 0.3);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: yellow, opacity: 0.25}, true));
    mesh.position.set(0.15, 0.15, 0);
    bakeTransformations(mesh);
    mesh.name = 'TXY';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: yellow, visible: false}, true));
    mesh.position.set(0.15, 0.15, 0);
    bakeTransformations(mesh);
    mesh.name = 'TXY';
    pickerAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: cyan, opacity: 0.25}, true));
    mesh.position.set(0, 0.15, 0.15);
    mesh.rotation.y = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TYZ';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: cyan, visible: false}, true));
    mesh.position.set(0, 0.15, 0.15);
    mesh.rotation.y = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TYZ';
    pickerAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: magenta, opacity: 0.25}, true));
    mesh.position.set(0.15, 0, 0.15);
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TXZ';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(
        {color: magenta, visible: false}, true));
    mesh.position.set(0.15, 0, 0.15);
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TXZ';
    pickerAxes['translate'].add(mesh);
  }

  // Rotate

  pickerAxes['rotate'] = new THREE.Object3D();
  displayAxes['rotate'] = new THREE.Object3D();
  this.gizmo.add(pickerAxes['rotate']);
  this.gizmo.add(displayAxes['rotate']);

  // RX, RY, RZ

  // Picker torus
  if(this.mobile)
  {
    geometry = new THREE.TorusGeometry(1, 0.3, 4, 36, 2*Math.PI);
  }
  else
  {
    geometry = new THREE.TorusGeometry(1, 0.15, 4, 6, Math.PI);
  }

  mesh = new THREE.Mesh(geometry, new HandleMaterial(
      {color: red, visible: false, transparent: false}, false));
  mesh.rotation.z = -Math.PI/2;
  mesh.rotation.y = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'RX';
  pickerAxes['rotate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry, new HandleMaterial(
      {color: green, visible: false, transparent: false}, false));
  mesh.rotation.z = Math.PI;
  mesh.rotation.x = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'RY';
  pickerAxes['rotate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry, new HandleMaterial(
      {color: blue, visible: false, transparent: false}, false));
  mesh.rotation.z = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'RZ';
  pickerAxes['rotate'].add(mesh);
  this.pickerNames.push(mesh.name);

  if (this.mobile)
  {
    // Display torus
    geometry = new THREE.TorusGeometry(1, 0.1, 4, 36, 2*Math.PI);

    mesh = new THREE.Mesh(geometry, new HandleMaterial({color: blue}, false));
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'RZ';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial({color: red}, false));
    mesh.rotation.z = -Math.PI/2;
    mesh.rotation.y = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'RX';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial({color: green}, false));
    mesh.rotation.z = Math.PI;
    mesh.rotation.x = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'RY';
    displayAxes['rotate'].add(mesh);
  }
  else
  {
    // Display circles
    var Circle = function(radius, facing, arc)
    {
      geometry = new THREE.Geometry();
      arc = arc ? arc : 1;
      for(var i = 0; i <= 64 * arc; ++i)
      {
        if(facing === 'x')
        {
          geometry.vertices.push(new THREE.Vector3(
              0, Math.cos(i / 32 * Math.PI), Math.sin(i / 32 * Math.PI))
              .multiplyScalar(radius));
        }
        if(facing === 'y')
        {
          geometry.vertices.push(new THREE.Vector3(
              Math.cos(i / 32 * Math.PI), 0, Math.sin(i / 32 * Math.PI))
              .multiplyScalar(radius));
        }
        if(facing === 'z')
        {
          geometry.vertices.push(new THREE.Vector3(
              Math.sin(i / 32 * Math.PI), Math.cos(i / 32 * Math.PI), 0)
              .multiplyScalar(radius));
        }
      }
      return geometry;
    };

    mesh = new THREE.Line(new Circle(1, 'x', 0.5), new LineMaterial(red));
    mesh.name = 'RX';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Line(new Circle(1, 'y', 0.5), new LineMaterial(green));
    mesh.name = 'RY';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Line(new Circle(1, 'z', 0.5), new LineMaterial(blue));
    mesh.name = 'RZ';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Line(new Circle(1, 'z'), new LineMaterial(gray));
    mesh.name = 'RXYZE';
    this.pickerNames.push(mesh.name);
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Line(new Circle(1.25, 'z'),
        new LineMaterial(yellow, 0.25));
    mesh.name = 'RE';
    this.pickerNames.push(mesh.name);
    displayAxes['rotate'].add(mesh);

    // Picker spheres
    mesh = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12),
        new HandleMaterial({color: gray, visible: false}, true));
    mesh.name = 'RXYZE';
    pickerAxes['rotate'].add(mesh);
    this.pickerNames.push(mesh.name);

    intersectionPlanes['SPHERE'] = new THREE.Mesh(new
        THREE.SphereGeometry(0.95, 12, 12),
        new HandleMaterial({color: white, visible: false}, true));
    planes.add(intersectionPlanes['SPHERE']);

    mesh = new THREE.Mesh(new THREE.TorusGeometry(1.30, 0.15, 4, 12),
        new HandleMaterial({color: yellow, visible: false}, true));
    mesh.name = 'RE';
    pickerAxes['rotate'].add(mesh);
    this.pickerNames.push(mesh.name);
  }
  mesh = null;

  /**
   * Attach gizmo to an object
   * @param {THREE.Object3D} - Model to be manipulated
   */
  this.attach = function(object)
  {
    this.object = object;
    this.setMode(scope.mode);

    if(this.mobile)
    {
      this.domElement.addEventListener('touchstart', onTouchStart, false);
    }
    else
    {
      this.domElement.addEventListener('mousedown', onMouseDown, false);
      this.domElement.addEventListener('mousemove', onMouseHover, false);
    }
  };

  /**
   * Detatch gizmo from an object
   * @param {THREE.Object3D} - Model
   */
  this.detach = function(object)
  {
    this.object = undefined;
    this.selected = 'null';

    this.hide();

    if(this.mobile)
    {
      this.domElement.removeEventListener('touchstart', onTouchStart, false);
    }
    else
    {
      this.domElement.removeEventListener('mousedown', onMouseDown, false);
      this.domElement.removeEventListener('mousemove', onMouseHover, false);
    }
  };

  /**
   * Update gizmo's pose and scale
   */
  this.update = function()
  {
    if(this.object === undefined)
    {
      return;
    }

    this.object.updateMatrixWorld();
    worldPosition.setFromMatrixPosition(this.object.matrixWorld);

    this.camera.updateMatrixWorld();
    camPosition.setFromMatrixPosition(this.camera.matrixWorld);

    var scale = worldPosition.distanceTo(camPosition) / 6 * this.scale;
    this.gizmo.position.copy(worldPosition);
    this.gizmo.scale.set(scale, scale, scale);

    for(var i in this.gizmo.children)
    {
      for(var j in this.gizmo.children[i].children)
      {
        var object = this.gizmo.children[i].children[j];
        var name = object.name;

        if(name.search('E') !== -1)
        {
          lookAtMatrix.lookAt(camPosition, worldPosition,
              tempVector.set(0, 1, 0));
          object.rotation.setFromRotationMatrix(lookAtMatrix);
        }
        else
        {
          eye.copy(camPosition).sub(worldPosition).normalize();

          if (this.space === 'local')
          {
            tempQuaternion.setFromRotationMatrix(tempMatrix
                .extractRotation(this.object.matrixWorld));

            if (name.search('R') !== -1)
            {
              tempMatrix.makeRotationFromQuaternion(tempQuaternion)
                  .getInverse(tempMatrix);
              eye.applyMatrix4(tempMatrix);

              if (name === 'RX')
              {
                quaternionX.setFromAxisAngle(unitX, Math.atan2(-eye.y, eye.z));
                tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
              }
              if (name ==='RY')
              {
                quaternionY.setFromAxisAngle(unitY, Math.atan2( eye.x, eye.z));
                tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
              }
              if (name === 'RZ')
              {
                quaternionZ.setFromAxisAngle(unitZ, Math.atan2( eye.y, eye.x));
                tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);
              }
            }
            object.quaternion.copy(tempQuaternion);
          }
          else if (this.space === 'world')
          {
            object.rotation.set(0, 0, 0);

            if(name === 'RX')
            {
              object.rotation.x = Math.atan2(-eye.y, eye.z);
            }
            if(name === 'RY')
            {
              object.rotation.y = Math.atan2( eye.x, eye.z);
            }
            if(name === 'RZ')
            {
              object.rotation.z = Math.atan2( eye.y, eye.x);
            }
          }
        }
      }
    }
  };

  /**
   * Hide gizmo
   */
  this.hide = function()
  {
    for(var i in displayAxes)
    {
      for(var j in displayAxes[i].children)
      {
        displayAxes[i].children[j].visible = false;
      }
    }
  };

  /**
   * Set mode
   * @param {string} value - translate | rotate
   */
  this.setMode = function(value)
  {
    scope.mode = value;

    this.hide();

    for(var i in displayAxes[this.mode].children)
    {
      displayAxes[this.mode].children[i].visible = true;
    }
    scope.update();
  };

  /**
   * Choose intersection plane
   */
  this.setIntersectionPlane = function()
  {
    eye.copy(camPosition).sub(worldPosition).normalize();

    if (this.space === 'local')
    {
       eye.applyMatrix4(tempMatrix.getInverse(scope.object.matrixWorld));
    }

    if (isSelected('TXYZ'))
    {
      if (Math.abs(eye.x) > Math.abs(eye.y) &&
          Math.abs(eye.x) > Math.abs(eye.z))
      {
        currentPlane = 'YZ';
      }
      else if (Math.abs(eye.y) > Math.abs(eye.x) &&
               Math.abs(eye.y) > Math.abs(eye.z))
      {
        currentPlane = 'XZ';
      }
      else
      {
        currentPlane = 'XY';
      }
    }
    else if (isSelected('RX') || isSelected('TYZ'))
    {
      currentPlane = 'YZ';
    }
    else if (isSelected('RY') || isSelected('TXZ'))
    {
      currentPlane = 'XZ';
    }
    else if (isSelected('RZ') || isSelected('TXY'))
    {
      currentPlane = 'XY';
    }
    else if (isSelected('X'))
    {
      if (Math.abs(eye.y) > Math.abs(eye.z))
      {
        currentPlane = 'XZ';
      }
      else
      {
        currentPlane = 'XY';
      }
    }
    else if (isSelected('Y'))
    {
      if (Math.abs(eye.x) > Math.abs(eye.z))
      {
        currentPlane = 'YZ';
      }
      else
      {
        currentPlane = 'XY';
      }
    }
    else if (isSelected('Z'))
    {
      if (Math.abs(eye.x) > Math.abs(eye.y))
      {
        currentPlane = 'YZ';
      }
      else
      {
        currentPlane = 'XZ';
      }
    }
  };

  /**
   * Window event callback
   * @param {} event
   */
  function onTouchStart(event)
  {
    event.preventDefault();

    var intersect = intersectObjects(event, pickerAxes[scope.mode].children);

    // If one of the current pickers was touched
    if(intersect)
    {
      if(selectedPicker !== intersect.object)
      {
        var selectedDisplay = null;
        // Back to original color
        if(selectedPicker !== null)
        {
          selectedDisplay =
              displayAxes[scope.mode].getObjectByName(selectedPicker.name);
          if (selectedDisplay)
          {
            selectedDisplay.material.color.copy(selectedColor);
          }
        }

        selectedPicker = intersect.object;

        // Save color for when it's deselected
        selectedColor.copy(selectedPicker.material.color);

        // Darken color
        selectedDisplay =
            displayAxes[scope.mode].getObjectByName(selectedPicker.name);
        if (selectedDisplay)
        {
          selectedDisplay.material.color.offsetHSL(0, 0, -0.3);
        }


        scope.dispatchEvent(changeEvent);
      }

      scope.selected = selectedPicker.name;
      scope.hovered = true;
      scope.update();
      scope.setIntersectionPlane();

      var planeIntersect = intersectObjects(event,
          [intersectionPlanes[currentPlane]]);

      if(planeIntersect)
      {
        oldPosition.copy(scope.object.position);

        oldRotationMatrix.extractRotation(scope.object.matrix);
        worldRotationMatrix.extractRotation(scope.object.matrixWorld);

        parentRotationMatrix.extractRotation(scope.object.parent.matrixWorld);
        parentScale.setFromMatrixScale(tempMatrix.getInverse(
            scope.object.parent.matrixWorld));

        offset.copy(planeIntersect.point);
      }
    }

    scope.document.addEventListener('touchmove', onPointerMove, false);
    scope.document.addEventListener('touchend', onTouchEnd, false);
  }


  /**
   * Window event callback
   * @param {} event
   */
  function onTouchEnd()
  {
    // Previously selected picker back to its color
    if(selectedPicker)
    {
      var selectedDisplay =
          displayAxes[scope.mode].getObjectByName(selectedPicker.name);
      if (selectedDisplay)
      {
        selectedDisplay.material.color.copy(selectedColor);
      }
    }

    selectedPicker = null;

    scope.dispatchEvent(changeEvent);

    scope.selected = 'null';
    scope.hovered = false;

    scope.document.removeEventListener('touchmove', onPointerMove, false);
    scope.document.removeEventListener('touchend', onTouchEnd, false);
  }

  /**
   * Window event callback
   * @param {} event
   */
  function onMouseHover(event)
  {
    event.preventDefault();

    if(event.button === 0 && scope.selected === 'null')
    {
      var intersect = intersectObjects(event, pickerAxes[scope.mode].children);

      var hoveredDisplay = null;
      if(intersect)
      {
        if(hovered !== intersect.object)
        {
          if(hovered !== null)
          {
            // revert display axis color
            hoveredDisplay =
                displayAxes[scope.mode].getObjectByName(hovered.name);
            if (hoveredDisplay)
            {
              hoveredDisplay.material.color.copy(hoveredColor);
            }
          }

          selectedPicker = intersect.object;
          hovered = intersect.object;
          hoveredColor.copy(hovered.material.color);

          // highlight display axis color
          hoveredDisplay =
              displayAxes[scope.mode].getObjectByName(hovered.name);
          if (hoveredDisplay)
          {
            hoveredDisplay.material.color.offsetHSL(0, 0, -0.3);
          }

          scope.dispatchEvent(changeEvent);
        }
        scope.hovered = true;
      }
      else if(hovered !== null)
      {
        // hovered.material.color.copy(hoveredColor);
        // revert display axis color
        hoveredDisplay =
            displayAxes[scope.mode].getObjectByName(hovered.name);
        if (hoveredDisplay)
        {
          hoveredDisplay.material.color.copy(hoveredColor);
        }

        hovered = null;

        scope.dispatchEvent(changeEvent);

        scope.hovered = false;
      }
    }
    scope.document.addEventListener('mousemove', onPointerMove, false);
    scope.document.addEventListener('mouseup', onMouseUp, false);
  }

  /**
   * Window event callback
   * @param {} event
   */
  function onMouseDown(event)
  {
    event.preventDefault();

    if(event.button !== 0)
    {
      return;
    }

    var intersect = intersectObjects(event, pickerAxes[scope.mode].children);

    if(intersect)
    {
        scope.selected = selectedPicker.name;

        scope.update();
        scope.setIntersectionPlane();

        var planeIntersect = intersectObjects(event,
            [intersectionPlanes[currentPlane]]);

        if(planeIntersect)
        {
          oldPosition.copy(scope.object.position);

          oldRotationMatrix.extractRotation(scope.object.matrix);
          worldRotationMatrix.extractRotation(scope.object.matrixWorld);

          parentRotationMatrix.extractRotation(
              scope.object.parent.matrixWorld);
          parentScale.setFromMatrixScale(tempMatrix.getInverse(
              scope.object.parent.matrixWorld));

          offset.copy(planeIntersect.point);
        }
    }

    scope.document.addEventListener('mousemove', onPointerMove, false);
    scope.document.addEventListener('mouseup', onMouseUp, false);
  }

  /**
   * Window event callback (mouse move and touch move)
   * @param {} event
   */
  function onPointerMove(event)
  {
    if(scope.selected === 'null')
    {
      return;
    }

    event.preventDefault();

    
    var planeIntersect = intersectObjects(event,
        [intersectionPlanes[currentPlane]]);

    if(planeIntersect)
    {
      point.copy(planeIntersect.point);

      if((scope.mode === 'translate') && isSelected('T'))
      {
        point.sub(offset);
        point.multiply(parentScale);

        if (scope.space === 'local')
        {
          point.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

          if(!(isSelected('X')) || scope.modifierAxis.x !== 1)
          {
            point.x = 0;
          }
          if(!(isSelected('Y')) || scope.modifierAxis.y !== 1)
          {
            point.y = 0;
          }
          if(!(isSelected('Z')) || scope.modifierAxis.z !== 1)
          {
            point.z = 0;
          }
          if (isSelected('XYZ'))
          {
            point.set(0, 0, 0);
          }
          point.applyMatrix4(oldRotationMatrix);

          scope.object.position.copy(oldPosition);
          scope.object.position.add(point);
        }
        if (scope.space === 'world' || isSelected('XYZ'))
        {
          if(!(isSelected('X')) || scope.modifierAxis.x !== 1)
          {
            point.x = 0;
          }
          if(!(isSelected('Y')) || scope.modifierAxis.y !== 1)
          {
            point.y = 0;
          }
          if(!(isSelected('Z')) || scope.modifierAxis.z !== 1)
          {
            point.z = 0;
          }

          point.applyMatrix4(tempMatrix.getInverse(parentRotationMatrix));

          scope.object.position.copy(oldPosition);
          scope.object.position.add(point);

          if(scope.snapDist)
          {
            if(isSelected('X'))
            {
              scope.object.position.x = Math.round(scope.object.position.x /
                  scope.snapDist) * scope.snapDist;
            }
            if(isSelected('Y'))
            {
              scope.object.position.y = Math.round(scope.object.position.y /
                  scope.snapDist) * scope.snapDist;
            }
            if(isSelected('Z'))
            {
              scope.object.position.z = Math.round(scope.object.position.z /
                  scope.snapDist) * scope.snapDist;
            }
          }
        }
      }
      else if((scope.mode === 'rotate') && isSelected('R'))
      {
        point.sub(worldPosition);
        point.multiply(parentScale);
        tempVector.copy(offset).sub(worldPosition);
        tempVector.multiply(parentScale);

        if(scope.selected === 'RE')
        {
          point.applyMatrix4(tempMatrix.getInverse(lookAtMatrix));
          tempVector.applyMatrix4(tempMatrix.getInverse(lookAtMatrix));

          rotation.set(Math.atan2(point.z, point.y),
                       Math.atan2(point.x, point.z),
                       Math.atan2(point.y, point.x));
          offsetRotation.set(Math.atan2(tempVector.z, tempVector.y),
                             Math.atan2(tempVector.x, tempVector.z),
                             Math.atan2(tempVector.y, tempVector.x));

          tempQuaternion.setFromRotationMatrix(
            tempMatrix.getInverse(parentRotationMatrix));

          quaternionE.setFromAxisAngle(eye, rotation.z - offsetRotation.z);
          quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionE);
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

          scope.object.quaternion.copy(tempQuaternion);
        }
        else if(scope.selected === 'RXYZE')
        {
          // has this ever worked?
          quaternionE.setFromEuler(
            point.clone().cross(tempVector).normalize());

          tempQuaternion.setFromRotationMatrix(
            tempMatrix.getInverse(parentRotationMatrix));
          quaternionX.setFromAxisAngle(
            quaternionE, - point.clone().angleTo(tempVector));
          quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

          scope.object.quaternion.copy(tempQuaternion);
        }
        else
        {
          if (scope.space === 'local')
          {
            point.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

            tempVector.applyMatrix4(tempMatrix.getInverse(worldRotationMatrix));

            rotation.set(Math.atan2(point.z, point.y),
              Math.atan2(point.x, point.z), Math.atan2(point.y, point.x));
            offsetRotation.set(Math.atan2(tempVector.z, tempVector.y),
              Math.atan2(tempVector.x, tempVector.z),
                Math.atan2(tempVector.y, tempVector.x));

            quaternionXYZ.setFromRotationMatrix(oldRotationMatrix);
            quaternionX.setFromAxisAngle(unitX, rotation.x - offsetRotation.x);
            quaternionY.setFromAxisAngle(unitY, rotation.y - offsetRotation.y);
            quaternionZ.setFromAxisAngle(unitZ, rotation.z - offsetRotation.z);

            if (scope.selected === 'RX')
            {
              quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionX);
            }
            if (scope.selected === 'RY')
            {
              quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionY);
            }
            if (scope.selected === 'RZ')
            {
              quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionZ);
            }

            scope.object.quaternion.copy(quaternionXYZ);
          }
          else if (scope.space === 'world')
          {
            rotation.set(Math.atan2(point.z, point.y),
              Math.atan2(point.x, point.z), Math.atan2(point.y, point.x));
            offsetRotation.set(Math.atan2(tempVector.z, tempVector.y),
              Math.atan2(tempVector.x, tempVector.z),
                Math.atan2(tempVector.y, tempVector.x));

            tempQuaternion.setFromRotationMatrix(tempMatrix.getInverse(
              parentRotationMatrix));

            quaternionX.setFromAxisAngle(unitX, rotation.x - offsetRotation.x);
            quaternionY.setFromAxisAngle(unitY, rotation.y - offsetRotation.y);
            quaternionZ.setFromAxisAngle(unitZ, rotation.z - offsetRotation.z);
            quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

            if(scope.selected === 'RX')
            {
              tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
            }
            if(scope.selected === 'RY')
            {
              tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
            }
            if(scope.selected === 'RZ')
            {
              tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);
            }

            tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

            scope.object.quaternion.copy(tempQuaternion);
          }
        }
      }
    }

    scope.update();
    scope.dispatchEvent(changeEvent);
  }

  function onMouseUp(event)
  {
    scope.selected = 'null';

    scope.document.removeEventListener('mousemove', onPointerMove, false);
    scope.document.removeEventListener('mouseup', onMouseUp, false);
  }

  /**
   * intersectObjects
   * @param {} event
   * @param {} objects
   * @returns {?}
   */
  function intersectObjects(event, objects)
  {
    var pointer = event.touches ? event.touches[0] : event;

    var rect = domElement.getBoundingClientRect();
    var x = (pointer.clientX - rect.left) / rect.width;
    var y = (pointer.clientY - rect.top) / rect.height;
    pointerVector.set(x * 2 - 1, - y * 2 + 1);
    ray.setFromCamera(pointerVector, scope.camera);

    // checks all intersections between the ray and the objects,
    // true to check the descendants
    var intersections = ray.intersectObjects(objects, true);

    return intersections[0] ? intersections[0] : false;
  }

  /**
   * Checks if given name is currently selected
   * @param {} name
   * @returns {bool}
   */
  function isSelected(name)
  {
    if(scope.selected.search(name) !== -1)
    {
        return true;
    }
    else
    {
        return false;
    }
  }

  /**
   * bakeTransformations
   * @param {} object
   */
  function bakeTransformations(object)
  {
    var tempGeometry = new THREE.Geometry();
    object.updateMatrix();
    tempGeometry.merge(object.geometry, object.matrix);
    object.geometry = tempGeometry;
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
  }
};

GZ3D.Manipulator.prototype = Object.create(THREE.EventDispatcher.prototype);

/**
 * Radial menu for an object
 * @constructor
 */
GZ3D.RadialMenu = function(domElement)
{
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  this.init();
};

/**
 * Initialize radial menu
 */
GZ3D.RadialMenu.prototype.init = function()
{
  var scale = 1.2;
  // Distance from starting point
  this.radius = 70*scale;
  // Speed to spread the menu
  this.speed = 10*scale;
  // Icon size
  this.bgSize = 40*scale;
  this.bgSizeSelected = 68*scale;
  this.highlightSize = 45*scale;
  this.iconProportion = 0.6;
  this.textureLoader = new THREE.TextureLoader();
  this.bgShape = this.textureLoader.load(
      'style/images/icon_background.png' );
  this.layers = {
    ICON: 0,
    BACKGROUND : 1,
    HIGHLIGHT : 2
  };

  // For the opening motion
  this.moving = false;
  this.startPosition = null;

  // Either moving or already stopped
  this.showing = false;

  // Colors
  this.selectedColor = new THREE.Color(0x22aadd);
  this.plainColor = new THREE.Color(0x333333);
  this.highlightColor = new THREE.Color(0x22aadd);
  this.disabledColor = new THREE.Color(0x888888);

  // Selected item
  this.selected = null;

  // Selected model
  this.model = null;

  // Object containing all items
  this.menu = new THREE.Group();

  // Add items to the menu
  this.addItem('delete','style/images/trash.png');
  this.addItem('translate','style/images/translate.png');
  this.addItem('rotate','style/images/rotate.png');
  this.addItem('transparent','style/images/transparent.png');
  this.addItem('wireframe','style/images/wireframe.png');
  this.addItem('joints','style/images/joints.png');

  this.setNumberOfItems(this.menu.children.length);

  // Start hidden
  this.hide();
};

/**
 * Hide radial menu
 * @param {} event - event which triggered hide
 * @param {function} callback
 */
GZ3D.RadialMenu.prototype.hide = function(event,callback)
{
  for (var i = 0; i < this.numberOfItems; i++)
  {
    var item = this.menu.children[i];

    item.children[this.layers.ICON].visible = false;
    item.children[this.layers.ICON].scale.set(
        this.bgSize*this.iconProportion,
        this.bgSize*this.iconProportion, 1.0 );

    item.children[this.layers.BACKGROUND].visible = false;
    item.children[this.layers.BACKGROUND].material.color = this.plainColor;
    item.children[this.layers.BACKGROUND].scale.set(
        this.bgSize,
        this.bgSize, 1.0 );

    item.children[this.layers.HIGHLIGHT].visible = false;
  }

  this.showing = false;
  this.moving = false;
  this.startPosition = null;

  if (callback && this.model)
  {
    if ( this.selected )
    {
      callback(this.selected,this.model);
      this.model = null;
    }
  }
  this.selected = null;
};

/**
 * Show radial menu
 * @param {} event - event which triggered show
 * @param {THREE.Object3D} model - model to which the menu will be attached
 */
GZ3D.RadialMenu.prototype.show = function(event,model)
{
  if (this.showing)
  {
    return;
  }

  this.model = model;

  if (model.children[0] instanceof THREE.Light)
  {
    this.setNumberOfItems(3);
  }
  else
  {
    this.setNumberOfItems(6);
  }

  var pointer = this.getPointer(event);
  this.startPosition = pointer;

  this.menu.getObjectByName('transparent').isHighlighted = false;
  this.menu.getObjectByName('wireframe').isHighlighted = false;
  this.menu.getObjectByName('joints').isHighlighted = false;
  this.menu.getObjectByName('joints').isDisabled = false;
  if (this.model.viewAs === 'transparent')
  {
    this.menu.getObjectByName('transparent').isHighlighted = true;
  }
  if (this.model.viewAs === 'wireframe')
  {
    this.menu.getObjectByName('wireframe').isHighlighted = true;
  }
  if (this.model.joint === undefined || this.model.joint.length === 0)
  {
    this.menu.getObjectByName('joints').isDisabled = true;
  }
  else if (this.model.getObjectByName('JOINT_VISUAL', true))
  {
    this.menu.getObjectByName('joints').isHighlighted = true;
  }

  for (var i = 0; i < this.numberOfItems; i++)
  {
    var item = this.menu.children[i];

    item.children[this.layers.ICON].visible = true;
    item.children[this.layers.ICON].position.set(pointer.x,pointer.y, 1);

    item.children[this.layers.BACKGROUND].visible = true;
    item.children[this.layers.BACKGROUND].position.set(pointer.x,pointer.y, 1);
    if (item.isDisabled)
    {
      item.children[this.layers.BACKGROUND].material.color = this.disabledColor;
    }

    item.children[this.layers.HIGHLIGHT].visible = item.isHighlighted;
    item.children[this.layers.HIGHLIGHT].position.set(pointer.x,pointer.y, 1);
  }

  this.moving = true;
  this.showing = true;
};

/**
 * Update radial menu
 */
GZ3D.RadialMenu.prototype.update = function()
{
  if (!this.moving)
  {
    return;
  }

  // Move outwards
  for (var i = 0; i < this.numberOfItems; i++)
  {
    var item = this.menu.children[i];

    var xdelta = item.children[this.layers.ICON].position.x -
        this.startPosition.x;
    var ydelta = item.children[this.layers.ICON].position.y -
        this.startPosition.y;

    var d = Math.sqrt(Math.pow(xdelta,2) + Math.pow(ydelta,2));

    if ( d < this.radius)
    {
      xdelta = xdelta -
          ( this.speed * Math.sin( ( this.offset - i ) * Math.PI/4 ) );
      ydelta = ydelta +
          ( this.speed * Math.cos( ( this.offset - i ) * Math.PI/4 ) );
    }
    else
    {
      this.moving = false;
    }

    var newX = xdelta + this.startPosition.x;
    var newY = ydelta + this.startPosition.y;
    item.children[this.layers.ICON].position.x = newX;
    item.children[this.layers.ICON].position.y = newY;

    item.children[this.layers.BACKGROUND].position.x = newX;
    item.children[this.layers.BACKGROUND].position.y = newY;

    item.children[this.layers.HIGHLIGHT].position.x = newX;
    item.children[this.layers.HIGHLIGHT].position.y = newY;
  }

};

/**
 * Get pointer (mouse or touch) coordinates inside the canvas
 * @param {} event
 */
GZ3D.RadialMenu.prototype.getPointer = function(event)
{
  if (event.originalEvent)
  {
    event = event.originalEvent;
  }
  var pointer = event.touches ? event.touches[ 0 ] : event;
  var rect = this.domElement.getBoundingClientRect();
  var posX = (pointer.clientX - rect.left);
  var posY = (pointer.clientY - rect.top);

  posX = posX - rect.width * 0.5;
  posY = -(posY - rect.height * 0.5);

  return {x: posX, y:posY};
};

/**
 * Movement after long press to select items on menu
 * @param {} event
 */
GZ3D.RadialMenu.prototype.onLongPressMove = function(event)
{
  var pointer = this.getPointer(event);
  var pointerX = pointer.x - this.startPosition.x;
  var pointerY = pointer.y - this.startPosition.y;

  var angle = Math.atan2(pointerY,pointerX);

  // Check angle region
  var region = null;
  // bottom-left
  if (angle > -7*Math.PI/8 && angle < -5*Math.PI/8)
  {
    region = 1;
  }
  // left
  else if ( (angle > -8*Math.PI/8 && angle < -7*Math.PI/8) ||
      (angle > 7*Math.PI/8 && angle < 8*Math.PI/8) )
  {
    region = 2;
  }
  // top-left
  else if (angle > 5*Math.PI/8 && angle < 7*Math.PI/8)
  {
    region = 3;
  }
  // top
  else if (angle > 3*Math.PI/8 && angle < 5*Math.PI/8)
  {
    region = 4;
  }
  // top-right
  else if (angle > 1*Math.PI/8 && angle < 3*Math.PI/8)
  {
    region = 5;
  }
  // right
  else if (angle > -1*Math.PI/8 && angle < 1*Math.PI/8)
  {
    region = 6;
  }
  // bottom-right
  else if (angle > -3*Math.PI/8 && angle < -1*Math.PI/8)
  {
    region = 7;
  }
  // bottom
  else if (angle > -5*Math.PI/8 && angle < -3*Math.PI/8)
  {
    region = 8;
  }

  // Check if any existing item is in the region
  var Selected = region - 4 + this.offset;

  if (Selected >= this.numberOfItems || Selected < 0)
  {
    this.selected = null;
    Selected = null;
  }

  var counter = 0;
  for (var i = 0; i < this.numberOfItems; i++)
  {
    var item = this.menu.children[i];

    if (counter === Selected)
    {
      item.children[this.layers.ICON].scale.set(
          this.bgSizeSelected*this.iconProportion,
          this.bgSizeSelected*this.iconProportion, 1.0 );
      this.selected = item.children[this.layers.ICON].name;

      if (!item.isDisabled)
      {
        item.children[this.layers.BACKGROUND].material.color =
            this.selectedColor;
      }
      item.children[this.layers.BACKGROUND].scale.set(
          this.bgSizeSelected,
          this.bgSizeSelected, 1.0 );
    }
    else
    {
      item.children[this.layers.ICON].scale.set(
          this.bgSize*this.iconProportion,
          this.bgSize*this.iconProportion, 1.0 );

      item.children[this.layers.BACKGROUND].scale.set(
          this.bgSize, this.bgSize, 1.0 );
      if (!item.isDisabled)
      {
        item.children[this.layers.BACKGROUND].material.color = this.plainColor;
      }
    }
    counter++;
  }
};

/**
 * Create an item and add it to the menu.
 * Create them in order
 * @param {string} type - delete/translate/rotate/transparent/wireframe/joints
 * @param {string} iconTexture - icon's uri
 */
GZ3D.RadialMenu.prototype.addItem = function(type, iconTexture)
{
  // Icon
  iconTexture = this.textureLoader.load( iconTexture );

  var iconMaterial = new THREE.SpriteMaterial( {
    map: iconTexture
  } );

  var icon = new THREE.Sprite( iconMaterial );
  icon.scale.set( this.bgSize*this.iconProportion,
      this.bgSize*this.iconProportion, 1.0 );
  icon.name = type;
  icon.position.set(0, 0, 1);

  // Background
  var bgMaterial = new THREE.SpriteMaterial( {
      map: this.bgShape,
      color: this.plainColor } );

  var bg = new THREE.Sprite( bgMaterial );
  bg.scale.set( this.bgSize, this.bgSize, 1.0 );
  bg.position.set(0, 0, 1);

  // Highlight
  var highlightMaterial = new THREE.SpriteMaterial({
      map: this.bgShape,
      color: this.highlightColor});

  var highlight = new THREE.Sprite(highlightMaterial);
  highlight.scale.set(this.highlightSize, this.highlightSize, 1.0);
  bg.position.set(0, 0, 1);
  highlight.visible = false;

  var item = new THREE.Group();
  // Respect layer order
  item.add(icon);
  item.add(bg);
  item.add(highlight);
  item.isHighlighted = false;
  item.name = type;

  this.menu.add(item);
};

/**
 * Set number of items (different for models and lights)
 * @param {int} number
 */
GZ3D.RadialMenu.prototype.setNumberOfItems = function(number)
{
  this.numberOfItems = number;
  this.offset = this.numberOfItems - 1 - Math.floor(this.numberOfItems/2);
};

/**
 * The scene is where everything is placed, from objects, to lights and cameras.
 * @param shaders GZ3D.Shaders instance, if not provided, custom shaders will
 *                not be set.
 * @constructor
 */
GZ3D.Scene = function(shaders)
{
  this.emitter = globalEmitter || new EventEmitter2({verboseMemoryLeak: true});
  this.shaders = shaders;
  this.init();
};

/**
 * Initialize scene
 */
GZ3D.Scene.prototype.init = function()
{
  this.name = 'default';
  this.scene = new THREE.Scene();
  // this.scene.name = this.name;
  this.meshes = {};

  // only support one heightmap for now.
  this.heightmap = null;

  this.selectedEntity = null;

  this.manipulationMode = 'view';
  this.pointerOnMenu = false;

  // loaders
  this.textureLoader = new THREE.TextureLoader();
  this.colladaLoader = new THREE.ColladaLoader();
  this.objLoader = new THREE.OBJLoader();
  this.stlLoader = new THREE.STLLoader();

  this.renderer = new THREE.WebGLRenderer({antialias: true });
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setClearColor(0xb2b2b2, 1);
  this.renderer.setSize( window.innerWidth, window.innerHeight);
  this.renderer.autoClear = false;
  // this.renderer.shadowMapEnabled = true;
  // this.renderer.shadowMapSoft = true;

  // lights
  this.ambient = new THREE.AmbientLight( 0x666666 );
  this.scene.add(this.ambient);

  // camera
  this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  this.defaultCameraPosition = new THREE.Vector3(0, -5, 5);
  this.resetView();

  // ortho camera and scene for rendering sprites
  this.cameraOrtho = new THREE.OrthographicCamera( -window.innerWidth * 0.5,
      window.innerWidth * 0.5, window.innerHeight*0.5, -window.innerHeight*0.5,
      1, 10);
  this.cameraOrtho.position.z = 10;
  this.sceneOrtho = new THREE.Scene();

  // Grid
  this.grid = new THREE.GridHelper(20, 20, 0xCCCCCC, 0x4D4D4D);
  this.grid.name = 'grid';
  this.grid.position.z = 0.05;
  this.grid.rotation.x = Math.PI * 0.5;
  this.grid.castShadow = false;
  this.grid.material.transparent = true;
  this.grid.material.opacity = 0.5;
  this.grid.visible = false;
  this.scene.add(this.grid);

  this.showCollisions = false;

  this.spawnModel = new GZ3D.SpawnModel(
      this, this.getDomElement());

  this.simpleShapesMaterial = new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );

  var that = this;

  // Need to use `document` instead of getDomElement in order to get events
  // outside the webgl div element.
  document.addEventListener( 'mouseup',
      function(event) {that.onPointerUp(event);}, false );

  this.getDomElement().addEventListener( 'mouseup',
      function(event) {that.onPointerUp(event);}, false );

  this.getDomElement().addEventListener( 'DOMMouseScroll',
      function(event) {that.onMouseScroll(event);}, false ); //firefox

  this.getDomElement().addEventListener( 'mousewheel',
      function(event) {that.onMouseScroll(event);}, false );

  document.addEventListener( 'keydown',
      function(event) {that.onKeyDown(event);}, false );

  this.getDomElement().addEventListener( 'mousedown',
      function(event) {that.onPointerDown(event);}, false );
  this.getDomElement().addEventListener( 'touchstart',
      function(event) {that.onPointerDown(event);}, false );

  this.getDomElement().addEventListener( 'touchend',
      function(event) {that.onPointerUp(event);}, false );

  // Handles for translating and rotating objects
  this.modelManipulator = new GZ3D.Manipulator(this.camera, isTouchDevice,
      this.getDomElement());

  this.timeDown = null;

  this.controls = new THREE.OrbitControls(this.camera);
  this.scene.add(this.controls.targetIndicator);

  // Radial menu (only triggered by touch)
  this.radialMenu = new GZ3D.RadialMenu(this.getDomElement());
  this.sceneOrtho.add(this.radialMenu.menu);

  // Bounding Box
  var indices = new Uint16Array(
      [ 0, 1, 1, 2, 2, 3, 3, 0,
        4, 5, 5, 6, 6, 7, 7, 4,
        0, 4, 1, 5, 2, 6, 3, 7 ] );
  var positions = new Float32Array(8 * 3);
  var boxGeometry = new THREE.BufferGeometry();
  boxGeometry.setIndex(new THREE.BufferAttribute( indices, 1 ));
  boxGeometry.addAttribute( 'position',
      new THREE.BufferAttribute(positions, 3));
  this.boundingBox = new THREE.LineSegments(boxGeometry,
      new THREE.LineBasicMaterial({color: 0xffffff}));

  this.boundingBox.visible = false;

  // Joint visuals
  this.jointTypes =
      {
        REVOLUTE: 1,
        REVOLUTE2: 2,
        PRISMATIC: 3,
        UNIVERSAL: 4,
        BALL: 5,
        SCREW: 6,
        GEARBOX: 7,
        FIXED: 8
      };
  this.jointAxis = new THREE.Object3D();
  this.jointAxis.name = 'JOINT_VISUAL';
  var geometry, material, mesh;

  // XYZ
  var XYZaxes = new THREE.Object3D();

  geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 10, 1, false);

  material = new THREE.MeshBasicMaterial({color: new THREE.Color(0xff0000)});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0.15;
  mesh.rotation.z = -Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  XYZaxes.add(mesh);

  material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x00ff00)});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.15;
  mesh.name = 'JOINT_VISUAL';
  XYZaxes.add(mesh);

  material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x0000ff)});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.15;
  mesh.rotation.x = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  XYZaxes.add(mesh);

  geometry = new THREE.CylinderGeometry(0, 0.03, 0.1, 10, 1, true);

  material = new THREE.MeshBasicMaterial({color: new THREE.Color(0xff0000)});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0.3;
  mesh.rotation.z = -Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  XYZaxes.add(mesh);

  material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x00ff00)});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.3;
  mesh.name = 'JOINT_VISUAL';
  XYZaxes.add(mesh);

  material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x0000ff)});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.3;
  mesh.rotation.x = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  XYZaxes.add(mesh);

  this.jointAxis['XYZaxes'] = XYZaxes;

  var mainAxis = new THREE.Object3D();

  material = new THREE.MeshLambertMaterial();
  material.color = new THREE.Color(0xffff00);

  var mainAxisLen = 0.3;
  geometry = new THREE.CylinderGeometry(0.015, 0.015, mainAxisLen, 36, 1,
      false);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = mainAxisLen * 0.5;
  mesh.rotation.x = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  mainAxis.add(mesh);

  geometry = new THREE.CylinderGeometry(0, 0.035, 0.1, 36, 1, false);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = mainAxisLen;
  mesh.rotation.x = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  mainAxis.add(mesh);

  this.jointAxis['mainAxis'] = mainAxis;

  var rotAxis = new THREE.Object3D();

  geometry = new THREE.TorusGeometry(0.04, 0.006, 10, 36, Math.PI * 3/2);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = mainAxisLen;
  mesh.name = 'JOINT_VISUAL';
  rotAxis.add(mesh);

  geometry = new THREE.CylinderGeometry(0.015, 0, 0.025, 10, 1, false);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.04;
  mesh.position.z = mainAxisLen;
  mesh.rotation.z = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  rotAxis.add(mesh);

  this.jointAxis['rotAxis'] = rotAxis;

  var transAxis = new THREE.Object3D();

  geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 10, 1, true);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0.03;
  mesh.position.y = 0.03;
  mesh.position.z = mainAxisLen * 0.5;
  mesh.rotation.x = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  transAxis.add(mesh);

  geometry = new THREE.CylinderGeometry(0.02, 0, 0.0375, 10, 1, false);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0.03;
  mesh.position.y = 0.03;
  mesh.position.z = mainAxisLen * 0.5 + 0.05;
  mesh.rotation.x = -Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  transAxis.add(mesh);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0.03;
  mesh.position.y = 0.03;
  mesh.position.z = mainAxisLen * 0.5 - 0.05;
  mesh.rotation.x = Math.PI/2;
  mesh.name = 'JOINT_VISUAL';
  transAxis.add(mesh);

  this.jointAxis['transAxis'] = transAxis;

  var screwAxis = new THREE.Object3D();

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = -0.04;
  mesh.position.z = mainAxisLen - 0.11;
  mesh.rotation.z = -Math.PI/4;
  mesh.rotation.x = -Math.PI/10;
  mesh.name = 'JOINT_VISUAL';
  screwAxis.add(mesh);

  var radius = 0.04;
  var length = 0.02;
  var curve = new THREE.CatmullRomCurve3(
      [new THREE.Vector3(radius, 0, 0*length),
      new THREE.Vector3(0, radius, 1*length),
      new THREE.Vector3(-radius, 0, 2*length),
      new THREE.Vector3(0, -radius, 3*length),
      new THREE.Vector3(radius, 0, 4*length),
      new THREE.Vector3(0, radius, 5*length),
      new THREE.Vector3(-radius, 0, 6*length)]);
  geometry = new THREE.TubeGeometry(curve, 36, 0.01, 10, false);

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = mainAxisLen - 0.23;
  mesh.name = 'JOINT_VISUAL';
  screwAxis.add(mesh);

  this.jointAxis['screwAxis'] = screwAxis;

  var ballVisual = new THREE.Object3D();

  geometry = new THREE.SphereGeometry(0.06);

  mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'JOINT_VISUAL';
  ballVisual.add(mesh);

  this.jointAxis['ballVisual'] = ballVisual;

  // center of mass visual
  this.COMvisual = new THREE.Object3D();
  this.COMvisual.name = 'COM_VISUAL';

  geometry = new THREE.SphereGeometry(1, 32, 32);

  mesh = new THREE.Mesh(geometry);
  this.setMaterial(mesh, {'ambient':[0.5,0.5,0.5,1.000000],
    'texture':'assets/media/materials/textures/com.png'});
  mesh.name = 'COM_VISUAL';
  mesh.rotation.z = -Math.PI/2;
  this.COMvisual.add(mesh);
};

GZ3D.Scene.prototype.initScene = function()
{
  this.emitter.emit('show_grid', 'show');

  // create a sun light
  var obj = this.createLight(3, new THREE.Color(0.8, 0.8, 0.8), 0.9,
       {position: {x:0, y:0, z:10}, orientation: {x:0, y:0, z:0, w:1}},
       null, true, 'sun', {x: 0.5, y: 0.1, z: -0.9});

  this.add(obj);
};

GZ3D.Scene.prototype.setSDFParser = function(sdfParser)
{
  this.spawnModel.sdfParser = sdfParser;
};

/**
 * Window event callback
 * @param {} event - mousedown or touchdown events
 */
GZ3D.Scene.prototype.onPointerDown = function(event)
{
  event.preventDefault();

  if (this.spawnModel.active)
  {
    return;
  }

  var mainPointer = true;
  var pos;
  if (event.touches)
  {
    if (event.touches.length === 1)
    {
      pos = new THREE.Vector2(
          event.touches[0].clientX, event.touches[0].clientY);
    }
    else if (event.touches.length === 2)
    {
      pos = new THREE.Vector2(
          (event.touches[0].clientX + event.touches[1].clientX)/2,
          (event.touches[0].clientY + event.touches[1].clientY)/2);
    }
    else
    {
      return;
    }
  }
  else
  {
    pos = new THREE.Vector2(
          event.clientX, event.clientY);
    if (event.which !== 1)
    {
      mainPointer = false;
    }
  }

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }

  // Cancel in case of multitouch
  if (event.touches && event.touches.length !== 1)
  {
    return;
  }

  // Manipulation modes
  // Model found
  if (model)
  {
    // Do nothing to the floor plane
    if (model.name === 'plane')
    {
      this.timeDown = new Date().getTime();
    }
    else if (this.modelManipulator.pickerNames.indexOf(model.name) >= 0)
    {
      // Do not attach manipulator to itself
    }
    // Attach manipulator to model
    else if (model.name !== '')
    {
      if (mainPointer && model.parent === this.scene)
      {
        this.selectEntity(model);
      }
    }
    // Manipulator pickers, for mouse
    else if (this.modelManipulator.hovered)
    {
      this.modelManipulator.update();
      this.modelManipulator.object.updateMatrixWorld();
    }
    // Sky
    else
    {
      this.timeDown = new Date().getTime();
    }
  }
  // Plane from below, for example
  else
  {
    this.timeDown = new Date().getTime();
  }
};

/**
 * Window event callback
 * @param {} event - mouseup or touchend events
 */
GZ3D.Scene.prototype.onPointerUp = function(event)
{
  event.preventDefault();

  // Clicks (<150ms) outside any models trigger view mode
  var millisecs = new Date().getTime();
  if (millisecs - this.timeDown < 150)
  {
    this.setManipulationMode('view');
    $( '#view-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  this.timeDown = null;
};

/**
 * Window event callback
 * @param {} event - mousescroll event
 */
GZ3D.Scene.prototype.onMouseScroll = function(event)
{
  event.preventDefault();

  var pos = new THREE.Vector2(event.clientX, event.clientY);

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }
};

/**
 * Window event callback
 * @param {} event - keydown events
 */
GZ3D.Scene.prototype.onKeyDown = function(event)
{
  if (event.shiftKey)
  {
    // + and - for zooming
    if (event.keyCode === 187 || event.keyCode === 189)
    {
      var pos = new THREE.Vector2(window.innerWidth/2.0,
          window.innerHeight/2.0);

      var intersect = new THREE.Vector3();
      var model = this.getRayCastModel(pos, intersect);

      if (intersect)
      {
        this.controls.target = intersect;
      }

      if (event.keyCode === 187)
      {
        this.controls.dollyOut();
      }
      else
      {
        this.controls.dollyIn();
      }
    }
  }

  // DEL to delete entities
  if (event.keyCode === 46)
  {
    if (this.selectedEntity)
    {
      this.emitter.emit('delete_entity');
    }
  }

  // F2 for turning on effects
  if (event.keyCode === 113)
  {
    this.effectsEnabled = !this.effectsEnabled;
  }

  // Esc/R/T for changing manipulation modes
  if (event.keyCode === 27) // Esc
  {
    $( '#view-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  if (event.keyCode === 82) // R
  {
    $( '#rotate-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  if (event.keyCode === 84) // T
  {
    $( '#translate-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
};

/**
 * Check if there's a model immediately under canvas coordinate 'pos'
 * @param {THREE.Vector2} pos - Canvas coordinates
 * @param {THREE.Vector3} intersect - Empty at input,
 * contains point of intersection in 3D world coordinates at output
 * @returns {THREE.Object3D} model - Intercepted model closest to the camera
 */
GZ3D.Scene.prototype.getRayCastModel = function(pos, intersect)
{
  var vector = new THREE.Vector3(
      ((pos.x - this.renderer.domElement.offsetLeft)
      / window.innerWidth) * 2 - 1,
      -((pos.y - this.renderer.domElement.offsetTop)
      / window.innerHeight) * 2 + 1, 1);
  vector.unproject(this.camera);
  var ray = new THREE.Raycaster( this.camera.position,
      vector.sub(this.camera.position).normalize() );

  var allObjects = [];
  this.scene.getDescendants(allObjects);
  var objects = ray.intersectObjects(allObjects);

  var model;
  var point;
  if (objects.length > 0)
  {
    modelsloop:
    for (var i = 0; i < objects.length; ++i)
    {
      model = objects[i].object;
      if (model.name.indexOf('_lightHelper') >= 0)
      {
        model = model.parent;
        break;
      }

      if (!this.modelManipulator.hovered &&
          (model.name === 'plane'))
      {
        // model = null;
        point = objects[i].point;
        break;
      }

      if (model.name === 'grid' || model.name === 'boundingBox' ||
          model.name === 'JOINT_VISUAL' || model.name === 'INERTIA_VISUAL'
	  || model.name === 'COM_VISUAL')
      {
        point = objects[i].point;
        model = null;
        continue;
      }

      while (model.parent !== this.scene)
      {
        // Select current mode's handle
        if (model.parent.parent === this.modelManipulator.gizmo &&
            ((this.manipulationMode === 'translate' &&
              model.name.indexOf('T') >=0) ||
             (this.manipulationMode === 'rotate' &&
               model.name.indexOf('R') >=0)))
        {
          break modelsloop;
        }
        model = model.parent;
      }

      if (model === this.radialMenu.menu)
      {
        continue;
      }

      if (model.name.indexOf('COLLISION_VISUAL') >= 0)
      {
        model = null;
        continue;
      }

      if (this.modelManipulator.hovered)
      {
        if (model === this.modelManipulator.gizmo)
        {
          break;
        }
      }
      else if (model.name !== '')
      {
        point = objects[i].point;
        break;
      }
    }
  }
  if (point)
  {
    intersect.x = point.x;
    intersect.y = point.y;
    intersect.z = point.z;
  }
  return model;
};

/**
 * Get dom element
 * @returns {domElement}
 */
GZ3D.Scene.prototype.getDomElement = function()
{
  return this.renderer.domElement;
};

/**
 * Render scene
 */
GZ3D.Scene.prototype.render = function()
{
  // Kill camera control when:
  // -manipulating
  // -using radial menu
  // -pointer over menus
  // -spawning
  if (this.modelManipulator.hovered ||
      this.radialMenu.showing ||
      this.pointerOnMenu ||
      this.spawnModel.active)
  {
    this.controls.enabled = false;
    this.controls.update();
  }
  else
  {
    this.controls.enabled = true;
    this.controls.update();
  }

  this.modelManipulator.update();
  this.radialMenu.update();

  this.renderer.clear();
  this.renderer.render(this.scene, this.camera);

  this.renderer.clearDepth();
  this.renderer.render(this.sceneOrtho, this.cameraOrtho);
};

/**
 * Set window size
 * @param {double} width
 * @param {double} height
 */
GZ3D.Scene.prototype.setWindowSize = function(width, height)
{
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.cameraOrtho.left = -width / 2;
  this.cameraOrtho.right = width / 2;
  this.cameraOrtho.top = height / 2;
  this.cameraOrtho.bottom = -height / 2;
  this.cameraOrtho.updateProjectionMatrix();

  this.renderer.setSize(width, height);
  this.render();
};

/**
 * Add object to the scene
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.add = function(model)
{
  model.viewAs = 'normal';
  this.scene.add(model);
};

/**
 * Remove object from the scene
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.remove = function(model)
{
  this.scene.remove(model);
};

/**
 * Returns the object which has the given name
 * @param {string} name
 * @returns {THREE.Object3D} model
 */
GZ3D.Scene.prototype.getByName = function(name)
{
  return this.scene.getObjectByName(name);
};

/**
 * Update a model's pose
 * @param {THREE.Object3D} model
 * @param {} position
 * @param {} orientation
 */
GZ3D.Scene.prototype.updatePose = function(model, position, orientation)
{
  if (this.modelManipulator && this.modelManipulator.object &&
      this.modelManipulator.hovered)
  {
    return;
  }

  this.setPose(model, position, orientation);
};

/**
 * Set a model's pose
 * @param {THREE.Object3D} model
 * @param {} position
 * @param {} orientation
 */
GZ3D.Scene.prototype.setPose = function(model, position, orientation)
{
  model.position.x = position.x;
  model.position.y = position.y;
  model.position.z = position.z;
  model.quaternion.w = orientation.w;
  model.quaternion.x = orientation.x;
  model.quaternion.y = orientation.y;
  model.quaternion.z = orientation.z;
};

GZ3D.Scene.prototype.removeAll = function()
{
  while(this.scene.children.length > 0)
  {
    this.scene.remove(this.scene.children[0]);
  }
};

/**
 * Create plane
 * @param {double} normalX
 * @param {double} normalY
 * @param {double} normalZ
 * @param {double} width
 * @param {double} height
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createPlane = function(normalX, normalY, normalZ,
    width, height)
{
  var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  var material =  new THREE.MeshPhongMaterial();
  var mesh = new THREE.Mesh(geometry, material);
  var normal = new THREE.Vector3(normalX, normalY, normalZ);
  var cross = normal.crossVectors(normal, mesh.up);
  mesh.rotation = normal.applyAxisAngle(cross, -(normal.angleTo(mesh.up)));
  mesh.name = 'plane';
  mesh.receiveShadow = true;
  return mesh;
};

/**
 * Create sphere
 * @param {double} radius
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createSphere = function(radius)
{
  var geometry = new THREE.SphereGeometry(radius, 32, 32);
  var mesh = new THREE.Mesh(geometry, this.simpleShapesMaterial);
  return mesh;
};

/**
 * Create cylinder
 * @param {double} radius
 * @param {double} length
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createCylinder = function(radius, length)
{
  var geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1,
      false);
  var mesh = new THREE.Mesh(geometry, this.simpleShapesMaterial);
  mesh.rotation.x = Math.PI * 0.5;
  return mesh;
};

/**
 * Create box
 * @param {double} width
 * @param {double} height
 * @param {double} depth
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createBox = function(width, height, depth)
{
  var geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);

  // Fix UVs so textures are mapped in a way that is consistent to gazebo
  // Some face uvs need to be rotated clockwise, while others anticlockwise
  // After updating to threejs rev 62, geometries changed from quads (6 faces)
  // to triangles (12 faces).
  geometry.dynamic = true;
  var faceUVFixA = [1, 4, 5];
  var faceUVFixB = [0];
  for (var i = 0; i < faceUVFixA.length; ++i)
  {
    var idx = faceUVFixA[i]*2;
    var uva = geometry.faceVertexUvs[0][idx][0];
    geometry.faceVertexUvs[0][idx][0] = geometry.faceVertexUvs[0][idx][1];
    geometry.faceVertexUvs[0][idx][1] = geometry.faceVertexUvs[0][idx+1][1];
    geometry.faceVertexUvs[0][idx][2] = uva;

    geometry.faceVertexUvs[0][idx+1][0] = geometry.faceVertexUvs[0][idx+1][1];
    geometry.faceVertexUvs[0][idx+1][1] = geometry.faceVertexUvs[0][idx+1][2];
    geometry.faceVertexUvs[0][idx+1][2] = geometry.faceVertexUvs[0][idx][2];
  }
  for (var ii = 0; ii < faceUVFixB.length; ++ii)
  {
    var idxB = faceUVFixB[ii]*2;
    var uvc = geometry.faceVertexUvs[0][idxB][0];
    geometry.faceVertexUvs[0][idxB][0] = geometry.faceVertexUvs[0][idxB][2];
    geometry.faceVertexUvs[0][idxB][1] = uvc;
    geometry.faceVertexUvs[0][idxB][2] =  geometry.faceVertexUvs[0][idxB+1][1];

    geometry.faceVertexUvs[0][idxB+1][2] = geometry.faceVertexUvs[0][idxB][2];
    geometry.faceVertexUvs[0][idxB+1][1] = geometry.faceVertexUvs[0][idxB+1][0];
    geometry.faceVertexUvs[0][idxB+1][0] = geometry.faceVertexUvs[0][idxB][1];
  }
  geometry.uvsNeedUpdate = true;

  var mesh = new THREE.Mesh(geometry, this.simpleShapesMaterial);
  mesh.castShadow = true;
  return mesh;
};

/**
 * Create light
 * @param {} type - 1: point, 2: spot, 3: directional
 * @param {} diffuse
 * @param {} intensity
 * @param {} pose
 * @param {} distance
 * @param {} cast_shadows
 * @param {} name
 * @param {} direction
 * @param {} specular
 * @param {} attenuation_constant
 * @param {} attenuation_linear
 * @param {} attenuation_quadratic
 * @returns {THREE.Object3D}
 */
GZ3D.Scene.prototype.createLight = function(type, diffuse, intensity, pose,
    distance, cast_shadows, name, direction, specular, attenuation_constant,
    attenuation_linear, attenuation_quadratic)
{
  var obj = new THREE.Object3D();
  var color = new THREE.Color();

  if (typeof(diffuse) === 'undefined')
  {
    diffuse = 0xffffff;
  }
  else if (typeof(diffuse) !== THREE.Color)
  {
    color.r = diffuse.r;
    color.g = diffuse.g;
    color.b = diffuse.b;
    diffuse = color.clone();
  }
  else if (typeof(specular) !== THREE.Color)
  {
    color.r = specular.r;
    color.g = specular.g;
    color.b = specular.b;
    specular = color.clone();
  }

  if (pose)
  {
    this.setPose(obj, pose.position, pose.orientation);
    obj.matrixWorldNeedsUpdate = true;
  }

  var elements;
  if (type === 1)
  {
    elements = this.createPointLight(obj, diffuse, intensity,
        distance, cast_shadows);
  }
  else if (type === 2)
  {
    elements = this.createSpotLight(obj, diffuse, intensity,
        distance, cast_shadows);
  }
  else if (type === 3)
  {
    elements = this.createDirectionalLight(obj, diffuse, intensity,
        cast_shadows);
  }

  var lightObj = elements[0];
  var helper = elements[1];

  if (name)
  {
    lightObj.name = name;
    obj.name = name;
    helper.name = name + '_lightHelper';
  }

  var dir = new THREE.Vector3(0, 0, -1);
  if (direction)
  {
    dir.x = direction.x;
    dir.y = direction.y;
    dir.z = direction.z;
  }
  obj.direction = new THREE.Vector3(dir.x, dir.y, dir.z);

  var targetObj = new THREE.Object3D();
  lightObj.add(targetObj);

  targetObj.position.copy(dir);
  targetObj.matrixWorldNeedsUpdate = true;
  lightObj.target = targetObj;

  // Add properties which exist on the server but have no meaning on THREE.js
  obj.serverProperties = {};
  obj.serverProperties.specular = specular;
  obj.serverProperties.attenuation_constant = attenuation_constant;
  obj.serverProperties.attenuation_linear = attenuation_linear;
  obj.serverProperties.attenuation_quadratic = attenuation_quadratic;

  obj.add(lightObj);
  obj.add(helper);
  return obj;
};

/**
 * Create point light - called by createLight
 * @param {} obj - light object
 * @param {} color
 * @param {} intensity
 * @param {} distance
 * @param {} cast_shadows
 * @returns {Object.<THREE.Light, THREE.Mesh>}
 */
GZ3D.Scene.prototype.createPointLight = function(obj, color, intensity,
    distance, cast_shadows)
{
  if (typeof(intensity) === 'undefined')
  {
    intensity = 0.5;
  }

  var lightObj = new THREE.PointLight(color, intensity);

  if (distance)
  {
    lightObj.distance = distance;
  }
  if (cast_shadows)
  {
    lightObj.castShadow = cast_shadows;
  }

  var helperGeometry = new THREE.OctahedronGeometry(0.25, 0);
  helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
  var helperMaterial = new THREE.MeshBasicMaterial(
        {wireframe: true, color: 0x00ff00});
  var helper = new THREE.Mesh(helperGeometry, helperMaterial);

  return [lightObj, helper];
};

/**
 * Create spot light - called by createLight
 * @param {} obj - light object
 * @param {} color
 * @param {} intensity
 * @param {} distance
 * @param {} cast_shadows
 * @returns {Object.<THREE.Light, THREE.Mesh>}
 */
GZ3D.Scene.prototype.createSpotLight = function(obj, color, intensity,
    distance, cast_shadows)
{
  if (typeof(intensity) === 'undefined')
  {
    intensity = 1;
  }
  if (typeof(distance) === 'undefined')
  {
    distance = 20;
  }

  var lightObj = new THREE.SpotLight(color, intensity);
  lightObj.distance = distance;
  lightObj.position.set(0,0,0);

  if (cast_shadows)
  {
    lightObj.castShadow = cast_shadows;
  }

  var helperGeometry = new THREE.CylinderGeometry(0, 0.3, 0.2, 4, 1, true);
  helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
  helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
  var helperMaterial = new THREE.MeshBasicMaterial(
        {wireframe: true, color: 0x00ff00});
  var helper = new THREE.Mesh(helperGeometry, helperMaterial);

  return [lightObj, helper];

};

/**
 * Create directional light - called by createLight
 * @param {} obj - light object
 * @param {} color
 * @param {} intensity
 * @param {} cast_shadows
 * @returns {Object.<THREE.Light, THREE.Mesh>}
 */
GZ3D.Scene.prototype.createDirectionalLight = function(obj, color, intensity,
    cast_shadows)
{
  if (typeof(intensity) === 'undefined')
  {
    intensity = 1;
  }

  var lightObj = new THREE.DirectionalLight(color, intensity);
  lightObj.shadow.camera.near = 1;
  lightObj.shadow.camera.far = 50;
  lightObj.shadow.mapSize.width = 4094;
  lightObj.shadow.mapSize.height = 4094;
  lightObj.shadow.camera.bottom = -100;
  lightObj.shadow.camera.feft = -100;
  lightObj.shadow.camera.right = 100;
  lightObj.shadow.camera.top = 100;
  lightObj.shadow.bias = 0.0001;
  lightObj.position.set(0,0,0);

  if (cast_shadows)
  {
    lightObj.castShadow = cast_shadows;
  }

  var helperGeometry = new THREE.Geometry();
  helperGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, 0));
  helperGeometry.vertices.push(new THREE.Vector3(   0,    0, 0));
  helperGeometry.vertices.push(new THREE.Vector3(   0,    0, -0.5));
  var helperMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
  var helper = new THREE.Line(helperGeometry, helperMaterial,
      THREE.LineSegments);

  return [lightObj, helper];
};

/**
 * Create roads
 * @param {} points
 * @param {} width
 * @param {} texture
 * @returns {THREE.Mesh}
 */
GZ3D.Scene.prototype.createRoads = function(points, width, texture)
{
  var geometry = new THREE.Geometry();
  geometry.dynamic = true;
  var texCoord = 0.0;
  var texMaxLen = width;
  var factor = 1.0;
  var curLen = 0.0;
  var tangent = new THREE.Vector3(0,0,0);
  var pA;
  var pB;
  var prevPt = new THREE.Vector3(0,0,0);
  var prevTexCoord;
  var texCoords = [];
  var j = 0;
  for (var i = 0; i < points.length; ++i)
  {
    var pt0 =  new THREE.Vector3(points[i].x, points[i].y,
        points[i].z);
    var pt1;
    if (i !== points.length - 1)
    {
      pt1 =  new THREE.Vector3(points[i+1].x, points[i+1].y,
          points[i+1].z);
    }
    factor = 1.0;
    if (i > 0)
    {
      curLen += pt0.distanceTo(prevPt);
    }
    texCoord = curLen/texMaxLen;
    if (i === 0)
    {
      tangent.x = pt1.x;
      tangent.y = pt1.y;
      tangent.z = pt1.z;
      tangent.sub(pt0);
      tangent.normalize();
    }
    else if (i === points.length - 1)
    {
      tangent.x = pt0.x;
      tangent.y = pt0.y;
      tangent.z = pt0.z;
      tangent.sub(prevPt);
      tangent.normalize();
    }
    else
    {
      var v0 = new THREE.Vector3(0,0,0);
      var v1 = new THREE.Vector3(0,0,0);
      v0.x = pt0.x;
      v0.y = pt0.y;
      v0.z = pt0.z;
      v0.sub(prevPt);
      v0.normalize();

      v1.x = pt1.x;
      v1.y = pt1.y;
      v1.z = pt1.z;
      v1.sub(pt0);
      v1.normalize();

      var dot = v0.dot(v1*-1);

      tangent.x = pt1.x;
      tangent.y = pt1.y;
      tangent.z = pt1.z;
      tangent.sub(prevPt);
      tangent.normalize();

      if (dot > -0.97 && dot < 0.97)
      {
        factor = 1.0 / Math.sin(Math.acos(dot) * 0.5);
      }
    }
    var theta = Math.atan2(tangent.x, -tangent.y);
    pA = new THREE.Vector3(pt0.x,pt0.y,pt0.z);
    pB = new THREE.Vector3(pt0.x,pt0.y,pt0.z);
    var w = (width * factor)*0.5;
    pA.x += Math.cos(theta) * w;
    pA.y += Math.sin(theta) * w;
    pB.x -= Math.cos(theta) * w;
    pB.y -= Math.sin(theta) * w;

    geometry.vertices.push(pA);
    geometry.vertices.push(pB);

    texCoords.push([0, texCoord]);
    texCoords.push([1, texCoord]);

    // draw triangle strips
    if (i > 0)
    {
      geometry.faces.push(new THREE.Face3(j, j+1, j+2,
        new THREE.Vector3(0, 0, 1)));
      geometry.faceVertexUvs[0].push(
          [new THREE.Vector2(texCoords[j][0], texCoords[j][1]),
           new THREE.Vector2(texCoords[j+1][0], texCoords[j+1][1]),
           new THREE.Vector2(texCoords[j+2][0], texCoords[j+2][1])]);
      j++;

      geometry.faces.push(new THREE.Face3(j, j+2, j+1,
        new THREE.Vector3(0, 0, 1)));
      geometry.faceVertexUvs[0].push(
          [new THREE.Vector2(texCoords[j][0], texCoords[j][1]),
           new THREE.Vector2(texCoords[j+2][0], texCoords[j+2][1]),
           new THREE.Vector2(texCoords[j+1][0], texCoords[j+1][1])]);
      j++;

    }

    prevPt.x = pt0.x;
    prevPt.y = pt0.y;
    prevPt.z = pt0.z;

    prevTexCoord = texCoord;
  }

  // geometry.computeTangents();
  geometry.computeFaceNormals();

  geometry.verticesNeedUpdate = true;
  geometry.uvsNeedUpdate = true;


  var material =  new THREE.MeshPhongMaterial();

 /* var ambient = mat['ambient'];
  if (ambient)
  {
    material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
  }
  var diffuse = mat['diffuse'];
  if (diffuse)
  {
    material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
  }
  var specular = mat['specular'];
  if (specular)
  {
    material.specular.setRGB(specular[0], specular[1], specular[2]);
  }*/
  if (texture)
  {
    var tex = this.textureLoader.load(texture);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    material.map = tex;
  }

  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  return mesh;
};

/**
 * Load heightmap
 * @param {} heights Lookup table of heights
 * @param {} width Width in meters
 * @param {} height Height in meters
 * @param {} segmentWidth Size of lookup table
 * @param {} segmentHeight Size of lookup table
 * @param {} origin Heightmap position in the world
 * @param {} textures
 * @param {} blends
 * @param {} parent
 */
GZ3D.Scene.prototype.loadHeightmap = function(heights, width, height,
    segmentWidth, segmentHeight, origin, textures, blends, parent)
{
  if (this.heightmap)
  {
    console.log('Only one heightmap can be loaded at a time');
    return;
  }

  if (parent === undefined)
  {
    console.error('Missing parent, heightmap won\'t be loaded.');
    return;
  }

  // unfortunately large heightmaps kill the fps and freeze everything so
  // we have to scale it down
  var scale = 1;
  var maxHeightmapWidth = 256;
  var maxHeightmapHeight = 256;

  if ((segmentWidth-1) > maxHeightmapWidth)
  {
    scale = maxHeightmapWidth / (segmentWidth-1);
  }

  var geometry = new THREE.PlaneGeometry(width, height,
      (segmentWidth-1) * scale, (segmentHeight-1) * scale);
  geometry.dynamic = true;

  // Mirror the vertices about the X axis
  var vertices = [];
  for (var h = segmentHeight-1; h >= 0; --h)
  {
    for (var w = 0; w < segmentWidth; ++w)
    {
      vertices[(segmentHeight-h-1)*segmentWidth  + w]
          = heights[h*segmentWidth + w];
    }
  }

  // Sub-sample
  var col = (segmentWidth-1) * scale;
  var row = (segmentHeight-1) * scale;
  for (var r = 0; r < row; ++r)
  {
    for (var c = 0; c < col; ++c)
    {
      var index = (r * col * 1/(scale*scale)) +   (c * (1/scale));
      geometry.vertices[r*col + c].z = vertices[index];
    }
  }

  // Compute normals
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  // Material - use shader if textures provided, otherwise use a generic phong
  // material
  var material;
  if (textures && textures.length > 0)
  {
    var textureLoaded = [];
    var repeats = [];
    for (var t = 0; t < textures.length; ++t)
    {
      textureLoaded[t] = this.textureLoader.load(textures[t].diffuse);
      textureLoaded[t].wrapS = THREE.RepeatWrapping;
      textureLoaded[t].wrapT = THREE.RepeatWrapping;
      repeats[t] = width/textures[t].size;
    }

    // for now, use fixed no. of textures and blends
    // so populate the remaining ones to make the fragment shader happy
    for (var tt = textures.length; tt< 3; ++tt)
    {
      textureLoaded[tt] = textureLoaded[tt-1];
    }

    for (var b = blends.length; b < 2; ++b)
    {
      blends[b] = blends[b-1];
    }

    for (var rr = repeats.length; rr < 3; ++rr)
    {
      repeats[rr] = repeats[rr-1];
    }

    // Use the same approach as gazebo scene, grab the first directional light
    // and use it for shading the terrain
    var lightDir = new THREE.Vector3(0, 0, 1);
    var lightDiffuse = new THREE.Color(0xffffff);
    var allObjects = [];
    this.scene.getDescendants(allObjects);
    for (var l = 0; l < allObjects.length; ++l)
    {
      if (allObjects[l] instanceof THREE.DirectionalLight)
      {
        lightDir = allObjects[l].target.position;
        lightDiffuse = allObjects[l].color;
        break;
      }
    }

    var options = {
      uniforms:
      {
        texture0: { type: 't', value: textureLoaded[0]},
        texture1: { type: 't', value: textureLoaded[1]},
        texture2: { type: 't', value: textureLoaded[2]},
        repeat0: { type: 'f', value: repeats[0]},
        repeat1: { type: 'f', value: repeats[1]},
        repeat2: { type: 'f', value: repeats[2]},
        minHeight1: { type: 'f', value: blends[0].min_height},
        fadeDist1: { type: 'f', value: blends[0].fade_dist},
        minHeight2: { type: 'f', value: blends[1].min_height},
        fadeDist2: { type: 'f', value: blends[1].fade_dist},
        ambient: { type: 'c', value: this.ambient.color},
        lightDiffuse: { type: 'c', value: lightDiffuse},
        lightDir: { type: 'v3', value: lightDir}
      },
    };

    if (this.shaders !== undefined)
    {
      options.vertexShader = this.shaders.heightmapVS;
      options.fragmentShader = this.shaders.heightmapFS;
    }
    else
    {
      console.log('Warning: heightmap shaders not provided.');
    }

    material = new THREE.ShaderMaterial(options);
  }
  else
  {
    material = new THREE.MeshPhongMaterial( { color: 0x555555 } );
  }

  var mesh = new THREE.Mesh(geometry, material);

  mesh.position.x = origin.x;
  mesh.position.y = origin.y;
  mesh.position.z = origin.z;
  parent.add(mesh);

  this.heightmap = parent;
};

/* eslint-disable */
/**
 * Load mesh
 * @example
 * // loading using URI
 * // callback(mesh)
 * loadMeshFromUri('assets/house_1/meshes/house_1.dae', undefined, undefined, function(mesh)
            {
              // use the mesh
            });
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 */
/* eslint-enable */
GZ3D.Scene.prototype.loadMeshFromUri = function(uri, submesh, centerSubmesh,
  callback)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  if (this.meshes[uri])
  {
    var mesh = this.meshes[uri];
    mesh = mesh.clone();
    this.useSubMesh(mesh, submesh, centerSubmesh);
    callback(mesh);
    return;
  }

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, submesh, centerSubmesh, callback);
  }
  else if (uriFile.substr(-4).toLowerCase() === '.obj')
  {
    return this.loadOBJ(uri, submesh, centerSubmesh, callback);
  }
  else if (uriFile.substr(-4).toLowerCase() === '.stl')
  {
    return this.loadSTL(uri, submesh, centerSubmesh, callback);
  }
  else if (uriFile.substr(-5).toLowerCase() === '.urdf')
  {
    /*var urdfModel = new ROSLIB.UrdfModel({
      string : uri
    });

    // adapted from ros3djs
    var links = urdfModel.links;
    for ( var l in links) {
      var link = links[l];
      if (link.visual && link.visual.geometry) {
        if (link.visual.geometry.type === ROSLIB.URDF_MESH) {
          var frameID = '/' + link.name;
          var filename = link.visual.geometry.filename;
          var meshType = filename.substr(-4).toLowerCase();
          var mesh = filename.substring(filename.indexOf('://') + 3);
          // ignore mesh files which are not in Collada format
          if (meshType === '.dae')
          {
            var dae = this.loadCollada(uriPath + '/' + mesh, parent);
            // check for a scale
            if(link.visual.geometry.scale)
            {
              dae.scale = new THREE.Vector3(
                  link.visual.geometry.scale.x,
                  link.visual.geometry.scale.y,
                  link.visual.geometry.scale.z
              );
            }
          }
        }
      }
    }*/
  }
};

/* eslint-disable */
/**
 * Load mesh
 * @example
 * // loading using URI
 * // callback(mesh)
 * @example
 * // loading using file string
 * // callback(mesh)
 * loadMeshFromString('assets/house_1/meshes/house_1.dae', undefined, undefined, function(mesh)
            {
              // use the mesh
            }, ['<?xml version="1.0" encoding="utf-8"?>
    <COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
      <asset>
        <contributor>
          <author>Cole</author>
          <authoring_tool>OpenCOLLADA for 3ds Max;  Ver.....']);
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 * @param {array} files - files needed by the loaders[dae] in case of a collada
 * mesh, [obj, mtl] in case of object mesh, all as strings
 */
/* eslint-enable */
GZ3D.Scene.prototype.loadMeshFromString = function(uri, submesh, centerSubmesh,
  callback, files)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  if (this.meshes[uri])
  {
    var mesh = this.meshes[uri];
    mesh = mesh.clone();
    this.useSubMesh(mesh, submesh, centerSubmesh);
    callback(mesh);
    return;
  }

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    // loadCollada just accepts one file, which is the dae file as string
    return this.loadCollada(uri, submesh, centerSubmesh, callback, files[0]);
  }
  else if (uriFile.substr(-4).toLowerCase() === '.obj')
  {
    return this.loadOBJ(uri, submesh, centerSubmesh, callback, files);
  }
};

/**
 * Load collada file
 * @param {string} uri - mesh uri which is used by colldaloader to load
 * the mesh file using an XMLHttpRequest.
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 * @param {string} filestring -optional- the mesh file as a string to be parsed
 * if provided the uri will not be used just as a url, no XMLHttpRequest will
 * be made.
 */
GZ3D.Scene.prototype.loadCollada = function(uri, submesh, centerSubmesh,
  callback, filestring)
{
  var dae;
  var mesh = null;
  /*
  // Crashes: issue #36
  if (this.meshes[uri])
  {
    dae = this.meshes[uri];
    dae = dae.clone();
    this.useColladaSubMesh(dae, submesh, centerSubmesh);
    callback(dae);
    return;
  }
  */

  var loader = new THREE.ColladaLoader();

  if (!filestring)
  {
    loader.load(uri, function(collada)
    {
      meshReady(collada);
    });
  }
  else
  {
    loader.parse(filestring, function(collada)
    {
      meshReady(collada);
    }, undefined);
  }

  function meshReady(collada)
  {
    // check for a scale factor
    /*if(collada.dae.asset.unit)
    {
      var scale = collada.dae.asset.unit;
      collada.scene.scale = new THREE.Vector3(scale, scale, scale);
    }*/

    dae = collada.scene;
    dae.updateMatrix();
    this.scene.prepareColladaMesh(dae);
    this.scene.meshes[uri] = dae;
    dae = dae.clone();
    this.scene.useSubMesh(dae, submesh, centerSubmesh);

    dae.name = uri;
    callback(dae);
  }
};

/**
 * Prepare collada by removing other non-mesh entities such as lights
 * @param {} dae
 */
GZ3D.Scene.prototype.prepareColladaMesh = function(dae)
{
  var allChildren = [];
  dae.getDescendants(allChildren);
  for (var i = 0; i < allChildren.length; ++i)
  {
    if (allChildren[i] instanceof THREE.Light)
    {
      allChildren[i].parent.remove(allChildren[i]);
    }
  }
};

/**
 * Prepare mesh by handling submesh-only loading
 * @param {} mesh
 * @param {} submesh
 * @param {} centerSubmesh
 * @returns {THREE.Mesh} mesh
 */
GZ3D.Scene.prototype.useSubMesh = function(mesh, submesh, centerSubmesh)
{
  if (!submesh)
  {
    return null;
  }

  var result;
  var allChildren = [];
  mesh.getDescendants(allChildren);
  for (var i = 0; i < allChildren.length; ++i)
  {
    if (allChildren[i] instanceof THREE.Mesh)
    {
      if (allChildren[i].name === submesh ||
          allChildren[i].geometry.name === submesh)
      {
        if (centerSubmesh)
        {
          // obj
          if (allChildren[i].geometry instanceof THREE.BufferGeometry)
          {
            var geomPosition = allChildren[i].geometry.attributes.position;
            var dim = geomPosition.itemSize;
            var minPos = [];
            var maxPos = [];
            var centerPos = [];
            var m = 0;
            for (m = 0; m < dim; ++m)
            {
              minPos[m] = geomPosition.array[m];
              maxPos[m] = minPos[m];
            }
            var kk = 0;
            for (kk = dim; kk < geomPosition.count * dim; kk+=dim)
            {
              for (m = 0; m < dim; ++m)
              {
                minPos[m] = Math.min(minPos[m], geomPosition.array[kk + m]);
                maxPos[m] = Math.max(maxPos[m], geomPosition.array[kk + m]);
              }
            }

            for (m = 0; m < dim; ++m)
            {
              centerPos[m] = minPos[m] + (0.5 * (maxPos[m] - minPos[m]));
            }

            for (kk = 0; kk < geomPosition.count * dim; kk+=dim)
            {
              for (m = 0; m < dim; ++m)
              {
                geomPosition.array[kk + m] -= centerPos[m];
              }
            }
            allChildren[i].geometry.attributes.position.needsUpdate = true;
          }
          // dae
          else
          {
            var vertices = allChildren[i].geometry.vertices;
            var vMin = new THREE.Vector3();
            var vMax = new THREE.Vector3();
            vMin.x = vertices[0].x;
            vMin.y = vertices[0].y;
            vMin.z = vertices[0].z;
            vMax.x = vMin.x;
            vMax.y = vMin.y;
            vMax.z = vMin.z;

            for (var j = 1; j < vertices.length; ++j)
            {
              vMin.x = Math.min(vMin.x, vertices[j].x);
              vMin.y = Math.min(vMin.y, vertices[j].y);
              vMin.z = Math.min(vMin.z, vertices[j].z);
              vMax.x = Math.max(vMax.x, vertices[j].x);
              vMax.y = Math.max(vMax.y, vertices[j].y);
              vMax.z = Math.max(vMax.z, vertices[j].z);
            }

            var center  = new THREE.Vector3();
            center.x = vMin.x + (0.5 * (vMax.x - vMin.x));
            center.y = vMin.y + (0.5 * (vMax.y - vMin.y));
            center.z = vMin.z + (0.5 * (vMax.z - vMin.z));

            for (var k = 0; k < vertices.length; ++k)
            {
              vertices[k].x -= center.x;
              vertices[k].y -= center.y;
              vertices[k].z -= center.z;
            }

            allChildren[i].geometry.verticesNeedUpdate = true;
            var p = allChildren[i].parent;
            while (p)
            {
              p.position.set(0, 0, 0);
              p = p.parent;
            }
          }
        }
        result = allChildren[i];
      }
      else
      {
        allChildren[i].parent.remove(allChildren[i]);
      }
    }
  }
  return result;
};

/**
 * Load Obj file
 * @param {string} uri - mesh uri which is used by mtlloader and the objloader
 * to load both the mesh file and the mtl file using XMLHttpRequests.
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 * @param {array} files -optional- the mesh and the mtl files as a strings
 * to be parsed by the loaders, if provided the uri will not be used just
 * as a url, no XMLHttpRequest will be made.
 */
GZ3D.Scene.prototype.loadOBJ = function(uri, submesh, centerSubmesh, callback,
  files)
{
  var obj = null;
  var baseUrl = uri.substr(0, uri.lastIndexOf('/') + 1);
  var mtlLoader = new THREE.MTLLoader();
  var that = this;
  var containerLoaded = function (container)
  {
    // callback to signal mesh loading is complete
    var loadComplete = function()
    {
      obj = container;
      this.scene.meshes[uri] = obj;
      obj = obj.clone();
      this.scene.useSubMesh(obj, submesh, centerSubmesh);

      obj.name = uri;
      callback(obj);
    };

    // apply material to obj mesh
    var applyMaterial = function(mtlCreator)
    {
      var allChildren = [];
      container.getDescendants(allChildren);
      for (var j =0; j < allChildren.length; ++j)
      {
        var child = allChildren[j];
        if (child && child.material)
        {
          if (child.material.name)
          {
            child.material = mtlCreator.create(child.material.name);
          }
          else if (Array.isArray(child.material))
          {
            for (var k = 0; k < child.material.length; ++k)
            {
              child.material[k] = mtlCreator.create(child.material[k].name);
            }
          }
        }
      }
      loadComplete();
    };

    if (container.materialLibraries.length === 0)
    {
      // return if there are no materials to be applied
      loadComplete();
    }

    for (var i=0; i < container.materialLibraries.length; ++i)
    {
      var mtlPath = container.materialLibraries[i];
      mtlLoader.load(mtlPath, applyMaterial);
    }
  };

  if (!files)
  {
    this.objLoader.load(uri, function(_container)
    {
      mtlLoader.setPath(baseUrl);
      containerLoaded(_container);
    });
  }
  else if (files[0])
  {
    var _container = this.objLoader.parse(files[0]);
    // mtlLoader.parse(files[1]);
    // containerLoaded(_container);

    // this part is to be removed after updateing the mtlLoader.
    obj = _container;
    this.meshes[uri] = obj;
    obj = obj.clone();
    this.useSubMesh(obj, submesh, centerSubmesh);

    obj.name = uri;
    callback(obj);
  }
};

/**
 * Load stl file.
 * Loads stl mesh given using it's uri
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 */
GZ3D.Scene.prototype.loadSTL = function(uri, submesh, centerSubmesh,
  callback)
{
  var mesh = null;
  this.stlLoader.load(uri, function(geometry)
  {
    mesh = new THREE.Mesh( geometry );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.meshes[uri] = mesh;
    mesh = mesh.clone();
    this.scene.useSubMesh(mesh, submesh, centerSubmesh);

    mesh.name = uri;
    callback(mesh);
  });
};

/**
 * Set material for an object
 * @param {} obj
 * @param {} material
 */
GZ3D.Scene.prototype.setMaterial = function(obj, material)
{
  if (obj)
  {
    if (material)
    {
      obj.material = new THREE.MeshPhongMaterial();
      var ambient = material.ambient;
      var diffuse = material.diffuse;
      if (diffuse)
      {
        // threejs removed ambient from phong and lambert materials so
        // aproximate the resulting color by mixing ambient and diffuse
        var dc = [];
        dc[0] = diffuse[0];
        dc[1] = diffuse[1];
        dc[2] = diffuse[2];
        if (ambient)
        {
          var a = 0.4;
          var d = 0.6;
          dc[0] = ambient[0]*a + diffuse[0]*d;
          dc[1] = ambient[1]*a + diffuse[1]*d;
          dc[2] = ambient[2]*a + diffuse[2]*d;
        }
        obj.material.color.setRGB(dc[0], dc[1], dc[2]);
      }
      var specular = material.specular;
      if (specular)
      {
        obj.material.specular.setRGB(specular[0], specular[1], specular[2]);
      }
      var opacity = material.opacity;
      if (opacity)
      {
        if (opacity < 1)
        {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      }

      if (material.texture)
      {
        var texture = this.textureLoader.load(material.texture);
        if (material.scale)
        {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.x = 1.0 / material.scale[0];
          texture.repeat.y = 1.0 / material.scale[1];
        }
        obj.material.map = texture;
      }
      if (material.normalMap)
      {
        obj.material.normalMap =
            this.textureLoader.load(material.normalMap);
      }
    }
  }
};

/**
 * Set manipulation mode (view/translate/rotate)
 * @param {string} mode
 */
GZ3D.Scene.prototype.setManipulationMode = function(mode)
{
  this.manipulationMode = mode;

  if (mode === 'view')
  {
    if (this.modelManipulator.object)
    {
      this.emitter.emit('entityChanged', this.modelManipulator.object);
    }
    this.selectEntity(null);
  }
  else
  {
    // Toggle manipulaion space (world / local)
    if (this.modelManipulator.mode === this.manipulationMode)
    {
      this.modelManipulator.space =
        (this.modelManipulator.space === 'world') ? 'local' : 'world';
    }
    this.modelManipulator.mode = this.manipulationMode;
    this.modelManipulator.setMode(this.modelManipulator.mode);
    // model was selected during view mode
    if (this.selectedEntity)
    {
      this.selectEntity(this.selectedEntity);
    }
  }

};

/**
 * Show collision visuals
 * @param {boolean} show
 */
GZ3D.Scene.prototype.showCollision = function(show)
{
  if (show === this.showCollisions)
  {
    return;
  }

  var allObjects = [];
  this.scene.getDescendants(allObjects);
  for (var i = 0; i < allObjects.length; ++i)
  {
    if (allObjects[i] instanceof THREE.Object3D &&
        allObjects[i].name.indexOf('COLLISION_VISUAL') >=0)
    {
      var allChildren = [];
      allObjects[i].getDescendants(allChildren);
      for (var j =0; j < allChildren.length; ++j)
      {
        if (allChildren[j] instanceof THREE.Mesh)
        {
          allChildren[j].visible = show;
        }
      }
    }
  }
  this.showCollisions = show;

};

/**
 * Attach manipulator to an object
 * @param {THREE.Object3D} model
 * @param {string} mode (translate/rotate)
 */
GZ3D.Scene.prototype.attachManipulator = function(model,mode)
{
  if (this.modelManipulator.object)
  {
    this.emitter.emit('entityChanged', this.modelManipulator.object);
  }

  if (mode !== 'view')
  {
    this.modelManipulator.attach(model);
    this.modelManipulator.mode = mode;
    this.modelManipulator.setMode( this.modelManipulator.mode );
    this.scene.add(this.modelManipulator.gizmo);
  }
};

/**
 * Reset view
 */
GZ3D.Scene.prototype.resetView = function()
{
  this.camera.position.copy(this.defaultCameraPosition);
  this.camera.up = new THREE.Vector3(0, 0, 1);
  this.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
  this.camera.updateMatrix();
};

/**
 * Show radial menu
 * @param {} event
 */
GZ3D.Scene.prototype.showRadialMenu = function(e)
{
  var event = e.originalEvent;

  var pointer = event.touches ? event.touches[ 0 ] : event;
  var pos = new THREE.Vector2(pointer.clientX, pointer.clientY);

  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (model && model.name !== '' && model.name !== 'plane'
      && this.modelManipulator.pickerNames.indexOf(model.name) === -1)
  {
    this.radialMenu.show(event,model);
    this.selectEntity(model);
  }
};

/**
 * Sets the bounding box of an object while ignoring the addtional visuals.
 * @param {THREE.Box3} - box
 * @param {THREE.Object3D} - object
 */
GZ3D.Scene.prototype.setFromObject = function(box, object)
{
  box.min.x = box.min.y = box.min.z = + Infinity;
  box.max.x = box.max.y = box.max.z = - Infinity;
  var v = new THREE.Vector3();
  object.updateMatrixWorld( true );

  object.traverse( function ( node )
  {
    var i, l;
    var geometry = node.geometry;
    if ( geometry !== undefined )
    {

      if (node.name !== 'INERTIA_VISUAL' && node.name !== 'COM_VISUAL')
      {

        if ( geometry.isGeometry )
        {

          var vertices = geometry.vertices;

          for ( i = 0, l = vertices.length; i < l; i ++ )
          {

            v.copy( vertices[ i ] );
            v.applyMatrix4( node.matrixWorld );

            expandByPoint( v );

          }

        }
        else if ( geometry.isBufferGeometry )
        {

          var attribute = geometry.attributes.position;

          if ( attribute !== undefined )
          {

            for ( i = 0, l = attribute.count; i < l; i ++ )
            {

              v.fromBufferAttribute( attribute, i ).applyMatrix4(
                node.matrixWorld );

              expandByPoint( v );

            }
          }
        }
      }
    }
  });

  function expandByPoint(point)
  {
    box.min.min( point );
    box.max.max( point );
  }

};

/**
 * Show bounding box for a model. The box is aligned with the world.
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.showBoundingBox = function(model)
{
  if (typeof model === 'string')
  {
    model = this.scene.getObjectByName(model);
  }

  if (this.boundingBox.visible)
  {
    if (this.boundingBox.parent === model)
    {
      return;
    }
    else
    {
      this.hideBoundingBox();
    }
  }
  var box = new THREE.Box3();
  // w.r.t. world
  this.setFromObject(box, model);
  // center vertices with object
  box.min.x = box.min.x - model.position.x;
  box.min.y = box.min.y - model.position.y;
  box.min.z = box.min.z - model.position.z;
  box.max.x = box.max.x - model.position.x;
  box.max.y = box.max.y - model.position.y;
  box.max.z = box.max.z - model.position.z;

  var position = this.boundingBox.geometry.attributes.position;
  var array = position.array;
  array[  0 ] = box.max.x; array[  1 ] = box.max.y; array[  2 ] = box.max.z;
  array[  3 ] = box.min.x; array[  4 ] = box.max.y; array[  5 ] = box.max.z;
  array[  6 ] = box.min.x; array[  7 ] = box.min.y; array[  8 ] = box.max.z;
  array[  9 ] = box.max.x; array[ 10 ] = box.min.y; array[ 11 ] = box.max.z;
  array[ 12 ] = box.max.x; array[ 13 ] = box.max.y; array[ 14 ] = box.min.z;
  array[ 15 ] = box.min.x; array[ 16 ] = box.max.y; array[ 17 ] = box.min.z;
  array[ 18 ] = box.min.x; array[ 19 ] = box.min.y; array[ 20 ] = box.min.z;
  array[ 21 ] = box.max.x; array[ 22 ] = box.min.y; array[ 23 ] = box.min.z;
  position.needsUpdate = true;
  this.boundingBox.geometry.computeBoundingSphere();

  // rotate the box back to the world
  var modelRotation = new THREE.Matrix4();
  modelRotation.extractRotation(model.matrixWorld);
  var modelInverse = new THREE.Matrix4();
  modelInverse.getInverse(modelRotation);
  this.boundingBox.quaternion.setFromRotationMatrix(modelInverse);
  this.boundingBox.name = 'boundingBox';
  this.boundingBox.visible = true;

  // Add box as model's child
  model.add(this.boundingBox);
};

/**
 * Hide bounding box
 */
GZ3D.Scene.prototype.hideBoundingBox = function()
{
  if(this.boundingBox.parent)
  {
    this.boundingBox.parent.remove(this.boundingBox);
  }
  this.boundingBox.visible = false;
};

/**
 * Mouse right click
 * @param {} event
 * @param {} callback - function to be executed to the clicked model
 */
GZ3D.Scene.prototype.onRightClick = function(event, callback)
{
  var pos = new THREE.Vector2(event.clientX, event.clientY);
  var model = this.getRayCastModel(pos, new THREE.Vector3());

  if(model && model.name !== '' && model.name !== 'plane' &&
      this.modelManipulator.pickerNames.indexOf(model.name) === -1)
  {
    callback(model);
  }
};


/**
 * Set model's view mode
 * @param {} model
 * @param {} viewAs (normal/transparent/wireframe)
 */
GZ3D.Scene.prototype.setViewAs = function(model, viewAs)
{
  // Toggle
  if (model.viewAs === viewAs)
  {
    viewAs = 'normal';
  }

  var showWireframe = (viewAs === 'wireframe');
  function materialViewAs(material)
  {
    if (materials.indexOf(material.id) === -1)
    {
      materials.push(material.id);
      if (viewAs === 'transparent')
      {
        if (material.opacity)
        {
          material.originalOpacity = material.opacity;
        }
        else
        {
          material.originalOpacity = 1.0;
        }
        material.opacity = 0.25;
        material.transparent = true;
      }
      else
      {
        material.opacity = material.originalOpacity ?
            material.originalOpacity : 1.0;
        if (material.opacity >= 1.0)
        {
          material.transparent = false;
        }
      }
      // wireframe handling
      material.wireframe = showWireframe;
    }
  }

  var wireframe;
  var descendants = [];
  var materials = [];
  model.getDescendants(descendants);
  for (var i = 0; i < descendants.length; ++i)
  {
    if (descendants[i].material &&
        descendants[i].name.indexOf('boundingBox') === -1 &&
        descendants[i].name.indexOf('COLLISION_VISUAL') === -1 &&
        !this.getParentByPartialName(descendants[i], 'COLLISION_VISUAL') &&
        descendants[i].name.indexOf('wireframe') === -1 &&
        descendants[i].name.indexOf('JOINT_VISUAL') === -1 &&
        descendants[i].name.indexOf('COM_VISUAL') === -1 &&
        descendants[i].name.indexOf('INERTIA_VISUAL') === -1)
    {
      // Note: multi-material is being deprecated and will be removed soon
      if (descendants[i].material instanceof THREE.MultiMaterial)
      {
        for (var j = 0; j < descendants[i].material.materials.length; ++j)
        {
          materialViewAs(descendants[i].material.materials[j]);
        }
      }
      else if (Array.isArray(descendants[i].material))
      {
        for (var k = 0; k < descendants[i].material.length; ++k)
        {
          materialViewAs(descendants[i].material[k]);
        }
      }
      else
      {
        materialViewAs(descendants[i].material);
      }
    }
  }
  model.viewAs = viewAs;
};

/**
 * Returns the closest parent whose name contains the given string
 * @param {} object
 * @param {} name
 */
GZ3D.Scene.prototype.getParentByPartialName = function(object, name)
{
  var parent = object.parent;
  while (parent && parent !== this.scene)
  {
    if (parent.name.indexOf(name) !== -1)
    {
      return parent;
    }

    parent = parent.parent;
  }
  return null;
};

/**
 * Select entity
 * @param {} object
 */
GZ3D.Scene.prototype.selectEntity = function(object)
{
  if (object)
  {
    if (object !== this.selectedEntity)
    {
      this.showBoundingBox(object);
      this.selectedEntity = object;
    }
    this.attachManipulator(object, this.manipulationMode);
    this.emitter.emit('setTreeSelected', object.name);
  }
  else
  {
    if (this.modelManipulator.object)
    {
      this.modelManipulator.detach();
      this.scene.remove(this.modelManipulator.gizmo);
    }
    this.hideBoundingBox();
    this.selectedEntity = null;
    this.emitter.emit('setTreeDeselected');
  }
};

/**
 * View joints
 * Toggle: if there are joints, hide, otherwise, show.
 * @param {} model
 */
GZ3D.Scene.prototype.viewJoints = function(model)
{
  if (model.joint === undefined || model.joint.length === 0)
  {
    return;
  }

  var child;

  // Visuals already exist
  if (model.jointVisuals)
  {
    // Hide = remove from parent
    if (model.jointVisuals[0].parent !== undefined &&
      model.jointVisuals[0].parent !== null)
    {
      for (var v = 0; v < model.jointVisuals.length; ++v)
      {
        model.jointVisuals[v].parent.remove(model.jointVisuals[v]);
      }
    }
    // Show: attach to parent
    else
    {
      for (var s = 0; s < model.joint.length; ++s)
      {
        child = model.getObjectByName(model.joint[s].child);

        if (!child)
        {
          continue;
        }

        child.add(model.jointVisuals[s]);
      }
    }
  }
  // Create visuals
  else
  {
    model.jointVisuals = [];
    for (var j = 0; j < model.joint.length; ++j)
    {
      child = model.getObjectByName(model.joint[j].child);

      if (!child)
      {
        continue;
      }

      // XYZ expressed w.r.t. child
      var jointVisual = this.jointAxis['XYZaxes'].clone();
      child.add(jointVisual);
      model.jointVisuals.push(jointVisual);
      jointVisual.scale.set(0.7, 0.7, 0.7);

      this.setPose(jointVisual, model.joint[j].pose.position,
          model.joint[j].pose.orientation);

      var mainAxis = null;
      if (model.joint[j].type !== this.jointTypes.BALL &&
          model.joint[j].type !== this.jointTypes.FIXED)
      {
        mainAxis = this.jointAxis['mainAxis'].clone();
        jointVisual.add(mainAxis);
      }

      var secondAxis = null;
      if (model.joint[j].type === this.jointTypes.REVOLUTE2 ||
          model.joint[j].type === this.jointTypes.UNIVERSAL)
      {
        secondAxis = this.jointAxis['mainAxis'].clone();
        jointVisual.add(secondAxis);
      }

      if (model.joint[j].type === this.jointTypes.REVOLUTE ||
          model.joint[j].type === this.jointTypes.GEARBOX)
      {
        mainAxis.add(this.jointAxis['rotAxis'].clone());
      }
      else if (model.joint[j].type === this.jointTypes.REVOLUTE2 ||
               model.joint[j].type === this.jointTypes.UNIVERSAL)
      {
        mainAxis.add(this.jointAxis['rotAxis'].clone());
        secondAxis.add(this.jointAxis['rotAxis'].clone());
      }
      else if (model.joint[j].type === this.jointTypes.BALL)
      {
        jointVisual.add(this.jointAxis['ballVisual'].clone());
      }
      else if (model.joint[j].type === this.jointTypes.PRISMATIC)
      {
        mainAxis.add(this.jointAxis['transAxis'].clone());
      }
      else if (model.joint[j].type === this.jointTypes.SCREW)
      {
        mainAxis.add(this.jointAxis['screwAxis'].clone());
      }

      var direction, tempMatrix, rotMatrix;
      if (mainAxis)
      {
        // main axis expressed w.r.t. parent model or joint frame
        if (!model.joint[j].axis1)
        {
          console.log('no joint axis ' +  model.joint[j].type + 'vs '
            + this.jointTypes.FIXED);
        }
        if (model.joint[j].axis1.use_parent_model_frame === undefined)
        {
          model.joint[j].axis1.use_parent_model_frame = true;
        }

        direction = new THREE.Vector3(
            model.joint[j].axis1.xyz.x,
            model.joint[j].axis1.xyz.y,
            model.joint[j].axis1.xyz.z);
        direction.normalize();

        tempMatrix = new THREE.Matrix4();
        if (model.joint[j].axis1.use_parent_model_frame)
        {
          tempMatrix.extractRotation(jointVisual.matrix);
          tempMatrix.getInverse(tempMatrix);
          direction.applyMatrix4(tempMatrix);
          tempMatrix.extractRotation(child.matrix);
          tempMatrix.getInverse(tempMatrix);
          direction.applyMatrix4(tempMatrix);
        }

        rotMatrix = new THREE.Matrix4();
        rotMatrix.lookAt(direction, new THREE.Vector3(0, 0, 0), mainAxis.up);
        mainAxis.quaternion.setFromRotationMatrix(rotMatrix);
      }

      if (secondAxis)
      {
        if (model.joint[j].axis2.use_parent_model_frame === undefined)
        {
          model.joint[j].axis2.use_parent_model_frame = true;
        }

        direction = new THREE.Vector3(
            model.joint[j].axis2.xyz.x,
            model.joint[j].axis2.xyz.y,
            model.joint[j].axis2.xyz.z);
        direction.normalize();

        tempMatrix = new THREE.Matrix4();
        if (model.joint[j].axis2.use_parent_model_frame)
        {
          tempMatrix.extractRotation(jointVisual.matrix);
          tempMatrix.getInverse(tempMatrix);
          direction.applyMatrix4(tempMatrix);
          tempMatrix.extractRotation(child.matrix);
          tempMatrix.getInverse(tempMatrix);
          direction.applyMatrix4(tempMatrix);
        }

        secondAxis.position =  direction.multiplyScalar(0.3);
        rotMatrix = new THREE.Matrix4();
        rotMatrix.lookAt(direction, new THREE.Vector3(0, 0, 0), secondAxis.up);
        secondAxis.quaternion.setFromRotationMatrix(rotMatrix);
      }
    }
  }
};

/**
 * View Center Of Mass
 * Toggle: if there are COM visuals, hide, otherwise, show.
 * @param {} model
 */
GZ3D.Scene.prototype.viewCOM = function(model)
{
  if (model === undefined || model === null)
  {
    return;
  }
  if (model.children.length === 0)
  {
    return;
  }

  var child;

  // Visuals already exist
  if (model.COMVisuals)
  {
    // Hide = remove from parent
    if (model.COMVisuals[0].parent !== undefined &&
      model.COMVisuals[0].parent !== null)
    {
      for (var v = 0; v < model.COMVisuals.length; ++v)
      {
        for (var k = 0; k < 3; k++)
        {
          model.COMVisuals[v].parent.remove(model.COMVisuals[v].crossLines[k]);
        }
        model.COMVisuals[v].parent.remove(model.COMVisuals[v]);
      }
    }
    // Show: attach to parent
    else
    {
      for (var s = 0; s < model.children.length; ++s)
      {
        child = model.getObjectByName(model.children[s].name);

        if (!child || child.name === 'boundingBox')
        {
          continue;
        }

        child.add(model.COMVisuals[s].crossLines[0]);
        child.add(model.COMVisuals[s].crossLines[1]);
        child.add(model.COMVisuals[s].crossLines[2]);
        child.add(model.COMVisuals[s]);
      }
    }
  }
  // Create visuals
  else
  {
    model.COMVisuals = [];
    var box, COMVisual, line_1, line_2, line_3, helperGeometry_1,
    helperGeometry_2, helperGeometry_3, helperMaterial, points = new Array(6);
    for (var j = 0; j < model.children.length; ++j)
    {
      child = model.getObjectByName(model.children[j].name);

      if (!child)
      {
        continue;
      }

      if (child.userData.inertial)
      {
        var mesh, radius, inertialMass, userdatapose, inertialPose = {};
        var inertial = child.userData.inertial;

        userdatapose = child.userData.inertial.pose;
        inertialMass = inertial.mass;

        // calculate the radius using lead density
        radius = Math.cbrt((0.75 * inertialMass ) / (Math.PI * 11340));

        COMVisual = this.COMvisual.clone();
        child.add(COMVisual);
        model.COMVisuals.push(COMVisual);
        COMVisual.scale.set(radius, radius, radius);

        var position = new THREE.Vector3(0, 0, 0);

        // get euler rotation and convert it to Quaternion
        var quaternion = new THREE.Quaternion();
        var euler = new THREE.Euler(0, 0, 0, 'XYZ');
        quaternion.setFromEuler(euler);

        inertialPose = {
          'position': position,
          'orientation': quaternion
        };

        if (userdatapose !== undefined)
        {
          this.setPose(COMVisual, userdatapose.position,
            userdatapose.orientation);
            inertialPose = userdatapose;
        }

        COMVisual.crossLines = [];

        // Store link's original rotation (w.r.t. the model)
        var originalRotation = new THREE.Euler();
        originalRotation.copy(child.rotation);

        // Align link with world (reverse parent rotation w.r.t. the world)
        child.setRotationFromMatrix(
          new THREE.Matrix4().getInverse(child.parent.matrixWorld));

        // Get its bounding box
        box = new THREE.Box3();

        box.setFromObject(child);

        // Rotate link back to its original rotation
        child.setRotationFromEuler(originalRotation);

        // w.r.t child
        var worldToLocal = new THREE.Matrix4();
        worldToLocal.getInverse(child.matrixWorld);
        box.applyMatrix4(worldToLocal);

        // X
        points[0] = new THREE.Vector3(box.min.x, inertialPose.position.y,
          inertialPose.position.z);
        points[1] = new THREE.Vector3(box.max.x, inertialPose.position.y,
            inertialPose.position.z);
        // Y
        points[2] = new THREE.Vector3(inertialPose.position.x, box.min.y,
              inertialPose.position.z);
        points[3] = new THREE.Vector3(inertialPose.position.x, box.max.y,
                inertialPose.position.z);
        // Z
        points[4] = new THREE.Vector3(inertialPose.position.x,
          inertialPose.position.y, box.min.z);
        points[5] = new THREE.Vector3(inertialPose.position.x,
          inertialPose.position.y, box.max.z);

        helperGeometry_1 = new THREE.Geometry();
        helperGeometry_1.vertices.push(points[0]);
        helperGeometry_1.vertices.push(points[1]);

        helperGeometry_2 = new THREE.Geometry();
        helperGeometry_2.vertices.push(points[2]);
        helperGeometry_2.vertices.push(points[3]);

        helperGeometry_3 = new THREE.Geometry();
        helperGeometry_3.vertices.push(points[4]);
        helperGeometry_3.vertices.push(points[5]);

        helperMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});

        line_1 = new THREE.Line(helperGeometry_1, helperMaterial,
            THREE.LineSegments);
        line_2 = new THREE.Line(helperGeometry_2, helperMaterial,
            THREE.LineSegments);
        line_3 = new THREE.Line(helperGeometry_3, helperMaterial,
            THREE.LineSegments);

        line_1.name = 'COM_VISUAL';
        line_2.name = 'COM_VISUAL';
        line_3.name = 'COM_VISUAL';
        COMVisual.crossLines.push(line_1);
        COMVisual.crossLines.push(line_2);
        COMVisual.crossLines.push(line_3);

        // show lines
        child.add(line_1);
        child.add(line_2);
        child.add(line_3);
       }
    }
  }
};

// TODO: Issue https://bitbucket.org/osrf/gzweb/issues/138
/**
 * View inertia
 * Toggle: if there are inertia visuals, hide, otherwise, show.
 * @param {} model
 */
GZ3D.Scene.prototype.viewInertia = function(model)
{
  if (model === undefined || model === null)
  {
    return;
  }

  if (model.children.length === 0)
  {
    return;
  }

  var child;

  // Visuals already exist
  if (model.inertiaVisuals)
  {
    // Hide = remove from parent
    if (model.inertiaVisuals[0].parent !== undefined &&
      model.inertiaVisuals[0].parent !== null)
    {
      for (var v = 0; v < model.inertiaVisuals.length; ++v)
      {
        for (var k = 0; k < 3; k++)
        {
          model.inertiaVisuals[v].parent.remove(
            model.inertiaVisuals[v].crossLines[k]);
        }
        model.inertiaVisuals[v].parent.remove(model.inertiaVisuals[v]);
      }
    }
    // Show: attach to parent
    else
    {
      for (var s = 0; s < model.children.length; ++s)
      {
        child = model.getObjectByName(model.children[s].name);

        if (!child || child.name === 'boundingBox')
        {
          continue;
        }
        child.add(model.inertiaVisuals[s].crossLines[0]);
        child.add(model.inertiaVisuals[s].crossLines[1]);
        child.add(model.inertiaVisuals[s].crossLines[2]);
        child.add(model.inertiaVisuals[s]);
      }
    }
  }
  // Create visuals
  else
  {
    model.inertiaVisuals = [];
    var box , line_1, line_2, line_3, helperGeometry_1, helperGeometry_2,
    helperGeometry_3, helperMaterial, inertial, inertiabox,
    points = new Array(6);
    for (var j = 0; j < model.children.length; ++j)
    {
      child = model.getObjectByName(model.children[j].name);

      if (!child)
      {
        continue;
      }

      inertial = child.userData.inertial;
      if (inertial)
      {
        var mesh, boxScale, Ixx, Iyy, Izz, mass, inertia, material,
          inertialPose = {};

        if (inertial.pose)
        {
          inertialPose = child.userData.inertial.pose;
        }
        else if (child.position)
        {
          inertialPose.position = child.position;
          inertialPose.orientation = child.quaternion;
        }
        else
        {
          console.log('Link pose not found!');
          continue;
        }

        mass = inertial.mass;
        inertia = inertial.inertia;
        Ixx = inertia.ixx;
        Iyy = inertia.iyy;
        Izz = inertia.izz;
        boxScale = new THREE.Vector3();

        if (mass < 0 || Ixx < 0 || Iyy < 0 || Izz < 0 ||
          Ixx + Iyy < Izz || Iyy + Izz < Ixx || Izz + Ixx < Iyy)
        {
          // Unrealistic inertia, load with default scale
          console.log('The link ' + child.name + ' has unrealistic inertia, '
                +'unable to visualize box of equivalent inertia.');
        }
        else
        {
          // Compute dimensions of box with uniform density
          // and equivalent inertia.
          boxScale.x = Math.sqrt(6*(Izz +  Iyy - Ixx) / mass);
          boxScale.y = Math.sqrt(6*(Izz +  Ixx - Iyy) / mass);
          boxScale.z = Math.sqrt(6*(Ixx  + Iyy - Izz) / mass);

          inertiabox = new THREE.Object3D();
          inertiabox.name = 'INERTIA_VISUAL';

          // Inertia indicator: equivalent box of uniform density
          mesh = this.createBox(1, 1, 1);
          mesh.name = 'INERTIA_VISUAL';
          material = {'ambient':[1,0.0,1,1],'diffuse':[1,0.0,1,1],
            'depth_write':false,'opacity':0.5};
          this.setMaterial(mesh, material);
          inertiabox.add(mesh);
          inertiabox.name = 'INERTIA_VISUAL';
          child.add(inertiabox);

          model.inertiaVisuals.push(inertiabox);
          inertiabox.scale.set(boxScale.x, boxScale.y, boxScale.z);
          inertiabox.crossLines = [];

          this.setPose(inertiabox, inertialPose.position,
            inertialPose.orientation);
          // show lines
          box = new THREE.Box3();
          // w.r.t. world
          box.setFromObject(child);
          points[0] = new THREE.Vector3(inertialPose.position.x,
            inertialPose.position.y,
            -2 * boxScale.z + inertialPose.position.z);
          points[1] = new THREE.Vector3(inertialPose.position.x,
            inertialPose.position.y, 2 * boxScale.z + inertialPose.position.z);
          points[2] = new THREE.Vector3(inertialPose.position.x,
            -2 * boxScale.y + inertialPose.position.y ,
            inertialPose.position.z);
          points[3] = new THREE.Vector3(inertialPose.position.x,
            2 * boxScale.y + inertialPose.position.y, inertialPose.position.z);
          points[4] = new THREE.Vector3(
            -2 * boxScale.x + inertialPose.position.x,
            inertialPose.position.y, inertialPose.position.z);
          points[5] = new THREE.Vector3(
            2 * boxScale.x + inertialPose.position.x,
            inertialPose.position.y, inertialPose.position.z);

          helperGeometry_1 = new THREE.Geometry();
          helperGeometry_1.vertices.push(points[0]);
          helperGeometry_1.vertices.push(points[1]);

          helperGeometry_2 = new THREE.Geometry();
          helperGeometry_2.vertices.push(points[2]);
          helperGeometry_2.vertices.push(points[3]);

          helperGeometry_3 = new THREE.Geometry();
          helperGeometry_3.vertices.push(points[4]);
          helperGeometry_3.vertices.push(points[5]);

          helperMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
          line_1 = new THREE.Line(helperGeometry_1, helperMaterial,
              THREE.LineSegments);
          line_2 = new THREE.Line(helperGeometry_2, helperMaterial,
            THREE.LineSegments);
          line_3 = new THREE.Line(helperGeometry_3, helperMaterial,
            THREE.LineSegments);

          line_1.name = 'INERTIA_VISUAL';
          line_2.name = 'INERTIA_VISUAL';
          line_3.name = 'INERTIA_VISUAL';
          inertiabox.crossLines.push(line_1);
          inertiabox.crossLines.push(line_2);
          inertiabox.crossLines.push(line_3);

          // attach lines
          child.add(line_1);
          child.add(line_2);
          child.add(line_3);
        }
      }
    }
  }
};

/**
 * Update a light entity from a message
 * @param {} entity
 * @param {} msg
 */
GZ3D.Scene.prototype.updateLight = function(entity, msg)
{
  // TODO: Generalize this and createLight
  var lightObj = entity.children[0];
  var dir;

  var color = new THREE.Color();

  if (msg.diffuse)
  {
    color.r = msg.diffuse.r;
    color.g = msg.diffuse.g;
    color.b = msg.diffuse.b;
    lightObj.color = color.clone();
  }
  if (msg.specular)
  {
    color.r = msg.specular.r;
    color.g = msg.specular.g;
    color.b = msg.specular.b;
    entity.serverProperties.specular = color.clone();
  }

  var matrixWorld;
  if (msg.pose)
  {
    // needed to update light's direction
    this.setPose(entity, msg.pose.position, msg.pose.orientation);
    entity.matrixWorldNeedsUpdate = true;
  }

  if (msg.range)
  {
    // THREE.js's light distance impacts the attenuation factor defined in the
    // shader:
    // attenuation factor = 1.0 - distance-to-enlighted-point / light.distance
    // Gazebo's range (taken from OGRE 3D API) does not contribute to
    // attenuation; it is a hard limit for light scope.
    // Nevertheless, we identify them for sake of simplicity.
    lightObj.distance = msg.range;
  }

  if (msg.cast_shadows)
  {
    lightObj.castShadow = msg.cast_shadows;
  }

  if (msg.attenuation_constant)
  {
    entity.serverProperties.attenuation_constant = msg.attenuation_constant;
  }
  if (msg.attenuation_linear)
  {
    entity.serverProperties.attenuation_linear = msg.attenuation_linear;
    lightObj.intensity = lightObj.intensity/(1+msg.attenuation_linear);
  }
  if (msg.attenuation_quadratic)
  {
    entity.serverProperties.attenuation_quadratic = msg.attenuation_quadratic;
    lightObj.intensity = lightObj.intensity/(1+msg.attenuation_quadratic);
  }

//  Not handling these on gzweb for now
//
//  if (lightObj instanceof THREE.SpotLight) {
//    if (msg.spot_outer_angle) {
//      lightObj.angle = msg.spot_outer_angle;
//    }
//    if (msg.spot_falloff) {
//      lightObj.exponent = msg.spot_falloff;
//    }
//  }

  if (msg.direction)
  {
    dir = new THREE.Vector3(msg.direction.x, msg.direction.y,
        msg.direction.z);

    entity.direction = new THREE.Vector3();
    entity.direction.copy(dir);

    if (lightObj.target)
    {
      lightObj.target.position.copy(dir);
    }
  }
};

/**
 * Adds an sdf model to the scene.
 * @param {object} sdf - It is either SDF XML string or SDF XML DOM object
 * @returns {THREE.Object3D}
 */
GZ3D.Scene.prototype.createFromSdf = function(sdf)
{
  if (sdf === undefined)
  {
    console.log(' No argument provided ');
    return;
  }

  var obj = new THREE.Object3D();

  var sdfXml = this.spawnModel.sdfParser.parseXML(sdf);
  // sdfXML is always undefined, the XML parser doesn't work while testing
  // while it does work during normal usage.
  var myjson = xml2json(sdfXml, '\t');
  var sdfObj = JSON.parse(myjson).sdf;

  var mesh = this.spawnModel.sdfParser.spawnFromSDF(sdf);
  obj.name = mesh.name;
  obj.add(mesh);

  return obj;
};

/**
 * SDF parser constructor initializes SDF parser with the given parameters
 * and defines a DOM parser function to parse SDF XML files
 * @param {object} scene - the gz3d scene object
 * @param {object} gui - the gz3d gui object
 * @param {object} gziface [optional] - the gz3d gziface object, if not gziface
 * object was provided, sdfParser wont try to connect to gzserver.
 **/
GZ3D.SdfParser = function(scene, gui, gziface)
{
  this.emitter = globalEmitter || new EventEmitter2({verboseMemoryLeak: true});

  // set the sdf version
  this.SDF_VERSION = 1.5;
  this.MATERIAL_ROOT = 'assets';
  // true for using URLs to load files.
  // false for using the files loaded in the memory.
  this.usingFilesUrls = false;

  // set the xml parser function
  this.parseXML = function(xmlStr) {
    return (new window.DOMParser()).parseFromString(xmlStr, 'text/xml');
  };

  this.scene = scene;
  this.scene.setSDFParser(this);
  this.gui = gui;
  this.gziface = gziface;
  this.init();

  // cache materials if more than one model needs them
  this.materials = [];
  this.entityMaterial = {};
  // store meshes when loading meshes from memory.
  this.meshes = {};
  this.mtls = {};
  this.textures = {};
};

/**
 * Initializes SDF parser by connecting relevant events from gziface,
 * if gziface was not provided, just initialize the scene and don't listen
 * on gziface events.
 */
GZ3D.SdfParser.prototype.init = function()
{
  if (this.gziface)
  {
    this.usingFilesUrls = true;
    var that = this;
    this.emitter.on('connectionError', function() {
      // init scene and show popup only for the first connection error
      this.emitter.emit('notification_popup',
              'GzWeb is currently running' +
              'without a server, and materials could not be loaded.' +
              'When connected scene will be reinitialized', 5000);
      that.onConnectionError();
    });

    this.emitter.on('material', function(mat) {
      that.materials = mat;
    });

    this.emitter.on('gzstatus', function(gzstatus) {
      if (gzstatus === 'error')
      {
        this.emitter.emit('notification_popup', 'GzWeb is currently ' +
                'running without a GzServer,'
                + 'and Scene is reinitialized.', 5000);
        that.onConnectionError();
      }
    });
  }
  else
  {
    this.scene.initScene();
  }
};

/**
 * Event callback function for gziface connection error which occurs
 * when gziface cannot connect to gzbridge websocket
 * this is due to 2 reasons:
 * 1 - gzbridge websocket might not be run yet
 * 2 - gzbridge websocket is trying to connect to
 *       gzserver which is not running currenly
 */
GZ3D.SdfParser.prototype.onConnectionError = function()
{
  this.scene.initScene();

  var that = this;
  var entityCreated = function(model, type)
  {
    if (!that.gziface.isConnected)
    {
      that.addModelByType(model, type);
    }
  };
  this.emitter.on('entityCreated', entityCreated);

  var deleteEntity = function(entity)
  {
    var name = entity.name;
    var obj = that.scene.getByName(name);
    if (obj !== undefined)
    {
      if (obj.children[0] instanceof THREE.Light)
      {
        that.emitter.emit('setLightStats', {name: name}, 'delete');
      }
      else
      {
        that.gui.setModelStats({name: name}, 'delete');
      }
      that.scene.remove(obj);
    }
  };
  this.emitter.on('deleteEntity', deleteEntity);
};

/**
 * Parses string which denotes the color
 * @param {string} colorStr - string which denotes the color where every value
 * should be separated with single white space
 * @returns {object} color - color object having r,g,b and alpha values
 */
GZ3D.SdfParser.prototype.parseColor = function(colorStr)
{
  var color = {};
  var values = colorStr.split(/\s+/);

  color.r = parseFloat(values[0]);
  color.g = parseFloat(values[1]);
  color.b = parseFloat(values[2]);
  color.a = parseFloat(values[3]);

  return color;
};

/**
 * Parses string which is a 3D vector
 * @param {string} vectorStr - string which denotes the vector where every value
 * should be separated with single white space
 * @returns {object} vector3D - vector having x, y, z values
 */
GZ3D.SdfParser.prototype.parse3DVector = function(vectorStr)
{
  var vector3D = {};
  var values = vectorStr.split(/\s+/);
  vector3D.x = parseFloat(values[0]);
  vector3D.y = parseFloat(values[1]);
  vector3D.z = parseFloat(values[2]);
  return vector3D;
};

/**
 * Creates THREE light object according to properties of sdf object
 * which is parsed from sdf model of the light
 * @param {object} sdfObj - object which is parsed from the sdf string
 * @returns {THREE.Light} lightObj - THREE light object created
 * according to given properties. The type of light object is determined
 * according to light type
 */
GZ3D.SdfParser.prototype.spawnLightFromSDF = function(sdfObj)
{
  var light = sdfObj.light;
  var lightObj;
  var color = new THREE.Color();
  var diffuseColor = this.parseColor(light.diffuse);
  color.r = diffuseColor.r;
  color.g = diffuseColor.g;
  color.b = diffuseColor.b;

  if (light['@type'] === 'point')
  {
    lightObj = new THREE.AmbientLight(color.getHex());
    lightObj.distance = light.range;
    this.scene.setPose(lightObj, light.pose.position, light.pose.orientation);
  }
  if (light['@type'] === 'spot')
  {
    lightObj = new THREE.SpotLight(color.getHex());
    lightObj.distance = light.range;
    this.scene.setPose(lightObj, light.pose.position, light.pose.orientation);
  }
  else if (light['@type'] === 'directional')
  {
    lightObj = new THREE.DirectionalLight(color.getHex());

    var direction = this.parse3DVector(light.direction);
    var dir = new THREE.Vector3(direction.x, direction.y, direction.z);
    var target = dir;
    var negDir = dir.negate();
    negDir.normalize();
    var factor = 10;
    var pose = this.parsePose(light.pose);
    pose.position.x += factor * negDir.x;
    pose.position.y += factor * negDir.y;
    pose.position.z += factor * negDir.z;

    target.x -= pose.position.x;
    target.y -= pose.position.y;
    target.z -= pose.position.z;

    lightObj.target.position = target;
    lightObj.shadow.camera.near = 1;
    lightObj.shadow.camera.far = 50;
    lightObj.shadow.mapSize.width = 4094;
    lightObj.shadow.mapSize.height = 4094;
    lightObj.shadow.camera.bottom = -100;
    lightObj.shadow.camera.left = -100;
    lightObj.shadow.camera.right = 100;
    lightObj.shadow.cameraTop = 100;
    lightObj.shadow.bias = 0.0001;

    lightObj.position.set(negDir.x, negDir.y, negDir.z);
    this.scene.setPose(lightObj, pose.position, pose.orientation);
  }
  lightObj.intensity = parseFloat(light.attenuation.constant);
  lightObj.castShadow = this.parseBool(light.cast_shadows);
  lightObj.name = light['@name'];

  return lightObj;
};

/**
 * Parses a string which is a 3D vector
 * @param {string} poseStr - string which denotes the pose of the object
 * where every value should be separated with single white space and
 * first three denotes x,y,z and values of the pose,
 * and following three denotes euler rotation around x,y,z
 * @returns {object} pose - pose object having position (x,y,z)(THREE.Vector3)
 * and orientation (THREE.Quaternion) properties
 */
GZ3D.SdfParser.prototype.parsePose = function(poseStr)
{
  var values = poseStr.split(/\s+/);

  var position = new THREE.Vector3(parseFloat(values[0]),
          parseFloat(values[1]), parseFloat(values[2]));

  // get euler rotation and convert it to Quaternion
  var quaternion = new THREE.Quaternion();
  var euler = new THREE.Euler(parseFloat(values[3]), parseFloat(values[4]),
          parseFloat(values[5]), 'ZYX');
  quaternion.setFromEuler(euler);

  var pose = {
    'position': position,
    'orientation': quaternion
  };

  return pose;
};

/**
 * Parses a string which is a 3D vector
 * @param {string} scaleStr - string which denotes scaling in x,y,z
 * where every value should be separated with single white space
 * @returns {THREE.Vector3} scale - THREE Vector3 object
 * which denotes scaling of an object in x,y,z
 */
GZ3D.SdfParser.prototype.parseScale = function(scaleStr)
{
  var values = scaleStr.split(/\s+/);
  var scale = new THREE.Vector3(parseFloat(values[0]), parseFloat(values[1]),
          parseFloat(values[2]));
  return scale;
};

/**
 * Parses a string which is a boolean
 * @param {string} boolStr - string which denotes a boolean value
 * where the values can be true, false, 1, or 0.
 * @returns {bool} bool - bool value
 */
GZ3D.SdfParser.prototype.parseBool = function(boolStr)
{
  return JSON.parse(boolStr);
};

/**
 * Parses SDF material element which is going to be used by THREE library
 * It matches material scripts with the material objects which are
 * already parsed by gzbridge and saved by SDFParser
 * @param {object} material - SDF material object
 * @returns {object} material - material object which has the followings:
 * texture, normalMap, ambient, diffuse, specular, opacity
 */
GZ3D.SdfParser.prototype.createMaterial = function(material)
{
  var textureUri, texture, mat;
  var ambient, diffuse, specular, opacity, normalMap, scale;

  if (!material) { return null; }

  var script = material.script;
  if (script)
  {
    // if there is just one uri convert it to array
    if (!script.uri)
    {
      script.uri = ['file://media/materials/scripts/gazebo.material'];
    }

    if (!(script.uri instanceof Array))
    {
      script.uri = [script.uri];
    }

    if (script.name)
    {
      mat = this.materials[script.name];
      // if we already cached the materials
      if (mat)
      {
        ambient = mat.ambient;
        diffuse = mat.diffuse;
        specular = mat.specular;
        opacity = mat.opacity;
        scale = mat.scale;

        if (mat.texture)
        {
          for (var i = 0; i < script.uri.length; ++i)
          {
            var uriType = script.uri[i].substring(0, script.uri[i]
                    .indexOf('://'));
            if (uriType === 'model')
            {
              // if texture uri
              if (script.uri[i].indexOf('textures') > 0)
              {
                textureUri = script.uri[i].substring(script.uri[i]
                        .indexOf('://') + 3);
                break;
              }
            }
            else if (uriType === 'file')
            {
              if (script.uri[i].indexOf('materials') > 0)
              {
                textureUri = script.uri[i].substring(script.uri[i]
                        .indexOf('://') + 3, script.uri[i]
                        .indexOf('materials') + 9)
                        + '/textures';
                break;
              }
            }
          }
          // Map texture name to the corresponding texture.
          if (!this.usingFilesUrls)
          {
            texture = this.textures[mat.texture];
          }
          else
          {
            texture = this.MATERIAL_ROOT + '/' + textureUri + '/' + mat.texture;
          }
        }
      }
      else
      {
        //TODO: how to handle if material is not cached
        console.log(script.name + ' is not cached!!!');
      }
    }
  }

  // normal map
  if (material.normal_map)
  {
    var mapUri;
    if (material.normal_map.indexOf('://') > 0)
    {
      mapUri = material.normal_map.substring(
              material.normal_map.indexOf('://') + 3, material.normal_map
                      .lastIndexOf('/'));
    }
    else
    {
      mapUri = textureUri;
    }
    if (mapUri)
    {
      var startIndex = material.normal_map.lastIndexOf('/') + 1;
      if (startIndex < 0)
      {
        startIndex = 0;
      }
      var normalMapName = material.normal_map.substr(startIndex,
        material.normal_map.lastIndexOf('.') - startIndex);
      // Map texture name to the corresponding texture.
      if (!this.usingFilesUrls)
      {
        normalMap = this.textures[normalMapName + '.png'];
      }
      else
      {
        normalMap = this.MATERIAL_ROOT + '/' + mapUri + '/' +
          normalMapName + '.png';
      }

    }
  }

  return {
    texture: texture,
    normalMap: normalMap,
    ambient: ambient,
    diffuse: diffuse,
    specular: specular,
    opacity: opacity,
    scale: scale
  };

};

/**
 * Parses a string which is a size of an object
 * @param {string} sizeStr - string which denotes size in x,y,z
 * where every value should be separated with single white space
 * @returns {object} size - size object which denotes
 * size of an object in x,y,z
 */
GZ3D.SdfParser.prototype.parseSize = function(sizeStr)
{
  var sizeObj;
  var values = sizeStr.split(/\s+/);
  var x = parseFloat(values[0]);
  var y = parseFloat(values[1]);
  var z = parseFloat(values[2]);
  sizeObj = {
    'x': x,
    'y': y,
    'z': z
  };

  return sizeObj;
};

/**
 * Parses SDF geometry element and creates corresponding mesh,
 * when it creates the THREE.Mesh object it directly add it to the parent
 * object.
 * @param {object} geom - SDF geometry object which determines the geometry
 *  of the object and can have following properties: box, cylinder, sphere,
 *   plane, mesh
 * @param {object} mat - SDF material object which is going to be parsed
 * by createMaterial function
 * @param {object} parent - parent 3D object
 */
GZ3D.SdfParser.prototype.createGeom = function(geom, mat, parent)
{
  var that = this;
  var obj;
  var size, normal;

  var material = this.createMaterial(mat);

  if (geom.box)
  {
    size = this.parseSize(geom.box.size);
    obj = this.scene.createBox(size.x, size.y, size.z);
  }
  else if (geom.cylinder)
  {
    obj = this.scene.createCylinder(geom.cylinder.radius, geom.cylinder.length);
  }
  else if (geom.sphere)
  {
    obj = this.scene.createSphere(geom.sphere.radius);
  }
  else if (geom.plane)
  {
    normal = this.parseSize(geom.plane.normal);
    size = this.parseSize(geom.plane.size);
    obj = this.scene.createPlane(normal.x, normal.y, normal.z, size.x, size.y);
  }
  else if (geom.mesh)
  {
    var meshUri = geom.mesh.uri;
    var submesh;
    var centerSubmesh;


    if (geom.mesh.submesh)
    {
      submesh = geom.mesh.submesh.name;
      centerSubmesh = this.parseBool(geom.mesh.submesh.center);
    }

    var uriType = meshUri.substring(0, meshUri.indexOf('://'));
    if (uriType === 'file' || uriType === 'model')
    {
      var modelName = meshUri.substring(meshUri.indexOf('://') + 3);
      if (geom.mesh.scale)
      {
        var scale = this.parseScale(geom.mesh.scale);
        parent.scale.x = scale.x;
        parent.scale.y = scale.y;
        parent.scale.z = scale.z;
      }

      var modelUri = this.MATERIAL_ROOT + '/' + modelName;
      var ext = modelUri.substr(-4).toLowerCase();
      var materialName = parent.name + '::' + modelUri;
      this.entityMaterial[materialName] = material;

      if (!this.usingFilesUrls)
      {
        var meshFileName = meshUri.substring(meshUri.lastIndexOf('/') + 1);
        var meshFile = this.meshes[meshFileName];
        if (ext === '.obj')
        {
          var mtlFile = this.mtls[meshFileName.split('.')[0]+'.mtl'];
          that.scene.loadMeshFromString(modelUri, submesh,centerSubmesh,
            function(obj)
            {
              parent.add(obj);
              loadGeom(parent);
            }, [meshFile, mtlFile]);
        }
        else if (ext === '.dae')
        {
          that.scene.loadMeshFromString(modelUri, submesh, centerSubmesh,
            function(dae)
            {
              if (material)
              {
                var allChildren = [];
                dae.getDescendants(allChildren);
                for (var c = 0; c < allChildren.length; ++c)
                {
                  if (allChildren[c] instanceof THREE.Mesh)
                  {
                    that.scene.setMaterial(allChildren[c], material);
                    break;
                  }
                }
              }
              parent.add(dae);
              loadGeom(parent);
            }, [meshFile]);
        }
      }
      else
      {
        that.scene.loadMeshFromUri(modelUri, submesh, centerSubmesh,
          function (mesh)
          {
            if (material)
            {
              // Because the stl mesh doesn't have any children we cannot set
              // the materials like other mesh types.
              if (ext !== '.stl')
              {
                var allChildren = [];
                mesh.getDescendants(allChildren);
                for (var c = 0; c < allChildren.length; ++c)
                {
                  if (allChildren[c] instanceof THREE.Mesh)
                  {
                    that.scene.setMaterial(allChildren[c], material);
                    break;
                  }
                }
              }
              else
              {
                that.scene.setMaterial(mesh, material);
              }
            }
            else
            {
              if (ext === '.stl')
              {
                that.scene.setMaterial(mesh, {'ambient': [1,1,1,1]});
              }
            }
          parent.add(mesh);
          loadGeom(parent);
        });
      }
    }
  }
  //TODO: how to handle height map without connecting to the server
  //  else if (geom.heightmap)
  //  {
  //    var request = new ROSLIB.ServiceRequest({
  //      name : that.scene.name
  //    });
  //
  //    // redirect the texture paths to the assets dir
  //    var textures = geom.heightmap.texture;
  //    for ( var k = 0; k < textures.length; ++k)
  //    {
  //      textures[k].diffuse = this.parseUri(textures[k].diffuse);
  //      textures[k].normal = this.parseUri(textures[k].normal);
  //    }
  //
  //    var sizes = geom.heightmap.size;
  //
  //    // send service request and load heightmap on response
  //    this.heightmapDataService.callService(request,
  //        function(result)
  //        {
  //          var heightmap = result.heightmap;
  //          // gazebo heightmap is always square shaped,
  //          // and a dimension of: 2^N + 1
  //          that.scene.loadHeightmap(heightmap.heights, heightmap.size.x,
  //              heightmap.size.y, heightmap.width, heightmap.height,
  //              heightmap.origin, textures,
  //              geom.heightmap.blend, parent);
  //            //console.log('Result for service call on ' + result);
  //        });
  //
  //    //this.scene.loadHeightmap(parent)
  //  }

  if (obj)
  {
    if (material)
    {
      // texture mapping for simple shapes and planes only,
      // not used by mesh and terrain
      this.scene.setMaterial(obj, material);
    }
    obj.updateMatrix();
    parent.add(obj);
    loadGeom(parent);
  }

  function loadGeom(visualObj)
  {
    var allChildren = [];
    visualObj.getDescendants(allChildren);
    for (var c = 0; c < allChildren.length; ++c)
    {
      if (allChildren[c] instanceof THREE.Mesh)
      {
        allChildren[c].castShadow = true;
        allChildren[c].receiveShadow = true;

        if (visualObj.castShadows)
        {
          allChildren[c].castShadow = visualObj.castShadows;
        }
        if (visualObj.receiveShadows)
        {
          allChildren[c].receiveShadow = visualObj.receiveShadows;
        }

        if (visualObj.name.indexOf('COLLISION_VISUAL') >= 0)
        {
          allChildren[c].castShadow = false;
          allChildren[c].receiveShadow = false;

          allChildren[c].visible = this.scene.showCollisions;
        }
        break;
      }
    }
  }
};

/**
 * Parses SDF visual element and creates THREE 3D object by parsing
 * geometry element using createGeom function
 * @param {object} visual - SDF visual element
 * @returns {THREE.Object3D} visualObj - 3D object which is created
 * according to SDF visual element.
 */
GZ3D.SdfParser.prototype.createVisual = function(visual)
{
  //TODO: handle these node values
  // cast_shadow, receive_shadows
  if (visual.geometry)
  {
    var visualObj = new THREE.Object3D();
    visualObj.name = visual['@name'];

    if (visual.pose)
    {
      var visualPose = this.parsePose(visual.pose);
      this.scene
        .setPose(visualObj, visualPose.position, visualPose.orientation);
    }

    this.createGeom(visual.geometry, visual.material, visualObj);

    return visualObj;
  }

  return null;

};

/**
 * Parses SDF XML string or SDF XML DOM object
 * @param {object} sdf - It is either SDF XML string or SDF XML DOM object
 * @returns {THREE.Object3D} object - 3D object which is created from the
 * given SDF.
 */
GZ3D.SdfParser.prototype.spawnFromSDF = function(sdf)
{
  //parse sdfXML
  var sdfXML;
  if ((typeof sdf) === 'string')
  {
    sdfXML = this.parseXML(sdf);
  }
  else
  {
    sdfXML = sdf;
  }

  //convert SDF XML to Json string and parse JSON string to object
  //TODO: we need better xml 2 json object convertor
  var myjson = xml2json(sdfXML, '\t');
  var sdfObj = JSON.parse(myjson).sdf;
  // it is easier to manipulate json object

  if (sdfObj.model)
  {
    return this.spawnModelFromSDF(sdfObj);
  }
  else if (sdfObj.light)
  {
    return this.spawnLightFromSDF(sdfObj);
  }
};

/**
 * Loads SDF file according to given model name
 * @param {string} modelName - name of the model
 * @returns {THREE.Object3D} modelObject - 3D object which is created
 * according to SDF model.
 */
GZ3D.SdfParser.prototype.loadSDF = function(modelName)
{
  var sdf = this.loadModel(modelName);
  return this.spawnFromSDF(sdf);
};

/**
 * Creates 3D object from parsed model SDF
 * @param {object} sdfObj - parsed SDF object
 * @returns {THREE.Object3D} modelObject - 3D object which is created
 * according to SDF model object.
 */
GZ3D.SdfParser.prototype.spawnModelFromSDF = function(sdfObj)
{
  // create the model
  var modelObj = new THREE.Object3D();
  modelObj.name = sdfObj.model['@name'];
  //TODO: is that needed
  //modelObj.userData = sdfObj.model.@id;

  var pose;
  var i, j, k;
  var visualObj;
  var linkObj, linkPose;

  if (sdfObj.model.pose)
  {
    pose = this.parsePose(sdfObj.model.pose);
    this.scene.setPose(modelObj, pose.position, pose.orientation);
  }

  //convert link object to link array
  if (!(sdfObj.model.link instanceof Array))
  {
    sdfObj.model.link = [sdfObj.model.link];
  }

  for (i = 0; i < sdfObj.model.link.length; ++i)
  {
    linkObj = this.createLink(sdfObj.model.link[i]);
    modelObj.add(linkObj);
  }

  //  this.scene.add(modelObj);
  return modelObj;

};

/**
 * Creates a link 3D object of the model. A model consists of links
 * these links are 3D objects. The function creates only visual elements
 * of the link by createLink function
 * @param {object} link - parsed SDF link object
 * @returns {THREE.Object3D} linkObject - 3D link object
 */
GZ3D.SdfParser.prototype.createLink = function(link)
{
  var linkPose, visualObj;
  var linkObj = new THREE.Object3D();
  linkObj.name = link['@name'];

  if (link.inertial)
  {
    var inertialPose, inertialMass, inertia = {};
    linkObj.userData.inertial = {};
    inertialPose = link.inertial.pose;
    inertialMass = link.inertial.mass;
    inertia.ixx = link.inertial.ixx;
    inertia.ixy = link.inertial.ixy;
    inertia.ixz = link.inertial.ixz;
    inertia.iyy = link.inertial.iyy;
    inertia.iyz = link.inertial.iyz;
    inertia.izz = link.inertial.izz;
    linkObj.userData.inertial.inertia = inertia;
    if (inertialMass)
    {
      linkObj.userData.inertial.mass = inertialMass;
    }
    if (inertialPose)
    {
      linkObj.userData.inertial.pose = inertialPose;
    }
  }

  if (link.pose)
  {
    linkPose = this.parsePose(link.pose);
    this.scene.setPose(linkObj, linkPose.position, linkPose.orientation);
  }

  if (link.visual)
  {
    if (!(link.visual instanceof Array))
    {
      link.visual = [link.visual];
    }

    for (var i = 0; i < link.visual.length; ++i)
    {
      visualObj = this.createVisual(link.visual[i]);
      if (visualObj && !visualObj.parent)
      {
        linkObj.add(visualObj);
      }
    }
  }

  if (link.collision)
  {
    if (link.collision.visual)
    {
      if (!(link.collision.visual instanceof Array))
      {
        link.collision.visual = [link.collision.visual];
      }

      for (var j = 0; j < link.collision.visual.length; ++j)
      {
        visualObj = this.createVisual(link.collision.visual[j]);
        if (visualObj && !visualObj.parent)
        {
          linkObj.add(visualObj);
        }
      }

    }
  }

  return linkObj;
};

/**
 * Creates 3D object according to model name and type of the model and add
 * the created object to the scene.
 * @param {THREE.Object3D} model - model object which will be added to scene
 * @param {string} type - type of the model which can be followings: box,
 * sphere, cylinder, spotlight, directionallight, pointlight
 */
GZ3D.SdfParser.prototype.addModelByType = function(model, type)
{
  var sdf, translation, euler;
  var quaternion = new THREE.Quaternion();
  var modelObj;

  if (model.matrixWorld)
  {
    var matrix = model.matrixWorld;
    translation = new THREE.Vector3();
    euler = new THREE.Euler();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, euler, scale);
    quaternion.setFromEuler(euler);
  }

  if (type === 'box')
  {
    sdf = this.createBoxSDF(translation, euler);
    modelObj = this.spawnFromSDF(sdf);
  }
  else if (type === 'sphere')
  {
    sdf = this.createSphereSDF(translation, euler);
    modelObj = this.spawnFromSDF(sdf);
  }
  else if (type === 'cylinder')
  {
    sdf = this.createCylinderSDF(translation, euler);
    modelObj = this.spawnFromSDF(sdf);
  }
  else if (type === 'spotlight')
  {
    modelObj = this.scene.createLight(2);
    this.scene.setPose(modelObj, translation, quaternion);
  }
  else if (type === 'directionallight')
  {
    modelObj = this.scene.createLight(3);
    this.scene.setPose(modelObj, translation, quaternion);
  }
  else if (type === 'pointlight')
  {
    modelObj = this.scene.createLight(1);
    this.scene.setPose(modelObj, translation, quaternion);
  }
  else
  {
    var sdfObj = this.loadSDF(type);
    modelObj = new THREE.Object3D();
    modelObj.add(sdfObj);
    modelObj.name = model.name;
    this.scene.setPose(modelObj, translation, quaternion);
  }

  var that = this;

  var addModelFunc;
  addModelFunc = function()
  {
    // check whether object is removed
    var obj = that.scene.getByName(modelObj.name);
    if (obj === undefined)
    {
      that.scene.add(modelObj);
      that.gui.setModelStats(modelObj, 'update');
    }
    else
    {
      setTimeout(addModelFunc, 100);
    }
  };

  setTimeout(addModelFunc , 100);

//  this.scene.add(modelObj);
//  this.gui.setModelStats(modelObj, 'update');
};

/**
 * Creates SDF string for simple shapes: box, cylinder, sphere.
 * @param {string} type - type of the model which can be followings: box,
 * sphere, cylinder
 * @param {THREE.Vector3} translation - denotes the x,y,z position
 * of the object
 * @param {THREE.Euler} euler - denotes the euler rotation of the object
 * @param {string} geomSDF - geometry element string of 3D object which is
 * already created according to type of the object
 * @returns {string} sdf - SDF string of the simple shape
 */
GZ3D.SdfParser.prototype.createSimpleShapeSDF = function(type, translation,
        euler, geomSDF)
  {
  var sdf;

  sdf = '<sdf version="' + this.SDF_VERSION + '">' + '<model name="' + type
          + '">' + '<pose>' + translation.x + ' ' + translation.y + ' '
          + translation.z + ' ' + euler.x + ' ' + euler.y + ' ' + euler.z
          + '</pose>' + '<link name="link">'
          + '<inertial><mass>1.0</mass></inertial>'
          + '<collision name="collision">' + '<geometry>' + geomSDF
          + '</geometry>' + '</collision>' + '<visual name="visual">'
          + '<geometry>' + geomSDF + '</geometry>' + '<material>' + '<script>'
          + '<uri>file://media/materials/scripts/gazebo.material' + '</uri>'
          + '<name>Gazebo/Grey</name>' + '</script>' + '</material>'
          + '</visual>' + '</link>' + '</model>' + '</sdf>';

  return sdf;
};

/**
 * Creates SDF string of box geometry element
 * @param {THREE.Vector3} translation - the x,y,z position of
 * the box object
 * @param {THREE.Euler} euler - the euler rotation of the box object
 * @returns {string} geomSDF - geometry SDF string of the box
 */
GZ3D.SdfParser.prototype.createBoxSDF = function(translation, euler)
{
  var geomSDF = '<box>' + '<size>1.0 1.0 1.0</size>' + '</box>';

  return this.createSimpleShapeSDF('box', translation, euler, geomSDF);
};

/**
 * Creates SDF string of sphere geometry element
 * @param {THREE.Vector3} translation - the x,y,z position of
 * the box object
 * @param {THREE.Euler} euler - the euler rotation of the box object
 * @returns {string} geomSDF - geometry SDF string of the sphere
 */
GZ3D.SdfParser.prototype.createSphereSDF = function(translation, euler)
{
  var geomSDF = '<sphere>' + '<radius>0.5</radius>' + '</sphere>';

  return this.createSimpleShapeSDF('sphere', translation, euler, geomSDF);
};

/**
 * Creates SDF string of cylinder geometry element
 * @param {THREE.Vector3} translation - the x,y,z position of
 * the box object
 * @param {THREE.Euler} euler - the euler rotation of the cylinder object
 * @returns {string} geomSDF - geometry SDF string of the cylinder
 */
GZ3D.SdfParser.prototype.createCylinderSDF = function(translation, euler)
{
  var geomSDF = '<cylinder>' + '<radius>0.5</radius>' + '<length>1.0</length>'
          + '</cylinder>';

  return this.createSimpleShapeSDF('cylinder', translation, euler, geomSDF);
};

/**
 * Loads SDF of the model. It first constructs the url of the model
 * according to modelname
 * @param {string} modelName - name of the model
 * @returns {XMLDocument} modelDOM - SDF DOM object of the loaded model
 */
GZ3D.SdfParser.prototype.loadModel = function(modelName)
{
  var modelFile = this.MATERIAL_ROOT + '/' + modelName + '/model.sdf';

  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/xml');
  xhttp.open('GET', modelFile, false);
  xhttp.send();
  return xhttp.responseXML;
};

/**
 * @constructor
 * Holds custom shaders in string format which can be passed to
 * THREE.ShaderMaterial's options.
 */
GZ3D.Shaders = function()
{
  this.init();
};

GZ3D.Shaders.prototype.init = function()
{
  // Custom vertex shader for heightmaps
  this.heightmapVS =
    'varying vec2 vUv;'+
    'varying vec3 vPosition;'+
    'varying vec3 vNormal;'+
    'void main( void ) {'+
    '  vUv = uv;'+
    '  vPosition = position;'+
    '  vNormal = -normal;'+
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);'+
    '}';

  // Custom fragment shader for heightmaps
  this.heightmapFS =
    'uniform sampler2D texture0;'+
    'uniform sampler2D texture1;'+
    'uniform sampler2D texture2;'+
    'uniform float repeat0;'+
    'uniform float repeat1;'+
    'uniform float repeat2;'+
    'uniform float minHeight1;'+
    'uniform float minHeight2;'+
    'uniform float fadeDist1;'+
    'uniform float fadeDist2;'+
    'uniform vec3 ambient;'+
    'uniform vec3 lightDiffuse;'+
    'uniform vec3 lightDir;'+
    'varying vec2 vUv;'+
    'varying vec3 vPosition;'+
    'varying vec3 vNormal;'+
    'float blend(float distance, float fadeDist) {'+
    '  float alpha = distance / fadeDist;'+
    '  if (alpha < 0.0) {'+
    '    alpha = 0.0;'+
    '  }'+
    '  if (alpha > 1.0) {'+
    '    alpha = 1.0;'+
    '  }'+
    '  return alpha;'+
    '}'+
    'void main()'+
    '{'+
    '  vec3 diffuse0 = texture2D( texture0, vUv*repeat0 ).rgb;'+
    '  vec3 diffuse1 = texture2D( texture1, vUv*repeat1 ).rgb;'+
    '  vec3 diffuse2 = texture2D( texture2, vUv*repeat2 ).rgb;'+
    '  vec3 fragcolor = diffuse0;'+
    '  if (fadeDist1 > 0.0)'+
    '  {'+
    '    fragcolor = mix('+
    '      fragcolor,'+
    '      diffuse1,'+
    '      blend(vPosition.z - minHeight1, fadeDist1)'+
    '    );'+
    '  }'+
    '  if (fadeDist2 > 0.0)'+
    '  {'+
    '    fragcolor = mix('+
    '      fragcolor,'+
    '      diffuse2,'+
    '      blend(vPosition.z - (minHeight1 + minHeight2), fadeDist2)'+
    '    );'+
    '  }'+
    '  vec3 lightDirNorm = normalize(lightDir);'+
    '  float intensity = max(dot(vNormal, lightDirNorm), 0.0);'+
    '  vec3 vLightFactor = ambient + lightDiffuse * intensity;'+
    '  gl_FragColor = vec4(fragcolor.rgb * vLightFactor, 1.0);'+
    '}';
};

/**
 * Spawn a model into the scene
 * @constructor
 */
GZ3D.SpawnModel = function(scene, domElement)
{
  this.scene = scene;
  this.domElement = ( domElement !== undefined ) ? domElement : document;
  this.init();
  this.obj = undefined;
  this.callback = undefined;
  this.sdfParser = undefined;

  // Material for simple shapes being spawned (grey transparent)
  this.spawnedShapeMaterial = new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  this.spawnedShapeMaterial.transparent = true;
  this.spawnedShapeMaterial.opacity = 0.5;
};

/**
 * Initialize SpawnModel
 */
GZ3D.SpawnModel.prototype.init = function()
{
  this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  this.ray = new THREE.Ray();
  this.obj = null;
  this.active = false;
  this.snapDist = null;
};

/**
 * Start spawning an entity. Only simple shapes supported so far.
 * Adds a temp object to the scene which is not registered on the server.
 * @param {string} entity
 * @param {function} callback
 */
GZ3D.SpawnModel.prototype.start = function(entity, callback)
{
  if (this.active)
  {
    this.finish();
  }

  this.callback = callback;

  this.obj = new THREE.Object3D();
  var mesh;
  if (entity === 'box')
  {
    mesh = this.scene.createBox(1, 1, 1);
    mesh.material = this.spawnedShapeMaterial;
  }
  else if (entity === 'sphere')
  {
    mesh = this.scene.createSphere(0.5);
    mesh.material = this.spawnedShapeMaterial;
  }
  else if (entity === 'cylinder')
  {
    mesh = this.scene.createCylinder(0.5, 1.0);
    mesh.material = this.spawnedShapeMaterial;
  }
  else if (entity === 'pointlight')
  {
    mesh = this.scene.createLight(1);
  }
  else if (entity === 'spotlight')
  {
    mesh = this.scene.createLight(2);
  }
  else if (entity === 'directionallight')
  {
    mesh = this.scene.createLight(3);
  }
  else
  {
    mesh = this.sdfParser.loadSDF(entity);
    //TODO: add transparency to the object
  }

  this.obj.name = this.generateUniqueName(entity);
  this.obj.add(mesh);

  // temp model appears within current view
  var pos = new THREE.Vector2(window.window.innerWidth/2, window.innerHeight/2);
  var intersect = new THREE.Vector3();
  this.scene.getRayCastModel(pos, intersect);

  this.obj.position.x = intersect.x;
  this.obj.position.y = intersect.y;
  this.obj.position.z += 0.5;
  this.scene.add(this.obj);
  // For the inserted light to have effect
  var allObjects = [];
  this.scene.scene.getDescendants(allObjects);
  for (var l = 0; l < allObjects.length; ++l)
  {
    if (allObjects[l].material)
    {
      allObjects[l].material.needsUpdate = true;
    }
  }

  var that = this;

  this.mouseDown = function(event) {that.onMouseDown(event);};
  this.mouseUp = function(event) {that.onMouseUp(event);};
  this.mouseMove = function(event) {that.onMouseMove(event);};
  this.keyDown = function(event) {that.onKeyDown(event);};
  this.touchMove = function(event) {that.onTouchMove(event,true);};
  this.touchEnd = function(event) {that.onTouchEnd(event);};

  this.domElement.addEventListener('mousedown', that.mouseDown, false);
  this.domElement.addEventListener( 'mouseup', that.mouseUp, false);
  this.domElement.addEventListener( 'mousemove', that.mouseMove, false);
  document.addEventListener( 'keydown', that.keyDown, false);

  this.domElement.addEventListener( 'touchmove', that.touchMove, false);
  this.domElement.addEventListener( 'touchend', that.touchEnd, false);

  this.active = true;

};

/**
 * Finish spawning an entity: re-enable camera controls,
 * remove listeners, remove temp object
 */
GZ3D.SpawnModel.prototype.finish = function()
{
  var that = this;

  this.domElement.removeEventListener( 'mousedown', that.mouseDown, false);
  this.domElement.removeEventListener( 'mouseup', that.mouseUp, false);
  this.domElement.removeEventListener( 'mousemove', that.mouseMove, false);
  document.removeEventListener( 'keydown', that.keyDown, false);

  this.scene.remove(this.obj);
  this.obj = undefined;
  this.active = false;
};

/**
 * Window event callback
 * @param {} event - not yet
 */
GZ3D.SpawnModel.prototype.onMouseDown = function(event)
{
  // Does this ever get called?
  // Change like this:
  // https://bitbucket.org/osrf/gzweb/pull-request/14
  event.preventDefault();
  event.stopImmediatePropagation();
};

/**
 * Window event callback
 * @param {} event - mousemove events
 */
GZ3D.SpawnModel.prototype.onMouseMove = function(event)
{
  if (!this.active)
  {
    return;
  }

  event.preventDefault();

  this.moveSpawnedModel(event.clientX,event.clientY);
};

/**
 * Window event callback
 * @param {} event - touchmove events
 */
GZ3D.SpawnModel.prototype.onTouchMove = function(event,originalEvent)
{
  if (!this.active)
  {
    return;
  }

  var e;

  if (originalEvent)
  {
    e = event;
  }
  else
  {
    e = event.originalEvent;
  }
  e.preventDefault();

  if (e.touches.length === 1)
  {
    this.moveSpawnedModel(e.touches[ 0 ].pageX,e.touches[ 0 ].pageY);
  }
};

/**
 * Window event callback
 * @param {} event - touchend events
 */
GZ3D.SpawnModel.prototype.onTouchEnd = function()
{
  if (!this.active)
  {
    return;
  }

  this.callback(this.obj);
  this.finish();
};

/**
 * Window event callback
 * @param {} event - mousedown events
 */
GZ3D.SpawnModel.prototype.onMouseUp = function(event)
{
  if (!this.active)
  {
    return;
  }

  this.callback(this.obj);
  this.finish();
};

/**
 * Window event callback
 * @param {} event - keydown events
 */
GZ3D.SpawnModel.prototype.onKeyDown = function(event)
{
  if ( event.keyCode === 27 ) // Esc
  {
    this.finish();
  }
};

/**
 * Move temp spawned model
 * @param {integer} positionX - Horizontal position on the canvas
 * @param {integer} positionY - Vertical position on the canvas
 */
GZ3D.SpawnModel.prototype.moveSpawnedModel = function(positionX, positionY)
{
  var vector = new THREE.Vector3( (positionX / window.innerWidth) * 2 - 1,
        -(positionY / window.innerHeight) * 2 + 1, 0.5);
  vector.unproject(this.scene.camera);
  this.ray.set(this.scene.camera.position,
      vector.sub(this.scene.camera.position).normalize());
  var point = this.ray.intersectPlane(this.plane);

  if (!point)
  {
    return;
  }

  point.z = this.obj.position.z;

  if(this.snapDist)
  {
    point.x = Math.round(point.x / this.snapDist) * this.snapDist;
    point.y = Math.round(point.y / this.snapDist) * this.snapDist;
  }

  this.scene.setPose(this.obj, point, new THREE.Quaternion());

  if (this.obj.children[0].children[0] &&
     (this.obj.children[0].children[0] instanceof THREE.SpotLight ||
      this.obj.children[0].children[0] instanceof THREE.DirectionalLight))
  {
    var lightObj = this.obj.children[0].children[0];
    if (lightObj.direction)
    {
      if (lightObj.target)
      {
        lightObj.target.position.copy(lightObj.direction);
      }
    }
  }
};

/**
 * Generate unique name for spawned entity
 * @param {string} entity - entity type
 */
GZ3D.SpawnModel.prototype.generateUniqueName = function(entity)
{
  var i = 0;
  while (i < 1000)
  {
    if (this.scene.getByName(entity+'_'+i))
    {
      ++i;
    }
    else
    {
      return entity+'_'+i;
    }
  }
};
