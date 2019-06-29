const _Collidable = require('../../engine/assets/_Collidable');
const Sprite = require('../../engine/core/Sprite');

class Floor extends _Collidable {

	constructor(type, x0, y0) {
    
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
  } 

  // # Sprites  
  setSpriteType(type) {
    switch(type) {
      case "areia":
        this.sprite.setSpriteIndex(0);
        break;
      case "agua-rasa":
        this.sprite.setSpriteIndex(13);
        break;
      case "grama":
        this.sprite.setSpriteIndex(39);
        break;
      case "grama-clara":
        this.sprite.setSpriteIndex(52);
        break;
    }
  }

  collision(player){ 
    player.setTeleporting(false);
    return true; 
  }

}//class
module.exports = Floor;