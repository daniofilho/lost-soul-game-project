const _Collidable = require('../../engine/assets/_Collidable');
const Sprite = require('../../engine/core/Sprite');

class Floor extends _Collidable {

	constructor(type, x0, y0, frame) {
    
    let props = {
      name: "Floor",
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
      stopOnCollision: false,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, sprite, events);

    this.group = 'floor';
    this.frame = frame;
  } 

  // # Sprites  
  setSpriteType(type) {
    // Não há necessidade
  }

  collision(player){ 
    player.setTeleporting(false);
    return true; 
  }

}//class
module.exports = Floor;