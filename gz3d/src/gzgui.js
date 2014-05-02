/*global $:false */

var guiEvents = new EventEmitter2({ verbose: true });

// Bind events to buttons
$(function()
{
  //Initialize
  // Toggle items unchecked
  $('#view-collisions').buttonMarkup({icon: 'false'});

  $( '#clock-touch' ).popup('option', 'arrow', 't');

  // Panel starts open for wide screens
  if ($(window).width() / parseFloat($('body').css('font-size')) > 35)
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

    $('#insert-header-fieldset')
        .css('position', 'absolute')
        .css('right', '40.4em')
        .css('top', '0em')
        .css('z-index', '1000');

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

    $('#insert-menu')
        .css('display', 'none')
        .css('background-color', '#2a2a2a')
        .css('padding', '10px')
        .css('z-index', '1000')
        .css('width', '100%');
  }

  $('.header-button')
      .css('float', 'left')
      .css('height', '1.45em')
      .css('padding', '0.65em');

  $('#insertButton').click(function(){
        $('#leftPanel').panel('close');
        $('#insert-menu').slideToggle('fast');
    });

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
        }
        else
        {
          guiEvents.emit('pause', true);
        }
      });
  $('#clock').click(function()
      {
        if ($.mobile.activePage.find('#clock-touch').parent().hasClass('ui-popup-active'))
        {
          $( '#clock-touch' ).popup('close');
        }
        else
        {
          var position = $('#clock').offset();
          $('#clock-touch').popup('open', {
              x:position.left+1.6*parseFloat($('body').css('font-size')),
              y:4*parseFloat($('body').css('font-size'))});
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
  $('#view-collisions').click(function()
      {
        guiEvents.emit('show_collision');
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

  var that = this;

  // On guiEvents, emitter events
  guiEvents.on('manipulation_mode',
      function(mode)
      {
        that.scene.setManipulationMode(mode);
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
            });
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
      }
  );

  guiEvents.on('model_reset', function()
      {
        that.emitter.emit('reset', 'model');
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
        }
        else
        {
          $('#view-collisions').buttonMarkup({icon: 'check'});
        }
      }
  );

  guiEvents.on('close_panel', function()
      {
        if ($(window).width() / parseFloat($('body').css('font-size')) < 35)
        {
          $('#leftPanel').panel('close');
        }
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
        '<img style="height:1.2em" src="style/images/pause.png" title="Pause">');
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
