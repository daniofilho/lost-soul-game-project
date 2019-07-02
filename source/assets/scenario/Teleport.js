const _Collidable = require('../../engine/assets/_Collidable');
const Sprite = require('../../engine/core/Sprite');

class Teleport extends _Collidable {

	constructor(x, y, tpProps) {
    
    let props = {
      name: "Teleport",
      type: 'teleport'
    }

    let position = {
      x: x,
      y: y
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite( 'teleport' );

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    super(props, position, dimension, sprite, events);
    
    this.props = tpProps;
    this.sprite.setSpriteIndex(0);
    this.group = "teleport";

  }

  // # Sprites
  setSpriteType(type) {
    switch(type) {
      default:
        this.spriteProps = { 
          clip_x: 0, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
      break;
    }
  }

  // Collision Event
  collision(player, scenario) {

    this.teleport( player );
    
    // Make everything dark
    window.game.loading(true);
    
    // Change stage
    scenario.setStage( 
      this.props.target.stage,
      false // firstStage ?
    );

    window.game.loading(false);
      
  }

  teleport( player ) {
    player.setX(this.props.target.x);// This is the X position of player HEADER. Remeber that collision box is on player foot
    player.setY(this.props.target.y);
  }

}//class
module.exports = Teleport;