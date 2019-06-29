const Game = require('./engine/core/Game');
const gameProperties = require('./gameProperties');
const Phaser = require('phaser');
console.clear();

let game = new Game();
window.game = game;
let gameProps = new gameProperties();

new Phaser.Game({
  type: Phaser.AUTO,
  width: gameProps.getProp('canvasWidth'),
  height: gameProps.getProp('canvasHeight'),
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  scene: [game]
});
