const Game = require('./engine/core/Game');
const Phaser = require('phaser');
console.clear();

let game = new Game();
window.game = game;

let config = {
  type: Phaser.AUTO,
  width: game.gameProps.getProp('canvasWidth'),
  height: game.gameProps.getProp('canvasHeight'),
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: () => game.updateGame()
  }
};

function create(){
  window.game.run(this);
}

var PhaserGame = new Phaser.Game(config);

function preload () {
  window.game.setPhaser( PhaserGame );

  /*this.load.spritesheet('sprite_ui', 
    'assets/sprites/UI.png',
    { frameWidth: 32, frameHeight: 32 }
  );*/
  
  this.load.spritesheet('sprite_beach', 
    'assets/scenario/common/sprites/beach.png',
    { frameWidth: 32, frameHeight: 32 }
  );

  //this.load.image('sprite_enemy', 'assets/sprites/Enemy.png');
  //this.load.image('sprite_player_one', 'assets/sprites/player_one.png');
  //this.load.image('sprite_player_two', 'assets/sprites/player_two.png');
}
