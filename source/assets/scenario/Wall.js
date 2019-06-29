const _Collidable = require('../../engine/assets/_Collidable');
const Sprite = require('../../engine/core/Sprite');

class Wall extends _Collidable {

	constructor(type, x0, y0) {
    
    let props = {
      name: "Wall",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite( 'scenario' );

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, sprite, events);

    this.group = 'wall';

  }

  // # Sprites
    
  setSpriteType(type) {
    switch(type) {
      case "agua-funda":
        this.sprite.setSpriteIndex(26);
        break;
    }
  }

}//class
module.exports = Wall;