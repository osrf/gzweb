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

      });
};
