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
  this.bgSizeSelected = 68;
  this.highlightSize = 45;
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
  this.highlightColor = new THREE.Color( 0x22aadd );

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
  this.addItem('transparent','style/images/transparent.png');
  this.addItem('wireframe','style/images/wireframe.png');

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
    this.menu.children[i].children[2].visible = false;
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
  if (this.showing)
  {
    return;
  }

  this.model = model;
  var pointer = this.getPointer(event);
  this.startPosition = pointer;

  this.menu.getObjectByName('transparent').isHighlighted = false;
  this.menu.getObjectByName('wireframe').isHighlighted = false;
  if (this.model.viewAs === 'transparent')
  {
    this.menu.getObjectByName('transparent').isHighlighted = true;
  }
  if (this.model.viewAs === 'wireframe')
  {
    this.menu.getObjectByName('wireframe').isHighlighted = true;
  }

  for ( var i in this.menu.children )
  {
    this.menu.children[i].children[0].visible = true;
    this.menu.children[i].children[1].visible = true;
    this.menu.children[i].children[2].visible = this.menu.children[i].isHighlighted;
    this.menu.children[i].children[0].position.set(pointer.x,pointer.y,0);
    this.menu.children[i].children[1].position.set(pointer.x,pointer.y,0);
    this.menu.children[i].children[2].position.set(pointer.x,pointer.y,0);
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
    this.menu.children[i].children[2].position.x = X + this.startPosition.x;
    this.menu.children[i].children[2].position.y = Y + this.startPosition.y;

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
 * @param {string} type - delete/translate/rotate/transparent/wireframe
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

  // Icon highlight
  var highlightMaterial = new THREE.SpriteMaterial({
      map: this.bgShape,
      useScreenCoordinates: true,
      alignment: THREE.SpriteAlignment.center,
      color: this.highlightColor});

  var highlightItem = new THREE.Sprite(highlightMaterial);
  highlightItem.scale.set(this.highlightSize, this.highlightSize, 1.0);
  highlightItem.visible = false;

  var item = new THREE.Object3D();
  item.add(iconItem);
  item.add(bgItem);
  item.add(highlightItem);
  item.isHighlighted = false;
  item.name = type;

  this.menu.add(item);
};
