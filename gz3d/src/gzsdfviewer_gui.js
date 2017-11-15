var guiEvents = new EventEmitter2({ verbose: true });

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
  this.scene.grid.visible = true;

};

