/*global $:false */

var guiEvents = new EventEmitter2({ verbose: true });

var emUnits = function(value)
    {
      return value*parseFloat($('body').css('font-size'));
    };

// Assuming all mobile devices are touch devices.
var isTouchDevice = /Mobi/.test(navigator.userAgent);

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
  $('#view-transparent').buttonMarkup({icon: 'false'});
  $('#view-wireframe').buttonMarkup({icon: 'false'});
  $('#view-joints').buttonMarkup({icon: 'false'});
  guiEvents.emit('toggle_notifications');
  guiEvents.emit('show_orbit_indicator');

  $('#notification-popup-screen').remove();

  // Touch devices
  if (isTouchDevice)
  {
    $('.mouse-only')
        .css('display','none');

    $('#mode-header-fieldset')
        .css('position', 'absolute')
        .css('right', '0.5em')
        .css('top', '0.15em')
        .css('z-index', '1000');

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

  }
  // Mouse devices
  else
  {
    $('.touch-only')
        .css('display','none');

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

  $('[id^="header-insert-"]').click(function()
      {
        var entity = $(this).attr('id');
        entity = entity.substring(14); // after 'header-insert-'
        guiEvents.emit('closeTabs', false);
        guiEvents.emit('spawn_entity_start', entity);
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

  $( '#view-joints' ).click(function() {
    if ($('#view-joints a').css('color') === 'rgb(255, 255, 255)')
    {
      $('#model-popup').popup('close');
      guiEvents.emit('view_joints');
    }
  });

  $('#view-model').click(function(event){
    guiEvents.emit('view_sdf_model', event);
  });

  $('#material-file-input').change(function(event) {
    guiEvents.emit('materials_ready', event);
  });

  var $list = $('#list-of-files');
  $('#file-input').change(function(event) {
    guiEvents.emit('model_files_ready', event, $list);
  });

  $(window).resize(function()
  {
    guiEvents.emit('resizePanel');
  });
  // init();
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
  this.modelStatsDirty = false;
  this.listOfFiles = [];
  this.files_ready = false;

  var that = this;

  // throttle model pose updates, otherwise complex model kills framerate
  setInterval(function() {
    if (that.modelStatsDirty)
    {
      that.updateStats();
      that.modelStatsDirty = false;
    }
  }, 20);

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

  guiEvents.on('materials_ready', function(event)
    {
      that.emitter.emit('load_materials', event.target.files[0])
    }
  );

  guiEvents.on('view_sdf_model', function(event)
    {
     if(that.files_ready)
     {
       that.emitter.emit('load_files', that.listOfFiles);

       var load_model = document.getElementById('model-loading');
       load_model.style.display = 'none';

       var container = document.getElementById('container');
       container.style.display = '';

       animate();
     }
    }
  );

  guiEvents.on('model_files_ready', function(event, $list)
    {
      that.listOfFiles = event.target.files;

      // TODO: more comprehensive test later
      if(that.listOfFiles.length > 0 ){
        that.files_ready = true;
      }

      for (var i = 0, l = that.listOfFiles.length; i < l; ++i) {
        // console.log(listOfFiles[i]);
        $list.append($('<p>'+ that.listOfFiles[i].name +'</p>'));
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
              if (type === 'transparent')
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
    $('#model-popup').popup('open',
      {x: event.clientX + emUnits(6),
       y: event.clientY + emUnits(0)});
  }
};
