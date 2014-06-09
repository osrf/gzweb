var GZ3D = GZ3D || {
  REVISION : '1'
};


/*global $:false */

var guiEvents = new EventEmitter2({ verbose: true });

var emUnits = function(value)
    {
      return value*parseFloat($('body').css('font-size'));
    };

// Bind events to buttons
$(function()
{
  //Initialize
  // Toggle items
  $('#view-collisions').buttonMarkup({icon: 'false'});
  $('#snap-to-grid').buttonMarkup({icon: 'false'});
  guiEvents.emit('toggle_notifications');

  $( '#clock-touch' ).popup('option', 'arrow', 't');
  $('#notification-popup-screen').remove();

  // Panel starts open for wide screens
  if ($(window).width() / emUnits(1) > 35)
  {
    $('#leftPanel').panel('open');
  }

  // Clicks/taps// Touch devices
  if ('ontouchstart' in window || 'onmsgesturechange' in window)
  {
    // swipe icon
    $('#box').html('<b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Box</b>'+
        '<div style="float: right;">'+
        '<img src="style/images/box.png" '+
        'style="vertical-align:middle;height:1.4em;">'+
        '<img src="style/images/swipe.png" '+
        'style="vertical-align:middle;margin-left:1em;"></div>');
    $('#sphere').html('<b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sphere</b>'+
        '<div style="float: right;">'+
        '<img src="style/images/sphere.png" '+
        'style="vertical-align:middle;;height:1.4em;">'+
        '<img src="style/images/swipe.png" '+
        'style="vertical-align:middle; margin-left:1em;"></div>');
    $('#cylinder').html('<b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cylinder</b>'+
        '<div style="float: right;">'+
        '<img src="style/images/cylinder.png" '+
        'style="vertical-align:middle;;height:1.4em;">'+
        '<img src="style/images/swipe.png" '+
        'style="vertical-align:middle; margin-left:1em;"></div>');

    // touchstart
    $( '#box' ).bind('touchstart',function(event) {
      guiEvents.emit('close_panel');
      guiEvents.emit('spawn_entity_start', 'box');
      event.stopPropagation();
    });
    $( '#sphere' ).bind('touchstart',function(event) {
      guiEvents.emit('close_panel');
      guiEvents.emit('spawn_entity_start', 'sphere');
      event.stopPropagation();
    });
    $( '#cylinder' ).bind('touchstart',function(event) {
      guiEvents.emit('close_panel');
      guiEvents.emit('spawn_entity_start', 'cylinder');
      event.stopPropagation();
    });
    // touchmove
    $( '#box' ).bind('touchmove',function(event) {
      guiEvents.emit('spawn_entity_move', event);
      event.stopPropagation();
    });
    $( '#sphere' ).bind('touchmove',function(event) {
      guiEvents.emit('spawn_entity_move', event);
      event.stopPropagation();
    });
    $( '#cylinder' ).bind('touchmove',function(event) {
      guiEvents.emit('spawn_entity_move', event);
      event.stopPropagation();
    });
    // touchend
    $( '#box' ).bind('touchend',function() {
      guiEvents.emit('spawn_entity_end');
    });
    $( '#sphere' ).bind('touchend',function() {
      guiEvents.emit('spawn_entity_end');
    });
    $( '#cylinder' ).bind('touchend',function() {
      guiEvents.emit('spawn_entity_end');
    });

    $('#play-header-fieldset')
        .css('position', 'absolute')
        .css('right', '13.2em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#clock-header-fieldset')
        .css('position', 'absolute')
        .css('right', '9.9em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#clock-mouse')
        .css('visibility','hidden');

    $('#mode-header-fieldset')
        .css('position', 'absolute')
        .css('right', '0.5em')
        .css('top', '0.15em')
        .css('z-index', '1000');

    $('#box-header-fieldset')
        .css('visibility','hidden');

    $('#sphere-header-fieldset')
        .css('visibility','hidden');

    $('#cylinder-header-fieldset')
        .css('visibility','hidden');
  }
  // Mouse devices
  else
  {
    $( '#box' ).click(function() {
      guiEvents.emit('close_panel');
      guiEvents.emit('spawn_entity_start', 'box');
    });

    $( '#sphere' ).click(function() {
      guiEvents.emit('close_panel');
      guiEvents.emit('spawn_entity_start', 'sphere');
    });

    $( '#cylinder' ).click(function() {
      guiEvents.emit('close_panel');
      guiEvents.emit('spawn_entity_start', 'cylinder');
    });

    $('#clock-header-fieldset')
        .css('visibility','hidden');

    $('#play-header-fieldset')
        .css('position', 'absolute')
        .css('right', '32.4em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#clock-mouse')
        .css('position', 'absolute')
        .css('right', '19.5em')
        .css('top', '0.5em')
        .css('z-index', '100')
        .css('width', '12em')
        .css('height', '2.5em')
        .css('background-color', '#333333')
        .css('padding', '3px')
        .css('border-radius', '5px');

    $('#mode-header-fieldset')
        .css('position', 'absolute')
        .css('right', '12.6em')
        .css('top', '0.15em')
        .css('z-index', '1000');

    $('#box-header-fieldset')
        .css('position', 'absolute')
        .css('right', '6.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#sphere-header-fieldset')
        .css('position', 'absolute')
        .css('right', '3.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    $('#cylinder-header-fieldset')
        .css('position', 'absolute')
        .css('right', '0.5em')
        .css('top', '0em')
        .css('z-index', '1000');

    // right-click
    $('#container').mousedown(function(event)
        {
          event.preventDefault();
          if(event.which === 3)
          {
            guiEvents.emit('right_click', event);
          }
        });

    $('#model-popup').bind({popupafterclose: function()
        {
          guiEvents.emit('hide_boundingBox');
        }});

    $('#model-popup-screen').mousedown(function(event)
        {
          $('#model-popup').popup('close');
        });
  }

  $('.header-button')
      .css('float', 'left')
      .css('height', '1.45em')
      .css('padding', '0.65em');

  $( '#leftPanel' ).on('panelclose', function()
      {
        $('#panelButton').removeClass('ui-btn-active');
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
  $('#box-header').click(function()
      {
        guiEvents.emit('close_panel');
        guiEvents.emit('spawn_entity_start', 'box');
      });
  $('#sphere-header').click(function()
      {
        guiEvents.emit('close_panel');
        guiEvents.emit('spawn_entity_start', 'sphere');
      });
  $('#cylinder-header').click(function()
      {
        guiEvents.emit('close_panel');
        guiEvents.emit('spawn_entity_start', 'cylinder');
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
        guiEvents.emit('close_panel');
      });
  $('#reset-world').click(function()
      {
        guiEvents.emit('world_reset');
        guiEvents.emit('close_panel');
      });
  $('#reset-view').click(function()
      {
        guiEvents.emit('view_reset');
        guiEvents.emit('close_panel');
      });
  $('#view-collisions').click(function()
      {
        guiEvents.emit('show_collision');
        guiEvents.emit('close_panel');
      });
  $( '#snap-to-grid' ).click(function() {
    guiEvents.emit('snap_to_grid');
    guiEvents.emit('close_panel');
  });
  $( '#toggle-notifications' ).click(function() {
    guiEvents.emit('toggle_notifications');
    guiEvents.emit('close_panel');
  });

  // Disable Esc key to close panel
  $('body').on('keyup', function(event)
      {
        if (event.which === 27)
        {
          return false;
        }
      });

  // long press on canvas
  var press_time = 400;
  $('#container')
    .on('touchstart', function (event) {
      $(this).data('checkdown', setTimeout(function () {
        guiEvents.emit('longpress_start',event);
      }, press_time));
    })
    .on('touchend', function (event) {
      clearTimeout($(this).data('checkdown'));
      guiEvents.emit('longpress_end',event,false);
    })
    .on('touchmove', function (event) {
      clearTimeout($(this).data('checkdown'));
      $(this).data('checkdown', setTimeout(function () {
        guiEvents.emit('longpress_start',event);
      }, press_time));
      guiEvents.emit('longpress_move',event);
    });

  $( '#delete-entity' ).click(function() {
    guiEvents.emit('delete_entity');
  });
});

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
};

/**
 * Initialize GUI
 */
GZ3D.Gui.prototype.init = function()
{
  this.spawnModel = new GZ3D.SpawnModel(
      this.scene, this.scene.getDomElement());
  this.spawnState = null;
  this.longPressState = null;
  this.showNotifications = false;

  var that = this;

  // On guiEvents, emitter events
  guiEvents.on('manipulation_mode',
      function(mode)
      {
        that.scene.setManipulationMode(mode);
        guiEvents.emit('notification_popup',
            mode.charAt(0).toUpperCase()+
            mode.substring(1)+' mode');
      }
  );

  // Create temp model
  guiEvents.on('spawn_entity_start', function(entity)
      {
        // manually trigger view mode
        that.scene.setManipulationMode('view');
        $('#view-mode').prop('checked', true);
        $('input[type="radio"]').checkboxradio('refresh');
        that.spawnState = 'START';
        that.spawnModel.start(entity,function(obj)
            {
              that.emitter.emit('entityCreated', obj, entity);
              guiEvents.emit('notification_popup',
                  entity.charAt(0).toUpperCase()+
                  entity.substring(1)+' inserted');
            });
        guiEvents.emit('notification_popup',
            'Place '+entity+' at the desired position');
      }
  );

  // Move temp model by touch
  guiEvents.on('spawn_entity_move', function(event)
      {
        that.spawnState = 'MOVE';
        that.spawnModel.onTouchMove(event,false);
      }
  );
  // Place temp model by touch
  guiEvents.on('spawn_entity_end', function()
      {
        if (that.spawnState === 'MOVE')
        {
          that.spawnModel.onTouchEnd();
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

  guiEvents.on('snap_to_grid',
      function ()
      {
        if(that.scene.modelManipulator.snapDist === null)
        {
          $('#snap-to-grid').buttonMarkup({icon: 'check'});
          that.scene.modelManipulator.snapDist = 0.5;
          that.spawnModel.snapDist = that.scene.modelManipulator.snapDist;
          guiEvents.emit('notification_popup','Snapping to grid');
        }
        else
        {
          $('#snap-to-grid').buttonMarkup({icon: 'false'});
          that.scene.modelManipulator.snapDist = null;
          that.spawnModel.snapDist = null;
          guiEvents.emit('notification_popup','Not snapping to grid');
        }
      }
  );

  guiEvents.on('toggle_notifications', function ()
      {
        this.showNotifications = !this.showNotifications;
        if(!this.showNotifications)
        {
            $('#toggle-notifications').buttonMarkup({ icon: 'false' });
        }
        else
        {
            $('#toggle-notifications').buttonMarkup({ icon: 'check' });
        }
      }
  );

  guiEvents.on('close_panel', function()
      {
        if ($(window).width() / emUnits(1)< 35)
        {
          $('#leftPanel').panel('close');
        }
      }
  );

  guiEvents.on('longpress_start',
      function (event)
      {
        if (event.originalEvent.touches.length !== 1 ||
            that.scene.modelManipulator.hovered)
        {
          guiEvents.emit('longpress_end', event.originalEvent,true);
        }
        else
        {
          that.scene.killCameraControl = true;
          that.scene.showRadialMenu(event);
          that.longPressState = 'START';
        }
      }
  );

  guiEvents.on('longpress_end', function(event,cancel)
      {
        if (that.scene.modelManipulator.object === undefined)
        {
          that.scene.hideBoundingBox();
        }
        if (that.longPressState !== 'START')
        {
          that.longPressState = 'END';
          return;
        }
        that.longPressState = 'END';
        that.scene.killCameraControl = false;
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
              });
          }
        }
      }
  );

  guiEvents.on('longpress_move', function(event)
      {
        if (event.originalEvent.touches.length !== 1)
        {
          guiEvents.emit('longpress_end',event.originalEvent,true);
        }
        else
        {
          if (that.longPressState !== 'START')
          {
            return;
          }
          // Cancel long press in case of drag before it shows
          if (!that.scene.radialMenu.showing)
          {
            that.scene.killCameraControl = false;
          }
          else
          {
            that.scene.radialMenu.onLongPressMove(event);
          }
        }
      }
  );

  var notificationTimeout;
  guiEvents.on('notification_popup',
      function (notification)
      {
        if (this.showNotifications)
        {
          clearTimeout(notificationTimeout);
          $( '#notification-popup' ).popup('close');
          $( '#notification-popup' ).html('&nbsp;'+notification+'&nbsp;');
          $( '#notification-popup' ).popup('open', {
              y:window.innerHeight-50});
          notificationTimeout = setTimeout(function()
          {
            $( '#notification-popup' ).popup('close');
          }, 2000);
        }
      }
  );

  guiEvents.on('right_click', function (event)
      {
        that.scene.onRightClick(event, function(entity)
            {
              that.scene.selectedModel = entity;
              that.scene.showBoundingBox(entity);
              $('.ui-popup').popup('close');
              $('#model-popup').popup('open',
                  {x: event.clientX + emUnits(3),
                   y: event.clientY + emUnits(1.5)});
            });
      }
  );

  guiEvents.on('delete_entity', function ()
      {
        that.emitter.emit('deleteEntity',that.scene.selectedModel);
        guiEvents.emit('notification_popup','Model deleted');
        $('#model-popup').popup('close');
        that.scene.selectedModel = null;
      }
  );

  guiEvents.on('hide_boundingBox', function ()
      {
        that.scene.hideBoundingBox();
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

//var GAZEBO_MODEL_DATABASE_URI='http://gazebosim.org/models';

GZ3D.GZIface = function(scene, gui)
{
  this.scene = scene;
  this.gui = gui;
  this.init();
  this.visualsToAdd = [];
};

GZ3D.GZIface.prototype.init = function()
{
  this.material = [];
  this.entityMaterial = {};

  // Set up initial scene
  this.webSocket = new ROSLIB.Ros({
    url : 'ws://' + location.hostname + ':7681'
  });

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

  var materialTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/material',
    messageType : 'material',
  });

  var materialUpdate = function(message)
  {
    this.material = message;
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
      this.scene.createGrid();
    }

    for (var i = 0; i < message.light.length; ++i)
    {
      var light = message.light[i];
      var lightObj = this.createLightFromMsg(light);
      this.scene.add(lightObj);
    }

    for (var j = 0; j < message.model.length; ++j)
    {
      var model = message.model[j];
      var modelObj = this.createModelFromMsg(model);
      this.scene.add(modelObj);
    }

    this.sceneTopic.unsubscribe();
  };
  this.sceneTopic.subscribe(sceneUpdate.bind(this));


  // Update model pose
  var poseTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/pose/info',
    messageType : 'pose',
  });

  var poseUpdate = function(message)
  {
    var entity = this.scene.getByName(message.name);
    if (entity && entity !== this.scene.modelManipulator.object)
    {
      this.scene.updatePose(entity, message.position, message.orientation);
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
    this.updateStatsGuiFromMsg(message);
  };

  worldStatsTopic.subscribe(worldStatsUpdate.bind(this));

  // Lights
  var lightTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/light',
    messageType : 'light',
  });

  var ligthtUpdate = function(message)
  {
    if (!this.scene.getByName(message.name))
    {
      var lightObj = this.createLightFromMsg(message);
      this.scene.add(lightObj);
    }
  };

  lightTopic.subscribe(ligthtUpdate.bind(this));


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

  // Model modify messages - for modifying model pose
  this.modelModifyTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/model/modify',
    messageType : 'model',
  });

  var publishModelModify = function(model)
  {
    var matrix = model.matrixWorld;
    var translation = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, quaternion, scale);

    var modelMsg =
    {
      name : model.name,
      id : model.userData,
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
    that.modelModifyTopic.publish(modelMsg);
  };

  this.scene.emitter.on('poseChanged', publishModelModify);

  // Factory messages - for spawning new models
  this.factoryTopic = new ROSLIB.Topic({
    ros : this.webSocket,
    name : '~/factory',
    messageType : 'factory',
  });

  var publishFactory = function(model, type)
  {
    var matrix = model.matrixWorld;
    var translation = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(translation, quaternion, scale);
    var modelMsg =
    {
      name : model.name,
      type : type,
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
    that.factoryTopic.publish(modelMsg);
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

  this.gui.emitter.on('deleteEntity',
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

  this.scene.emitter.on('poseChanged', publishModelModify);

  this.gui.emitter.on('entityCreated', publishFactory);

  this.gui.emitter.on('reset',
      function(resetType)
      {
        publishWorldControl(null, resetType);
      }
  );

  this.gui.emitter.on('pause',
      function(paused)
      {
        publishWorldControl(paused, null);
      }
  );
};

GZ3D.GZIface.prototype.updateStatsGuiFromMsg = function(stats)
{
  this.gui.setPaused(stats.paused);

  var simSec = stats.sim_time.sec;
  var simNSec = stats.sim_time.nsec;

  var simDay = Math.floor(simSec / 86400);
  simSec -= simDay * 86400;

  var simHour = Math.floor(simSec / 3600);
  simSec -= simHour * 3600;

  var simMin = Math.floor(simSec / 60);
  simSec -= simMin * 60;

  var simMsec = Math.floor(simNSec * 1e-6);

  var realSec = stats.real_time.sec;
  var realNSec = stats.real_time.nsec;

  var realDay = Math.floor(realSec / 86400);
  realSec -= realDay * 86400;

  var realHour = Math.floor(realSec / 3600);
  realSec -= realHour * 3600;

  var realMin = Math.floor(realSec / 60);
  realSec -= realMin * 60;

  var realMsec = Math.floor(realNSec * 1e-6);

  var simTimeValue = '';
  var realTimeValue = '';

  if (realDay < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realDay.toFixed(0) + ' ';
  if (realHour < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realHour.toFixed(0) + ':';
  if (realMin < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realMin.toFixed(0)  + ':';
  if (realSec < 10)
  {
    realTimeValue += '0';
  }
  realTimeValue += realSec.toFixed(0);

  if (simDay < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simDay.toFixed(0)  + ' ';
  if (simHour < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simHour.toFixed(0) + ':';
  if (simMin < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simMin.toFixed(0) + ':';
  if (simSec < 10)
  {
    simTimeValue += '0';
  }
  simTimeValue += simSec.toFixed(0);

  this.gui.setRealTime(realTimeValue);
  this.gui.setSimTime(simTimeValue);
};

GZ3D.GZIface.prototype.createModelFromMsg = function(model)
{
  var modelObj = new THREE.Object3D();
  modelObj.name = model.name;
  modelObj.userData = model.id;
  if (model.pose)
  {
    this.scene.setPose(modelObj, model.pose.position, model.pose.orientation);
  }
  for (var j = 0; j < model.link.length; ++j)
  {
    var link = model.link[j];
    var linkObj = new THREE.Object3D();
    linkObj.name = link.name;
    linkObj.userData = link.id;

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
  return modelObj;
};

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

GZ3D.GZIface.prototype.createLightFromMsg = function(light)
{
  var obj = new THREE.Object3D();
  var lightObj;
  var helper, helperGeometry, helperMaterial;
  var dir, target, negDir, factor;

  var color = new THREE.Color();
  color.r = light.diffuse.r;
  color.g = light.diffuse.g;
  color.b = light.diffuse.b;

  if (light.type === 1)
  {
    lightObj = new THREE.PointLight(color.getHex());
    lightObj.distance = light.range;
    factor = 5; // closer to gzclient
    lightObj.intensity = light.attenuation_constant * factor;
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);

    helperGeometry = new THREE.OctahedronGeometry(0.3, 0);
    helperGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1, 0));
    helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
    helperMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x00ff00 } );
    helper = new THREE.Mesh(helperGeometry, helperMaterial);
  }
  if (light.type === 2)
  {
    lightObj = new THREE.SpotLight(color.getHex());
    lightObj.distance = light.range;
    factor = 5; // closer to gzclient
    lightObj.intensity = light.attenuation_constant * factor;
    this.scene.setPose(lightObj, light.pose.position,
        light.pose.orientation);

    dir = new THREE.Vector3(light.direction.x, light.direction.y,
        light.direction.z);
    target = new THREE.Vector3();
    target.copy(lightObj.position);
    target.add(dir);
    lightObj.target.position = target;

    helperGeometry = new THREE.CylinderGeometry(0, 0.3, 0.2, 4, 1, true);
    helperGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1, 0));
    helperGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
    helperMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x00ff00 } );
    helper = new THREE.Mesh(helperGeometry, helperMaterial);
  }
  else if (light.type === 3)
  {
    // Direction: position to target.position
    lightObj = new THREE.DirectionalLight(color.getHex());

    negDir = new THREE.Vector3(light.direction.x, light.direction.y,
        light.direction.z);
    dir = new THREE.Vector3(-negDir.x, -negDir.y, -negDir.z);

    lightObj.position.set(dir.x, dir.y, dir.z);
    lightObj.target.position = new THREE.Vector3(0, 0, 0);
    lightObj.intensity = light.attenuation_constant;
    lightObj.shadowCameraNear = 1;
    lightObj.shadowCameraFar = 50;
    lightObj.shadowMapWidth = 4094;
    lightObj.shadowMapHeight = 4094;
    lightObj.shadowCameraVisible = false;
    lightObj.shadowCameraBottom = -100;
    lightObj.shadowCameraLeft = -100;
    lightObj.shadowCameraRight = 100;
    lightObj.shadowCameraTop = 100;
    lightObj.shadowBias = 0.0001;

    helperGeometry = new THREE.Geometry();
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
    helperGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
        light.pose.position.x, light.pose.position.y,light.pose.position.z));
    helperMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
    helper = new THREE.Line(helperGeometry, helperMaterial, THREE.LinePieces);
    helper.lookAt(dir);
  }
  lightObj.castShadow = light.cast_shadows;
  lightObj.shadowDarkness = 0.3;
  lightObj.name = light.name;
  obj.name = light.name + '_lightObj';
  if (dir)
  {
    obj.direction = dir;
  }

  helper.visible = false;
  helper.name = light.name + '_lightHelper';

  obj.add(lightObj);
  obj.add(helper);
  return obj;
};

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
      if (uriType === 'file' || uriType === 'model')
      {
        var modelName = meshUri.substring(meshUri.indexOf('://') + 3);
        if (geom.mesh.scale)
        {
          parent.scale.x = geom.mesh.scale.x;
          parent.scale.y = geom.mesh.scale.y;
          parent.scale.z = geom.mesh.scale.z;
        }

        var modelUri = uriPath + '/' + modelName;
        // Use coarse version on touch devices
        if (modelUri.indexOf('.dae') !== -1 && this.scene.isTouchDevice)
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

        var materialName = parent.name + '::' + modelUri;
        this.entityMaterial[materialName] = mat;

        this.scene.loadMesh(modelUri, submesh,
            centerSubmesh, function(dae) {
              if (that.entityMaterial[materialName])
              {
                var allChildren = [];
                dae.getDescendants(allChildren);
                for (var c = 0; c < allChildren.length; ++c)
                {
                  if (allChildren[c] instanceof THREE.Mesh)
                  {
                    that.scene.setMaterial(allChildren[c],
                        that.entityMaterial[materialName]);
                    break;
                  }
                }
              }
              parent.add(dae);
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

GZ3D.GZIface.prototype.applyMaterial = function(obj, mat)
{
  if (obj)
  {
    if (mat)
    {
      obj.material = new THREE.MeshPhongMaterial();
      var ambient = mat.ambient;
      if (ambient)
      {
        obj.material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
      }
      var diffuse = mat.diffuse;
      if (diffuse)
      {
        obj.material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
      }
      var specular = mat.specular;
      if (specular)
      {
        obj.material.specular.setRGB(specular[0], specular[1], specular[2]);
      }
      var opacity = mat.opacity;
      if (opacity)
      {
        if (opacity < 1)
        {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      }

      if (mat.texture)
      {
        obj.material.map = THREE.ImageUtils.loadTexture(mat.texture);
      }
      if (mat.normalMap)
      {
        obj.material.normalMap = THREE.ImageUtils.loadTexture(mat.normalMap);
      }
    }
  }
};

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
    if (script.uri.length > 0)
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

  // For mouse/key/touch events
  this.domElement = (domElement !== undefined) ? domElement : document;
  this.document = (doc !== undefined) ? doc : document;

  // Mobile / desktop
  this.mobile = (mobile !== undefined) ? mobile : false;

  // Object to be manipulated
  this.object = undefined;

  // translate|rotate
  this.mode = 'translate';

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
  var projector = new THREE.Projector();
  var pointerVector = new THREE.Vector3();

  var point = new THREE.Vector3();
  var offset = new THREE.Vector3();

  var rotation = new THREE.Vector3();
  var offsetRotation = new THREE.Vector3();
  var scale = 1;

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

  for(var i in intersectionPlaneList)
  {
    intersectionPlanes[intersectionPlaneList[i]] =
        new THREE.Mesh(new THREE.PlaneGeometry(500, 500));
    intersectionPlanes[intersectionPlaneList[i]].material.side =
        THREE.DoubleSide;
    intersectionPlanes[intersectionPlaneList[i]].visible = false;
    planes.add(intersectionPlanes[intersectionPlaneList[i]]);
  }

  intersectionPlanes['YZ'].rotation.set(0, Math.PI/2, 0);
  intersectionPlanes['XZ'].rotation.set(-Math.PI/2, 0, 0);
  bakeTransformations(intersectionPlanes['YZ']);
  bakeTransformations(intersectionPlanes['XZ']);

  // Geometries

  var pickerAxes = {};
  var displayAxes = {};

  var HandleMaterial = function(color, over, opacity)
  {
    var material = new THREE.MeshBasicMaterial();
    material.color = color;
    if(over)
    {
      material.side = THREE.DoubleSide;
      material.depthTest = false;
      material.depthWrite = false;
    }
    material.opacity = opacity !== undefined ? opacity : 0.5;
    material.transparent = true;
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

  mesh = new THREE.Mesh(geometry, new HandleMaterial(red, true));
  mesh.position.x = 0.7;
  mesh.rotation.z = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'TX';
  pickerAxes['translate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry, new HandleMaterial(green, true));
  mesh.position.y = 0.7;
  bakeTransformations(mesh);
  mesh.name = 'TY';
  pickerAxes['translate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry, new HandleMaterial(blue, true));
  mesh.position.z = 0.7;
  mesh.rotation.x = Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'TZ';
  pickerAxes['translate'].add(mesh);
  this.pickerNames.push(mesh.name);

  if(this.mobile)
  {
    // Display cylinder
    geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 10, 1, false);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(red, true));
    mesh.position.x = 0.5;
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TX';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(green, true));
    mesh.position.y = 0.5;
    bakeTransformations(mesh);
    mesh.name = 'TY';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(blue, true));
    mesh.position.z = 0.5;
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TZ';
    displayAxes['translate'].add(mesh);

    // Display cone (arrow tip)
    geometry = new THREE.CylinderGeometry(0, 0.15, 0.4, 10, 1, false);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(red, true));
    mesh.position.x = 1.2;
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TX';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(green, true));
    mesh.position.y = 1.2;
    bakeTransformations(mesh);
    mesh.name = 'TY';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(blue, true));
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
    mesh = new THREE.Line(geometry, material, THREE.LinePieces);
    displayAxes['translate'].add(mesh);

    // Display cone (arrow tip)
    geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 4, 1, true);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(red, true, 1));
    mesh.position.x = 1.1;
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TX';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(green, true, 1));
    mesh.position.y = 1.1;
    bakeTransformations(mesh);
    mesh.name = 'TY';
    displayAxes['translate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(blue, true, 1));
    mesh.position.z = 1.1;
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TZ';
    displayAxes['translate'].add(mesh);

    // Picker and display octahedron for TXYZ
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0),
        new HandleMaterial(white, true, 0.25));
    mesh.name = 'TXYZ';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);
    pickerAxes['translate'].add(mesh.clone());

    // Picker and display planes
    geometry = new THREE.PlaneGeometry(0.3, 0.3);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(yellow, 0.25));
    mesh.position.set(0.15, 0.15, 0);
    bakeTransformations(mesh);
    mesh.name = 'TXY';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);
    pickerAxes['translate'].add(mesh.clone());

    mesh = new THREE.Mesh(geometry, new HandleMaterial(cyan, 0.25));
    mesh.position.set(0, 0.15, 0.15);
    mesh.rotation.y = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TYZ';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);
    pickerAxes['translate'].add(mesh.clone());

    mesh = new THREE.Mesh(geometry, new HandleMaterial(magenta, 0.25));
    mesh.position.set(0.15, 0, 0.15);
    mesh.rotation.x = Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'TXZ';
    this.pickerNames.push(mesh.name);
    displayAxes['translate'].add(mesh);
    pickerAxes['translate'].add(mesh.clone());

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

  mesh = new THREE.Mesh(geometry, new HandleMaterial(red, false));
  mesh.rotation.z = -Math.PI/2;
  mesh.rotation.y = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'RX';
  pickerAxes['rotate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry, new HandleMaterial(green, false));
  mesh.rotation.z = Math.PI;
  mesh.rotation.x = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'RY';
  pickerAxes['rotate'].add(mesh);
  this.pickerNames.push(mesh.name);

  mesh = new THREE.Mesh(geometry, new HandleMaterial(blue, false));
  mesh.rotation.z = -Math.PI/2;
  bakeTransformations(mesh);
  mesh.name = 'RZ';
  pickerAxes['rotate'].add(mesh);
  this.pickerNames.push(mesh.name);

  if(this.mobile)
  {
    // Display torus
    geometry = new THREE.TorusGeometry(1, 0.1, 4, 36, 2*Math.PI);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(blue, false));
    mesh.rotation.z = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'RZ';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(red, false));
    mesh.rotation.z = -Math.PI/2;
    mesh.rotation.y = -Math.PI/2;
    bakeTransformations(mesh);
    mesh.name = 'RX';
    displayAxes['rotate'].add(mesh);

    mesh = new THREE.Mesh(geometry, new HandleMaterial(green, false));
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
        new HandleMaterial(white, 0.25));
    mesh.name = 'RXYZE';
    pickerAxes['rotate'].add(mesh);
    this.pickerNames.push(mesh.name);

    intersectionPlanes['SPHERE'] = new THREE.Mesh(new
        THREE.SphereGeometry(0.95, 12, 12));
    intersectionPlanes['SPHERE'].visible = false;
    planes.add(intersectionPlanes['SPHERE']);

    mesh = new THREE.Mesh(new THREE.TorusGeometry(1.30, 0.15, 4, 12),
        new HandleMaterial(yellow, 0.25));
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
   * Update gizmo
   */
  this.update = function()
  {
    if(this.object === undefined)
    {
      return;
    }

    this.object.updateMatrixWorld();
    worldPosition.getPositionFromMatrix(this.object.matrixWorld);

    this.camera.updateMatrixWorld();
    camPosition.getPositionFromMatrix(this.camera.matrixWorld);

    scale = worldPosition.distanceTo(camPosition) / 6 * this.scale;
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
    for(var k in pickerAxes)
    {
      for(var l in pickerAxes[k].children)
      {
        pickerAxes[k].children[l].visible = false;
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

    for(var j in pickerAxes[this.mode].children)
    {
      pickerAxes[this.mode].children[j].visible = false;
    }

    scope.update();
  };

  /**
   * Choose intersection plane
   */
  this.setIntersectionPlane = function()
  {
    eye.copy(camPosition).sub(worldPosition).normalize();

    if(isSelected('X'))
    {
      if(Math.abs(eye.y) > Math.abs(eye.z)) {currentPlane = 'XZ';}
      else {currentPlane = 'XY';}
    }

    if(isSelected('Y'))
    {
      if(Math.abs(eye.x) > Math.abs(eye.z)) {currentPlane = 'YZ';}
      else {currentPlane = 'XY';}
    }

    if(isSelected('Z'))
    {
      if(Math.abs(eye.x) > Math.abs(eye.y)) {currentPlane = 'YZ';}
      else {currentPlane = 'XZ';}
    }

    if(isSelected('RX'))
    {
      currentPlane = 'YZ';
    }

    if(isSelected('RY'))
    {
      currentPlane = 'XZ';
    }

    if(isSelected('RZ'))
    {
      currentPlane = 'XY';
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
        // Back to original color
        if(selectedPicker !== null)
        {
            selectedPicker.material.color.copy(selectedColor);
        }

        selectedPicker = intersect.object;

        // Save color for when it's deselected
        selectedColor.copy(selectedPicker.material.color);

        // Darken color
        selectedPicker.material.color.offsetHSL(0, 0, -0.3);

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
        parentScale.getScaleFromMatrix(tempMatrix.getInverse(
            scope.object.parent.matrixWorld));

        offset.copy(planeIntersect.point);
      }
    }

    scope.document.addEventListener('touchmove', onTouchMove, false);
    scope.document.addEventListener('touchend', onTouchEnd, false);
  }


  /**
   * Window event callback
   * @param {} event
   */
  // onTouchEnd
  function onTouchEnd(event)
  {
    event.preventDefault();

    // Previously selected picker back to its color
    if(selectedPicker)
    {
      selectedPicker.material.color.copy(selectedColor);
    }

    selectedPicker = null;

    scope.dispatchEvent(changeEvent);

    scope.selected = 'null';
    scope.hovered = false;

    scope.document.removeEventListener('touchmove', onTouchMove, false);
    scope.document.removeEventListener('touchend', onTouchEnd, false);
  }


  /**
   * Window event callback
   * @param {} event
   */
  function onTouchMove(event)
  {
    if(scope.selected === 'null')
    {
      return;
    }

    event.preventDefault();

    var planeIntersect = intersectObjects(event,
        [intersectionPlanes[currentPlane]]);
    point.copy(planeIntersect.point);

    if(scope.mode === 'translate')
    {
      // Equivalent to onMouseMove

      point.sub(offset);
      point.multiply(parentScale);

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

      translateObject(oldPosition, point);
    }

    // rotate depends on a tap (= mouse click) to select the axis of rotation
    if(scope.mode === 'rotate')
    {
      // Equivalent to onMouseMove

      point.sub(worldPosition);
      point.multiply(parentScale);
      tempVector.copy(offset).sub(worldPosition);
      tempVector.multiply(parentScale);

      rotateObjectXYZ(point, tempVector);
    }

    scope.update();
    scope.dispatchEvent(changeEvent);
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

        if(intersect)
        {
          if(hovered !== intersect.object)
          {
            if(hovered !== null)
            {
              hovered.material.color.copy(hoveredColor);
            }

            selectedPicker = intersect.object;
            hovered = intersect.object;
            hoveredColor.copy(hovered.material.color);

            hovered.material.color.offsetHSL(0, 0, -0.3);

            scope.dispatchEvent(changeEvent);
          }
          scope.hovered = true;
        }
        else if(hovered !== null)
        {
          hovered.material.color.copy(hoveredColor);

          hovered = null;

          scope.dispatchEvent(changeEvent);

          scope.hovered = false;
      }
    }
    scope.document.addEventListener('mousemove', onMouseMove, false);
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
          parentScale.getScaleFromMatrix(tempMatrix.getInverse(
              scope.object.parent.matrixWorld));

          offset.copy(planeIntersect.point);
        }
    }

    scope.document.addEventListener('mousemove', onMouseMove, false);
    scope.document.addEventListener('mouseup', onMouseUp, false);
  }

  /**
   * Window event callback
   * @param {} event
   */
  function onMouseMove(event)
  {
    if(scope.selected === 'null')
    {
    return;
    }

    event.preventDefault();

    var planeIntersect = intersectObjects(event, [intersectionPlanes[currentPlane]]);

    if(planeIntersect)
    {
      point.copy(planeIntersect.point);

      if((scope.mode === 'translate') && isSelected('T'))
      {
        point.sub(offset);
        point.multiply(parentScale);

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

        translateObject(oldPosition, point);
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

          rotation.set(Math.atan2(point.z, point.y), Math.atan2(point.x, point.z), Math.atan2(point.y, point.x));
          offsetRotation.set(Math.atan2(tempVector.z, tempVector.y), Math.atan2(tempVector.x, tempVector.z), Math.atan2(tempVector.y, tempVector.x));

          tempQuaternion.setFromRotationMatrix(tempMatrix.getInverse(parentRotationMatrix));

          quaternionE.setFromAxisAngle(eye, rotation.z - offsetRotation.z);
          quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionE);
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

          scope.object.quaternion.copy(tempQuaternion);
          moveLightTarget();
        }
        else if(scope.selected === 'RXYZE')
        {
          quaternionE.setFromEuler(point.clone().cross(tempVector).normalize()); // has this ever worked?

          tempQuaternion.setFromRotationMatrix(tempMatrix.getInverse(parentRotationMatrix));
          quaternionX.setFromAxisAngle(quaternionE, - point.clone().angleTo(tempVector));
          quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

          scope.object.quaternion.copy(tempQuaternion);
          moveLightTarget();
        }
        else
        {
          rotateObjectXYZ(point, tempVector);
        }
      }
    }

    scope.update();
    scope.dispatchEvent(changeEvent);
  }

  function onMouseUp(event)
  {
    scope.selected = 'null';

    scope.document.removeEventListener('mousemove', onMouseMove, false);
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
    pointerVector.set((x) * 2 - 1, - (y) * 2 + 1, 0.5);

    projector.unprojectVector(pointerVector, scope.camera);
    ray.set(camPosition, pointerVector.sub(camPosition).normalize());

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
    THREE.GeometryUtils.merge(tempGeometry, object);
    object.geometry = tempGeometry;
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
  }

  /*
   * Translate object
   * @param {} oldPosition
   * @param {} point
   */
  function translateObject(oldPosition, point)
  {
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
    moveLightTarget();
  }

  /*
   * Rotate object
   * @param {} point
   * @param {} tempVector
   */
  function rotateObjectXYZ(point, tempVector)
  {
    rotation.set(Math.atan2(point.z, point.y), Math.atan2(point.x, point.z),
        Math.atan2(point.y, point.x));
    offsetRotation.set(Math.atan2(tempVector.z, tempVector.y), Math.atan2(
      tempVector.x, tempVector.z), Math.atan2(tempVector.y, tempVector.x));

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

    moveLightTarget();
  }

  /*
   * Move light target
   * @param {} object
   */
  function moveLightTarget()
  {
    if (scope.object.name.indexOf('_lightObj') === -1)
    {
      return;
    }

    var lightObj = scope.object.children[0];
    var target = new THREE.Vector3(0,0,0);

    if (lightObj instanceof THREE.PointLight)
    {
      return;
    }
    else if (lightObj instanceof THREE.SpotLight)
    {
      target.add(scope.object.direction);
      scope.object.localToWorld(target);
    }
    else if (lightObj instanceof THREE.DirectionalLight)
    {
      target.add(scope.object.position);
      target.sub(scope.object.direction);
    }
    lightObj.target.position.copy(target);
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
  // Distance from starting point
  this.radius = 70;
  // Speed to spread the menu
  this.speed = 10;
  // Icon size
  this.bgSize = 40;
  this.bgSizeSelected = 70;
  this.iconProportion = 0.6;
  this.bgShape = THREE.ImageUtils.loadTexture(
      'style/images/icon_background.png' );

  // For the opening motion
  this.moving = false;
  this.startPosition = null;

  // Either moving or already stopped
  this.showing = false;

  // Colors
  this.selectedColor = new THREE.Color( 0x22aadd );
  this.plainColor = new THREE.Color( 0x333333 );

  // Selected item
  this.selected = null;

  // Selected model
  this.model = null;

  // Object containing all items
  this.menu = new THREE.Object3D();

  // Add items to the menu
  this.addItem('delete','style/images/trash.png');
  this.addItem('translate','style/images/translate.png');
  this.addItem('rotate','style/images/rotate.png');

  this.numberOfItems = this.menu.children.length;
  this.offset = this.numberOfItems - 1 - Math.floor(this.numberOfItems/2);

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
  for ( var i in this.menu.children )
  {
    this.menu.children[i].children[0].visible = false;
    this.menu.children[i].children[1].visible = false;
    this.menu.children[i].children[1].material.color = this.plainColor;
    this.menu.children[i].children[0].scale.set(
        this.bgSize*this.iconProportion,
        this.bgSize*this.iconProportion, 1.0 );
    this.menu.children[i].children[1].scale.set(
        this.bgSize,
        this.bgSize, 1.0 );
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
  this.model = model;
  var pointer = this.getPointer(event);
  this.startPosition = pointer;

  for ( var i in this.menu.children )
  {
    this.menu.children[i].children[0].visible = true;
    this.menu.children[i].children[1].visible = true;
    this.menu.children[i].children[0].position.set(pointer.x,pointer.y,0);
    this.menu.children[i].children[1].position.set(pointer.x,pointer.y,0);
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
  for ( var i in this.menu.children )
  {
    var X = this.menu.children[i].children[0].position.x -
        this.startPosition.x;
    var Y = this.menu.children[i].children[0].position.y -
        this.startPosition.y;

    var d = Math.sqrt(Math.pow(X,2) + Math.pow(Y,2));

    if ( d !== this.radius)
    {
      X = X - ( this.speed * Math.sin( ( this.offset - i ) * Math.PI/4 ) );
      Y = Y - ( this.speed * Math.cos( ( this.offset - i ) * Math.PI/4 ) );
    }
    else
    {
      this.moving = false;
    }

    this.menu.children[i].children[0].position.x = X + this.startPosition.x;
    this.menu.children[i].children[0].position.y = Y + this.startPosition.y;
    this.menu.children[i].children[1].position.x = X + this.startPosition.x;
    this.menu.children[i].children[1].position.y = Y + this.startPosition.y;

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
  if (angle > 5*Math.PI/8 && angle < 7*Math.PI/8)
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
  else if (angle > -7*Math.PI/8 && angle < -5*Math.PI/8)
  {
    region = 3;
  }
  // top
  else if (angle > -5*Math.PI/8 && angle < -3*Math.PI/8)
  {
    region = 4;
  }
  // top-right
  else if (angle > -3*Math.PI/8 && angle < -1*Math.PI/8)
  {
    region = 5;
  }
  // right
  else if (angle > -1*Math.PI/8 && angle < 1*Math.PI/8)
  {
    region = 6;
  }
  // bottom-right
  else if (angle > 1*Math.PI/8 && angle < 3*Math.PI/8)
  {
    region = 7;
  }
  // bottom
  else if (angle > 3*Math.PI/8 && angle < 5*Math.PI/8)
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
  for ( var i in this.menu.children )
  {
    if (counter === Selected)
    {
      this.menu.children[i].children[1].material.color = this.selectedColor;
      this.menu.children[i].children[0].scale.set(
          this.bgSizeSelected*this.iconProportion,
          this.bgSizeSelected*this.iconProportion, 1.0 );
      this.menu.children[i].children[1].scale.set(
          this.bgSizeSelected,
          this.bgSizeSelected, 1.0 );
      this.selected = this.menu.children[i].children[0].name;
    }
    else
    {
      this.menu.children[i].children[1].material.color = this.plainColor;
      this.menu.children[i].children[0].scale.set(
          this.bgSize*this.iconProportion,
          this.bgSize*this.iconProportion, 1.0 );
      this.menu.children[i].children[1].scale.set(
          this.bgSize, this.bgSize, 1.0 );
    }
    counter++;
  }
};

/**
 * Create an item and add it to the menu.
 * Create them in order
 * @param {string} type - delete/translate/rotate
 * @param {string} itemTexture - icon's uri
 */
GZ3D.RadialMenu.prototype.addItem = function(type,itemTexture)
{
  // Load icon
  itemTexture = THREE.ImageUtils.loadTexture( itemTexture );

  var itemMaterial = new THREE.SpriteMaterial( { useScreenCoordinates: true,
      alignment: THREE.SpriteAlignment.center } );
  itemMaterial.map = itemTexture;

  var iconItem = new THREE.Sprite( itemMaterial );
  iconItem.scale.set( this.bgSize*this.iconProportion,
      this.bgSize*this.iconProportion, 1.0 );
  iconItem.name = type;

  // Icon background
  var bgMaterial = new THREE.SpriteMaterial( {
      map: this.bgShape,
      useScreenCoordinates: true,
      alignment: THREE.SpriteAlignment.center,
      color: this.plainColor } );

  var bgItem = new THREE.Sprite( bgMaterial );
  bgItem.scale.set( this.bgSize, this.bgSize, 1.0 );

  var item = new THREE.Object3D();
  item.add(iconItem);
  item.add(bgItem);

  this.menu.add(item);
};


/**
 * The scene is where everything is placed, from objects, to lights and cameras.
 * @constructor
 */
GZ3D.Scene = function()
{
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

  this.isTouchDevice = 'ontouchstart' in window // works on most browsers
      || 'onmsgesturechange' in window; // works on ie10

  // only support one heightmap for now.
  this.heightmap = null;

  this.selectedEntity = null;
  this.mouseEntity = null;
  this.selectedModel = null;

  this.manipulationMode = 'view';

  this.renderer = new THREE.WebGLRenderer({antialias: true });
  this.renderer.setClearColor(0xb2b2b2, 1); // Sky
  this.renderer.setSize( window.innerWidth, window.innerHeight);
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
  this.killCameraControl = false;

  this.showCollisions = false;

  // Material for simple shapes being spawned (grey transparent)
  this.spawnedShapeMaterial = new THREE.MeshPhongMaterial(
      {color:0xffffff, shading: THREE.SmoothShading} );
  this.spawnedShapeMaterial.transparent = true;
  this.spawnedShapeMaterial.opacity = 0.5;

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
  if (this.isTouchDevice)
  {
    this.modelManipulator = new GZ3D.Manipulator(this.camera, true,
      this.getDomElement());
  }
  else
  {
    this.modelManipulator = new GZ3D.Manipulator(this.camera, false,
      this.getDomElement());
  }
  this.timeDown = null;

  this.controls = new THREE.OrbitControls(this.camera);

  this.emitter = new EventEmitter2({ verbose: true });

  // SSAO
  this.effectsEnabled = false;
  // depth
  var depthShader = THREE.ShaderLib[ 'depthRGBA'];
  var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

  this.depthMaterial = new THREE.ShaderMaterial( {
      fragmentShader: depthShader.fragmentShader,
      vertexShader: depthShader.vertexShader,
      uniforms: depthUniforms } );
  this.depthMaterial.blending = THREE.NoBlending;

  // postprocessing
  this.composer = new THREE.EffectComposer(this.renderer );
  this.composer.addPass( new THREE.RenderPass(this.scene,this.camera));

  this.depthTarget = new THREE.WebGLRenderTarget( window.innerWidth,
      window.innerHeight, { minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );

  var effect = new THREE.ShaderPass( THREE.SSAOShader );
  effect.uniforms[ 'tDepth' ].value = this.depthTarget;
  effect.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
  effect.uniforms[ 'cameraNear' ].value = this.camera.near;
  effect.uniforms[ 'cameraFar' ].value = this.camera.far;
  effect.renderToScreen = true;
  this.composer.addPass( effect );

  // Radial menu (only triggered by touch)
  this.radialMenu = new GZ3D.RadialMenu(this.getDomElement());
  this.scene.add(this.radialMenu.menu);

  // Bounding Box
  var vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),

    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ];
  var boxGeometry = new THREE.Geometry();
  boxGeometry.vertices.push(
    vertices[0], vertices[1],
    vertices[1], vertices[2],
    vertices[2], vertices[3],
    vertices[3], vertices[0],

    vertices[4], vertices[5],
    vertices[5], vertices[6],
    vertices[6], vertices[7],
    vertices[7], vertices[4],

    vertices[0], vertices[4],
    vertices[1], vertices[5],
    vertices[2], vertices[6],
    vertices[3], vertices[7]
  );
  this.boundingBox = new THREE.Line(boxGeometry,
      new THREE.LineBasicMaterial({color: 0xffffff}),
      THREE.LinePieces);
  this.boundingBox.visible = false;
};

/**
 * Window event callback
 * @param {} event - click or tap events (select/deselect models and manipulators)
 */
GZ3D.Scene.prototype.onPointerDown = function(event)
{
  event.preventDefault();

  var pointer, mainPointer = true;
  if (event.touches)
  {
    // Cancel in case of multitouch
    if (event.touches.length !== 1)
    {
      return;
    }
    pointer = event.touches[ 0 ];
  }
  else
  {
    pointer = event;
    if (pointer.which !== 1)
    {
      mainPointer = false;
    }
  }

  // X-Y coordinates of where mouse clicked
  var pos = new THREE.Vector2(pointer.clientX, pointer.clientY);

  // See if there's a model on the direction of the click
  var intersect = new THREE.Vector3();
  var model = this.getRayCastModel(pos, intersect);

  if (intersect)
  {
    this.controls.target = intersect;
  }

  // View mode
  if (this.manipulationMode === 'view')
  {
    this.killCameraControl = false;
    return;
  }

  // Manipulation modes
  // Model found
  if (model)
  {
    // Do nothing to the floor plane
    if (model.name === 'plane')
    {
      this.killCameraControl = false;
      this.timeDown = new Date().getTime();
    }
    // Do not attach manipulator to itself
    else if (this.modelManipulator.pickerNames.indexOf(model.name) >= 0)
    {
      this.killCameraControl = false;
    }
    // Attach manipulator to model
    else if (model.name !== '')
    {
      if (mainPointer && model.parent === this.scene)
      {
        this.attachManipulator(model, this.manipulationMode);
      }
    }
    // Manipulator pickers, for mouse
    else if (this.modelManipulator.hovered)
    {
      this.modelManipulator.update();
      this.modelManipulator.object.updateMatrixWorld();
      this.mouseEntity = this.selectedEntity;
      this.killCameraControl = true;
    }
    // Sky
    else
    {
      this.killCameraControl = false;
      this.timeDown = new Date().getTime();
    }
  }
  // Plane from below, for example
  else
  {
    this.killCameraControl = false;
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

  // The mouse is not holding anything
  this.mouseEntity = null;

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

  // F2 for turning on effects
  if (event.keyCode === 113)
  {
    this.effectsEnabled = !this.effectsEnabled;
  }

  // Esc/R/T for changing manipulation modes
  if (event.keyCode === 27) // Esc
  {
    this.setManipulationMode('view');
    $( '#view-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  if (event.keyCode === 82) // R
  {
    this.setManipulationMode('rotate');
    $( '#rotate-mode' ).click();
    $('input[type="radio"]').checkboxradio('refresh');
  }
  if (event.keyCode === 84) // T
  {
    this.setManipulationMode('translate');
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
  var projector = new THREE.Projector();
  var vector = new THREE.Vector3(
      ((pos.x - this.renderer.domElement.offsetLeft)
      / window.innerWidth) * 2 - 1,
      -((pos.y - this.renderer.domElement.offsetTop)
      / window.innerHeight) * 2 + 1, 1);
  projector.unprojectVector(vector, this.camera);
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

      if (model.name === 'grid')
      {
        model = null;
        continue;
      }

      while (model.parent !== this.scene)
      {
        // Select handle instead of background object
        if (this.mode !== 'view' &&
            model.parent.parent === this.modelManipulator.gizmo &&
            model.name !== '')
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
  // -spawning
  // -manipulating
  // -using radial menu
  if (this.killCameraControl || this.modelManipulator.hovered)
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

  if (this.effectsEnabled)
  {
    this.scene.overrideMaterial = this.depthMaterial;
    this.renderer.render(this.scene, this.camera, this.depthTarget);
    this.scene.overrideMaterial = null;
    this.composer.render();
  }
  else
  {
    this.renderer.render(this.scene, this.camera);
  }
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

  this.renderer.setSize( width, height);
  this.render();
};

/**
 * Add object to the scene
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.add = function(model)
{
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
  return this.scene.getObjectByName(name, true);
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
      this.modelManipulator.hovered && this.mouseEntity)
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

/**
 * Create grid and add it to the scene
 */
GZ3D.Scene.prototype.createGrid = function()
{
  var grid = new THREE.GridHelper(10, 1);
  grid.name = 'grid';
  grid.position.z = 0.05;
  grid.rotation.x = Math.PI * 0.5;
  grid.castShadow = false;
  // Color1: Central cross, Color2: grid
  // 0xCCCCCC = 80%,80%,80% / 0x4D4D4D = 30%,30%,30%
  grid.setColors(new THREE.Color( 0xCCCCCC ),new THREE.Color( 0x4D4D4D ));
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  this.scene.add(grid);
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
  var material =  new THREE.MeshPhongMaterial(
      {color:0xbbbbbb, shading: THREE.SmoothShading} ); // Later Gazebo/Grey
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
  var mesh = new THREE.Mesh(geometry, this.spawnedShapeMaterial);
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
  var mesh = new THREE.Mesh(geometry, this.spawnedShapeMaterial);
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
  var geometry = new THREE.CubeGeometry(width, height, depth, 1, 1, 1);

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

  var mesh = new THREE.Mesh(geometry, this.spawnedShapeMaterial);
  mesh.castShadow = true;
  return mesh;
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
    var tex = THREE.ImageUtils.loadTexture(texture);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    material.map = tex;
  }

  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  return mesh;
};

/**
 * Load heightmap
 * @param {} heights
 * @param {} width
 * @param {} height
 * @param {} segmentWidth
 * @param {} segmentHeight
 * @param {} textures
 * @param {} blends
 * @param {} parent
 */
GZ3D.Scene.prototype.loadHeightmap = function(heights, width, height,
    segmentWidth, segmentHeight, origin, textures, blends, parent)
{
  if (this.heightmap)
  {
    return;
  }
  // unfortunately large heightmaps kills the fps and freeze everything so
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

  // flip the heights
  var vertices = [];
  for (var h = segmentHeight-1; h >= 0; --h)
  {
    for (var w = 0; w < segmentWidth; ++w)
    {
      vertices[(segmentHeight-h-1)*segmentWidth  + w]
          = heights[h*segmentWidth + w];
    }
  }

  // sub-sample
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

  var mesh;
  if (textures && textures.length > 0)
  {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeTangents();

    var textureLoaded = [];
    var repeats = [];
    for (var t = 0; t < textures.length; ++t)
    {
      textureLoaded[t] = THREE.ImageUtils.loadTexture(textures[t].diffuse,
          new THREE.UVMapping());
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
    for (var b = blends.length; tt < 2; ++b)
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
        lightDir = allObjects[l].position;
        lightDiffuse = allObjects[l].color;
        break;
      }
    }

    var material = new THREE.ShaderMaterial({
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
      attributes: {},
      vertexShader: document.getElementById( 'heightmapVS' ).innerHTML,
      fragmentShader: document.getElementById( 'heightmapFS' ).innerHTML
    });

    mesh = new THREE.Mesh( geometry, material);
  }
  else
  {
    mesh = new THREE.Mesh( geometry,
        new THREE.MeshPhongMaterial( { color: 0x555555 } ) );
  }

  mesh.position.x = origin.x;
  mesh.position.y = origin.y;
  mesh.position.z = origin.z;
  parent.add(mesh);

  this.heightmap = parent;
};

/**
 * Load mesh
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 */
GZ3D.Scene.prototype.loadMesh = function(uri, submesh, centerSubmesh,
    callback)
{
  var uriPath = uri.substring(0, uri.lastIndexOf('/'));
  var uriFile = uri.substring(uri.lastIndexOf('/') + 1);

  // load urdf model
  if (uriFile.substr(-4).toLowerCase() === '.dae')
  {
    return this.loadCollada(uri, submesh, centerSubmesh, callback);
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

/**
 * Load collada file
 * @param {string} uri
 * @param {} submesh
 * @param {} centerSubmesh
 * @param {function} callback
 */
GZ3D.Scene.prototype.loadCollada = function(uri, submesh, centerSubmesh,
    callback)
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
  // var loader = new ColladaLoader2();
  // loader.options.convertUpAxis = true;
  var thatURI = uri;
  var thatSubmesh = submesh;
  var thatCenterSubmesh = centerSubmesh;

  loader.load(uri, function(collada)
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
    this.scene.meshes[thatURI] = dae;
    dae = dae.clone();
    this.scene.useColladaSubMesh(dae, thatSubmesh, centerSubmesh);

    dae.name = uri;
    callback(dae);
  });
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
 * Prepare collada by handling submesh-only loading
 * @param {} dae
 * @param {} submesh
 * @param {} centerSubmesh
 * @returns {THREE.Mesh} mesh
 */
GZ3D.Scene.prototype.useColladaSubMesh = function(dae, submesh, centerSubmesh)
{
  if (!submesh)
  {
    return null;
  }

  var mesh;
  var allChildren = [];
  dae.getDescendants(allChildren);
  for (var i = 0; i < allChildren.length; ++i)
  {
    if (allChildren[i] instanceof THREE.Mesh)
    {
      if (!submesh && !mesh)
      {
        mesh = allChildren[i];
      }

      if (submesh)
      {

        if (allChildren[i].geometry.name === submesh)
        {
          if (centerSubmesh)
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

            allChildren[i].position.x = 0;
            allChildren[i].position.y = 0;
            allChildren[i].position.z = 0;

            allChildren[i].parent.position.x = 0;
            allChildren[i].parent.position.y = 0;
            allChildren[i].parent.position.z = 0;
          }
          mesh = allChildren[i];
        }
        else
        {
          allChildren[i].parent.remove(allChildren[i]);
        }
      }
    }
  }
  return mesh;
};

/*GZ3D.Scene.prototype.setMaterial = function(mesh, texture, normalMap)
{
  if (!mesh)
  {
    return;
  }

  if (texture || normalMap)
  {
    // normal map shader
    var shader = THREE.ShaderLib['normalmap'];
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    if (texture)
    {
      uniforms['enableDiffuse'].value = true;
      uniforms['tDiffuse'].value = THREE.ImageUtils.loadTexture(texture);
    }
    if (normalMap)
    {
      uniforms['tNormal'].value = THREE.ImageUtils.loadTexture(normalMap);
    }

    var parameters = { fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader, uniforms: uniforms,
        lights: true, fog: false };
    var shaderMaterial = new THREE.ShaderMaterial(parameters);
    mesh.geometry.computeTangents();
    mesh.material = shaderMaterial;
  }
};*/

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
      if (ambient)
      {
        obj.material.ambient.setRGB(ambient[0], ambient[1], ambient[2]);
      }
      var diffuse = material.diffuse;
      if (diffuse)
      {
        obj.material.color.setRGB(diffuse[0], diffuse[1], diffuse[2]);
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
        var texture = THREE.ImageUtils.loadTexture(material.texture);
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
            THREE.ImageUtils.loadTexture(material.normalMap);
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
    this.killCameraControl = false;
    if (this.modelManipulator.object)
    {
      this.emitter.emit('poseChanged', this.modelManipulator.object);
    }
    this.hideBoundingBox();
    this.modelManipulator.detach();
    this.scene.remove(this.modelManipulator.gizmo);
    this.viewLightHelpers(false);
  }
  else
  {
    this.modelManipulator.mode = this.manipulationMode;
    this.modelManipulator.setMode( this.modelManipulator.mode );
    this.killCameraControl = false;
    this.viewLightHelpers(true);
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
    this.emitter.emit('poseChanged', this.modelManipulator.object);
  }
  if (this.modelManipulator.object !== model)
  {
    this.hideBoundingBox();
  }

  this.modelManipulator.attach(model);
  this.modelManipulator.mode = mode;
  this.modelManipulator.setMode( this.modelManipulator.mode );

  this.selectedEntity = model;
  this.mouseEntity = this.selectedEntity;
  this.scene.add(this.modelManipulator.gizmo);
  this.killCameraControl = false;
  this.showBoundingBox(model);
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
    this.showBoundingBox(model);
  }
};

/**
 * Show bounding box for a model. The box is aligned with the world.
 * @param {THREE.Object3D} model
 */
GZ3D.Scene.prototype.showBoundingBox = function(model)
{
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
  box.setFromObject(model);
  // center vertices with object
  box.min.x = box.min.x - model.position.x;
  box.min.y = box.min.y - model.position.y;
  box.min.z = box.min.z - model.position.z;
  box.max.x = box.max.x - model.position.x;
  box.max.y = box.max.y - model.position.y;
  box.max.z = box.max.z - model.position.z;

  var vertex = new THREE.Vector3(box.max.x, box.max.y, box.max.z); // 0
  this.boundingBox.geometry.vertices[0].copy(vertex);
  this.boundingBox.geometry.vertices[7].copy(vertex);
  this.boundingBox.geometry.vertices[16].copy(vertex);

  vertex.set(box.min.x, box.max.y, box.max.z); // 1
  this.boundingBox.geometry.vertices[1].copy(vertex);
  this.boundingBox.geometry.vertices[2].copy(vertex);
  this.boundingBox.geometry.vertices[18].copy(vertex);

  vertex.set(box.min.x, box.min.y, box.max.z); // 2
  this.boundingBox.geometry.vertices[3].copy(vertex);
  this.boundingBox.geometry.vertices[4].copy(vertex);
  this.boundingBox.geometry.vertices[20].copy(vertex);

  vertex.set(box.max.x, box.min.y, box.max.z); // 3
  this.boundingBox.geometry.vertices[5].copy(vertex);
  this.boundingBox.geometry.vertices[6].copy(vertex);
  this.boundingBox.geometry.vertices[22].copy(vertex);

  vertex.set(box.max.x, box.max.y, box.min.z); // 4
  this.boundingBox.geometry.vertices[8].copy(vertex);
  this.boundingBox.geometry.vertices[15].copy(vertex);
  this.boundingBox.geometry.vertices[17].copy(vertex);

  vertex.set(box.min.x, box.max.y, box.min.z); // 5
  this.boundingBox.geometry.vertices[9].copy(vertex);
  this.boundingBox.geometry.vertices[10].copy(vertex);
  this.boundingBox.geometry.vertices[19].copy(vertex);

  vertex.set(box.min.x, box.min.y, box.min.z); // 6
  this.boundingBox.geometry.vertices[11].copy(vertex);
  this.boundingBox.geometry.vertices[12].copy(vertex);
  this.boundingBox.geometry.vertices[21].copy(vertex);

  vertex.set(box.max.x, box.min.y, box.min.z); // 7
  this.boundingBox.geometry.vertices[13].copy(vertex);
  this.boundingBox.geometry.vertices[14].copy(vertex);
  this.boundingBox.geometry.vertices[23].copy(vertex);

  this.boundingBox.geometry.verticesNeedUpdate = true;

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
  if(this.manipulationMode === 'view')
  {
    var pos = new THREE.Vector2(event.clientX, event.clientY);
    var model = this.getRayCastModel(pos, new THREE.Vector3());

    if(model && model.name !== '' && model.name !== 'plane' &&
        this.modelManipulator.pickerNames.indexOf(model.name) === -1)
    {
      callback(model);
    }
  }
};

/**
 * Show or hide light helpers
 * @param {boolean} view
 */
GZ3D.Scene.prototype.viewLightHelpers = function(view)
{
  var allObjects = [];
  this.scene.getDescendants(allObjects);
  for (var l = 0; l < allObjects.length; ++l)
  {
    if (allObjects[l] instanceof THREE.Light)
    {
      if (view)
      {
        allObjects[l].parent.children[1].visible = true;
      }
      else
      {
        allObjects[l].parent.children[1].visible = false;
      }
    }
  }
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
};

/**
 * Initialize SpawnModel
 */
GZ3D.SpawnModel.prototype.init = function()
{
  this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  this.projector = new THREE.Projector();
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

  // Kill camera controls
  this.scene.killCameraControl  = true;

  this.callback = callback;

  this.obj = new THREE.Object3D();
  var mesh;
  if (entity === 'box')
  {
    mesh = this.scene.createBox(1, 1, 1);
    this.obj.name = 'unit_box_' +  (new Date()).getTime();
  }
  else if (entity === 'sphere')
  {
    mesh = this.scene.createSphere(0.5);
    this.obj.name = 'unit_sphere_' + (new Date()).getTime();
  }
  else if (entity === 'cylinder')
  {
    mesh = this.scene.createCylinder(0.5, 1.0);
    this.obj.name = 'unit_cylinder_' + (new Date()).getTime();
  }

  // temp model appears within current view
  var pos = new THREE.Vector2(window.window.innerWidth/2, window.innerHeight/2);
  var intersect = new THREE.Vector3();
  this.scene.getRayCastModel(pos, intersect);

  this.obj.add(mesh);
  this.obj.position.x = intersect.x;
  this.obj.position.y = intersect.y;
  this.obj.position.z += 0.5;
  this.scene.add(this.obj);

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
  // Re-enable camera controls
  this.scene.killCameraControl = false;
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
  // https://bitbucket.org/osrf/gzweb/pull-request/14/switch-to-arrow-mode-when-spawning-models/diff
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
  var vector = new THREE.Vector3( (positionX / window.containerWidth) * 2 - 1,
        -(positionY / window.containerHeight) * 2 + 1, 0.5);
  this.projector.unprojectVector(vector, this.scene.camera);
  this.ray.set(this.scene.camera.position,
      vector.sub(this.scene.camera.position).normalize());
  var point = this.ray.intersectPlane(this.plane);
  point.z = this.obj.position.z;

  if(this.snapDist)
  {
    point.x = Math.round(point.x / this.snapDist) * this.snapDist;
    point.y = Math.round(point.y / this.snapDist) * this.snapDist;
  }

  this.scene.setPose(this.obj, point, new THREE.Quaternion());
};
