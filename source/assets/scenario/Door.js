const _CanCollect = require('../../engine/assets/_CanCollect');
const Sprite = require('../../engine/core/Sprite');

class Door extends _CanCollect {

	constructor(type, x0, y0, stage, frame) {
    
    let props = {
      name: "door",
      type: type,
      stage: stage
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite('scenario');

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }

    let canCollectProps = {
      canRespawn: false
    }
    
    super(props, position, dimension, sprite, events, canCollectProps);

    this.type = 'door';

    this.openSound = false;

    //this.handleProps();
    this.initSounds();

    this.group = "items";
    this.frame = frame;
  }

  /*
    # Sounds
  */
  initSounds() {
    // Open
    this.openSound = new Howl({ src: ['./sounds/scenarios/door-open.mp3'], volume: 0.4 });
  }

  checkSavedItemState() {
    let savedItemsState = JSON.parse( localStorage.getItem('lostsoul__itemsState') );  
    if( savedItemsState ) {
      let itemSavedState = savedItemsState[this.getName()];
      if( itemSavedState && itemSavedState.collected === true ){ // Check if this item is already grabbed
        this.collect();
        this.asset.visible = false;
        //this.destroy(); // Essa linha gera um erro do Phaser, então temporariamente estou ocultando este item da tela através do seu X
        this.setX(-999);
      }
    }  
  }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      case "gray":
        this.setCode('gray');
        break;
      case "yellow":
        this.setCode('yellow');
        break;
      case "green":
        this.setCode('green');
        break;
      case "blue":
        this.setCode('blue');
        break;
      case "light-blue":
        this.setCode('light-blue');
        break;
      case "red":
        this.setCode('red');
        break;
      case "orange":
        this.setCode('orange');
        break;
    }
    this.setNeedSaveState(true);
    
  }

  // Handle props when load
  handleProps() {
    // Check if this item was saved before and change it props
    this.checkSavedItemState();
  }

  // Open door = hide all doors with same code 
  open() {
    let objs = window.game.scenario.getStaticItems();
    for (let i in objs) {
      if( objs[i].type == 'door' ) {
        if( objs[i].getCode() == this.getCode() ) {
          this.openSound.play();
          window.game.playSuccessSound();
          objs[i].collect();
          objs[i].destroy();
        }
      }
    }
  }

}//class
module.exports = Door;