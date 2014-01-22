/*global $:false */

var guiEvents = new EventEmitter2({ verbose: true });

// Disable scrolling by touch
$(document).delegate('.ui-content', 'touchmove', false);

// Bind events to buttons
$(function() {
  //Initialize
  // Toggle items unchecked
  $('#view-effects').buttonMarkup({ icon: 'false' });
  $('#view-collisions').buttonMarkup({ icon: 'false' });

  // Panel starts open for wide screens
  if ($(window).width() / parseFloat($('body').css('font-size')) > 35)
  {
    $( '#leftPanel' ).panel( 'open' );
  }

  //Clicks/taps
  $( '#view-mode' ).click(function()
  {
    guiEvents.emit('manipulation_mode', 'view');
  });

  $( '#translate-mode' ).click(function()
  {
    guiEvents.emit('manipulation_mode', 'translate');
  });

  $( '#rotate-mode' ).click(function()
  {
    guiEvents.emit('manipulation_mode', 'rotate');
  });

  $( '#box' ).click(function()
  {
    guiEvents.emit('close_panel');
    guiEvents.emit('entity_create', 'box');
  });

  $( '#sphere' ).click(function()
  {
    guiEvents.emit('close_panel');
    guiEvents.emit('entity_create', 'sphere');
  });

  $( '#cylinder' ).click(function()
  {
    guiEvents.emit('close_panel');
    guiEvents.emit('entity_create', 'cylinder');
  });

  $( '#play' ).click(function() {
    if ( $('#playText').html() === '<img src="style/images/play.png">' )
    {
      guiEvents.emit('pause', false);
    }
    else
    {
      guiEvents.emit('pause', true);
    }
  });

  $( '#reset-model' ).click(function() {
    guiEvents.emit('model_reset');
  });

  $( '#reset-world' ).click(function() {
    guiEvents.emit('world_reset');
  });

  $( '#view-collisions' ).click(function() {
    guiEvents.emit('show_collision');
  });
  $( '#view-effects' ).click(function() {
    guiEvents.emit('show_effects');
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
  this.emitter = new EventEmitter2({ verbose: true });
};

/**
 * Initialize GUI
 */
GZ3D.Gui.prototype.init = function()
{
  this.spawnModel = new GZ3D.SpawnModel(
      this.scene, this.scene.getDomElement());

  var that = this;

  // On guiEvents, emitter events
  guiEvents.on('manipulation_mode',
      function (mode)
      {
        that.scene.setManipulationMode(mode);
      }
  );

  guiEvents.on('entity_create',
      function (entity)
      {
        // manually trigger view mode
        that.scene.setManipulationMode('view');
        $( '#view-mode' ).click();
        $('input[type="radio"]').checkboxradio('refresh');
        that.spawnModel.start(entity,
            function(obj)
            {
              that.emitter.emit('entityCreated', obj, entity);
            });
      }
  );

  guiEvents.on('world_reset',
      function ()
      {
        that.emitter.emit('reset', 'world');
      }
  );

  guiEvents.on('model_reset',
      function ()
      {
        that.emitter.emit('reset', 'model');
      }
  );

  guiEvents.on('pause',
      function (paused)
      {
        that.emitter.emit('pause', paused);
      }
  );

  guiEvents.on('show_effects',
      function ()
      {
        that.scene.effectsEnabled = !that.scene.effectsEnabled;
        if(!that.scene.effectsEnabled)
        {
            $('#view-effects').buttonMarkup({ icon: 'false' });
        }
        else
        {
            $('#view-effects').buttonMarkup({ icon: 'check' });
        }
      }
  );

  guiEvents.on('show_collision',
      function ()
      {
        that.scene.showCollision(!that.scene.showCollisions);
        if(!that.scene.showCollisions)
        {
            $('#view-collisions').buttonMarkup({ icon: 'false' });
        }
        else
        {
            $('#view-collisions').buttonMarkup({ icon: 'check' });
        }
      }
  );

  guiEvents.on('close_panel',
      function ()
      {
        if ($(window).width() / parseFloat($('body').css('font-size')) < 35)
        {
          $( '#leftPanel' ).panel( 'close' );
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
    $('#playText').html('<img src="style/images/play.png">');
  }
  else
  {
    $('#playText').html('<img src="style/images/pause.png">');
  }
};

/**
 * Update displayed real time
 * @param {string} realTime
 */
GZ3D.Gui.prototype.setRealTime = function(realTime)
{
  $('#real-time-value').text(realTime);
};

/**
 * Update displayed simulation time
 * @param {string} realTime
 */
GZ3D.Gui.prototype.setSimTime = function(simTime)
{
  $('#sim-time-value').text(simTime);
};
