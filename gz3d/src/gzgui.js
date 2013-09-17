/*global $:false */

var guiEvents = new EventEmitter2({ verbose: true });

$(function() {
  $( '#box' ).button({
    text: false,
    icons: {
      primary: 'toolbar-box'
    }
  })
  .click(function() {
    guiEvents.emit('entity_create', 'box');
  });

  $( '#sphere' ).button({
    text: false,
    icons: {
      primary: 'toolbar-sphere'
    }
  })
  .click(function() {
    guiEvents.emit('entity_create', 'sphere');
  });

  $( '#cylinder' ).button({
    text: false,
    icons: {
      primary: 'toolbar-cylinder'
    }
  })
  .click(function() {
    guiEvents.emit('entity_create', 'cylinder');
  });

  $( '#play' ).button({
    text: false,
    icons: {
      primary: 'ui-icon-play'
    }
  })
  .click(function() {
    var options;
    if ( $( this ).text() === 'Play' )
    {
      guiEvents.emit('pause', false);
    } else
    {
      guiEvents.emit('pause', true);
    }
  });
});

  $(function() {
    $( '#menu' ).menu();
    $( '#reset-model' )
    .click(function() {
      guiEvents.emit('model_reset');
    });
    $( '#reset-world' )
    .click(function() {
      guiEvents.emit('world_reset');
    });
  });

GZ3D.Gui = function(scene)
{
  this.scene = scene;
  this.domElement = scene.getDomElement();
  this.init();
  this.emitter = new EventEmitter2({ verbose: true });
};

GZ3D.Gui.prototype.init = function()
{
  this.spawnModel = new GZ3D.SpawnModel(
      this.scene, this.scene.getDomElement());

  var that = this;
  guiEvents.on('entity_create',
      function (entity)
      {
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
};

GZ3D.Gui.prototype.setPaused = function(paused)
{
  var options;
  if (paused)
  {
    options =
    {
      label: 'Play',
      icons: { primary: 'ui-icon-play' }
    };
  }
  else
  {
    options =
    {
      label: 'Pause',
      icons: { primary: 'ui-icon-pause' }
    };
  }
  $('#play').button('option', options);
};
