const gameProperties = require('../../gameProperties');
const scenarioMain = require('../../assets/scenario/scenarioMain');
const GlobalAssets = require('../assets/GlobalAssets');
const Phaser = require('phaser');

class Game extends Phaser.Scene {

  constructor() {

    super( {key: 'game', active: true } );

    this.phaser = null;
    this.phaserScene = null;

    // FPS Control
    this.fpsInterval = null; 
    this.now = null;
    this.deltaTime = null; 
    this.elapsed = null;

    // Events
    this.keysDown = {};
    this.keysPress = {};
    this.cursors = null;

    // Pause
    this._pause = false;
    this.gameIsLoaded = false;

    // Items
    this.itemsState = new Object();

    // Game
    this.gameProps = new gameProperties();
    this.players = new Array();
    this.player = null;
    this.collision = null;
    this.defaultScenario = 'main';
    this.scenario = null;
    this.UI = null;
    this.currentStageName = '';

    this.gameReady = false;

    this.multiplayer = false;

    // Renders
    this.renderStatic = null;
    this.renderLayers = null;
    this.renderUI     = null;

    this.globalAssets = new GlobalAssets( this.gameProps.chunkSize );

    // Dialog Props
    this.defaultDialog = [ { hideSprite: true, text: "" } ];
    this.dialog = this.defaultDialog;
    this.dialogActive = false;
    this.dialogIndex = 0;
    this.firstKeyUpTrigger = true;

    // Sounds
    this.menuSoundSrc = "./sounds/main-menu.mp3";
    this.menuSound = false;

    this.successSoundSrc = "./sounds/scenarios/success.mp3";
    this.successSound = false;
    
    this.gameOverSoundSrc = "./sounds/scenarios/game-over.mp3";
    this.gameOverSound = false;

    this.scenarioSound = false;

    // Groups
    this.floorGroup = null;
    this.wallGroup = null;
    this.teleportGroup = null;

    this.initSound();
  }

  /* Phaser */

    preload() {
      
      this.load.spritesheet('player', 
        'assets/player-sprite.png',
        { frameWidth: 32, frameHeight: 64 }
      );
      
      this.load.spritesheet('scenario', 
        'assets/scenario/sprites/tilesetScenario.png',
        { frameWidth: 32, frameHeight: 32 }
      );
      
      this.load.spritesheet('teleport', 
        'assets/scenario/sprites/teleport.png',
        { frameWidth: 32, frameHeight: 32 }
      );

    }

    create(){
      // Grupos
      this.floorGroup = this.physics.add.staticGroup();
      this.wallGroup = this.physics.add.staticGroup();
      this.teleportGroup = this.physics.add.staticGroup();

      // Starta
      this.phaserScene = this;
      this.run('new');
    }

    update() {
      this.updateGame();
    }

  /* - - */

  initSound() {
    this.menuSound = new Howl({
      src: [this.menuSoundSrc],
      loop: true,
      volume: 0.6
    });
    this.menuSound.play();
    this.successSound = new Howl({
      src: [this.successSoundSrc],
      volume: 0.6
    });
    this.gameOverSound = new Howl({
      src: [this.gameOverSoundSrc]
    });
  }

  playSuccessSound() {
    this.scenarioSound.volume(0.2);
    this.successSound.play();
    this.successSound.on('end', () => { this.scenarioSound.volume(0.6); });
  }

  resetGroups() {
    // limpa os grupos existentes
  }

  // Gets
  isGameReady() { return this.gameReady; }
  getChunkSize() { return this.gameProps.chunkSize; }

  getCanvasWidth()  { return this.gameProps.canvasWidth;  }
  getCanvasHeight() { return this.gameProps.canvasHeight; }

  // Sets
  setGameReady(bool) { this.gameReady = bool; }

  setCurrentStage(stage){ this.currentStageName = stage; }
  getCurrentStage() { return this.currentStageName; }

  // Dialog
  isDialogActive(){ return this.dialogActive; }
  setDialogActive(bool) { this.dialogActive = bool; }
  setDialog( dialog) {
    this.dialog = dialog;
    this.setDialogActive(true);
  }
  resetDialog() {
    this.dialog = this.defaultDialog;
    this.dialogIndex = 0;
    this.setDialogActive(false);
    this.firstKeyUpTrigger = true;
  }
    
  // # Go to next dialog
	nextDialog() {
    if( this.isDialogActive() ) {
      if( this.firstKeyUpTrigger ) { // Ignore the first keyUp because it's triggering to next index right after the player activate the dialog
        this.firstKeyUpTrigger = false;
      } else {
        this.dialogIndex++;
        if( this.dialog[this.dialogIndex].hideSprite ) {
          this.resetDialog();
        }
      }
    }
	}

  // # Key up handle
	handleKeyUp(keyCode) {
    
    // Pause
    if( keyCode == 27 && this.gameIsLoaded ) { // ESQ
      this.togglePause();
    }

    // Dialog
		if (keyCode == 32 || keyCode == 69) { // Space or E
			this.nextDialog();
		} 
  
  }
  
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Default Event Listeners
  defaultEventListeners() {

    // Menu Clicks
    let menuItem = document.getElementsByClassName('menu-item');
    
    for (var i = 0; i < menuItem.length; i++) {
      let _this = this;
      menuItem[i].addEventListener('click', function() {
        _this.menuAction( this.getAttribute("data-action") );
      }, false);
    }

    // # Keyboard Events
    window.addEventListener('keydown', function(e) {
      this.keysDown[e.keyCode] = true;
    }.bind(this), false);

    window.addEventListener('keyup', function(e) {
      
      // Clear previous keys
      delete this.keysDown[e.keyCode];
      
      // Reset players look direction
      if( this.players) {
        this.players.map( (player) => {
          player.resetStep();
        });
      }
      
      // Player handle keyup
      if( this.players) {
        this.players.map( (player) => {
          player.handleKeyUp(e.keyCode);
        });
      }

      // Game Handle keyp
      this.handleKeyUp(e.keyCode);
      
    }.bind(this), false);

  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Start/Restart a Game

  refreshVariables() {

    // Clear save state
    localStorage.removeItem('lostsoul__itemsState');

    // Renders
    this.itemsState = new Object();

    this.players = new Array();
    this.collision = null;
    this.defaultScenario = 'main';
    this.scenario = null;
    this.UI = null;
    this.currentStageName = '';

    // Renders
    this.renderStatic = null;
    this.renderLayers = null;
    this.renderUI     = null;

  }

  startNewGame( saveData ) {
    
    this.refreshVariables();
   
    // # Scenario
    
      if( ! saveData ) {
        this.scenario = this.getScenario( this.defaultScenario);
      } else {
        this.scenario = this.getScenario( saveData.scenario.scenarioId, saveData );
      }
      
      this.scenarioSound = this.scenario.getScenarioSound();

    // # Players

      this.player = this.scenario.getPlayer();

      // Set player X and Y
      if( ! saveData ) {
        this.player.setStartPosition( this.scenario.getPlayerStartX(), this.scenario.getPlayerStartY() );
      } else {
        
        /*saveData.players.map( (player) => {
          switch(player.playerNumber){
            case 1:
              this.players[0].setStartPosition( player.x, player.y );
              break;
          }
        }); */
      }
   
    // Faz o player colidir com as paredes
      this.phaserScene.physics.add.collider(this.player.player, this.wallGroup); // preciso entender o motivo da variável player (que é a que preciso retornar) está dentro da própria player
    
    // O que acontece ao colidir com um TP
      this.phaserScene.physics.add.overlap(this.player.player, this.teleportGroup, (_player, teleport) => { this.checkTeleport(_player, teleport) } );

    // Make sure the game is not paused
      this.unpause();
    
    // Scenario sound
      //this.scenarioSound.play();

    // Flag 
      this.gameIsLoaded = true;
    
    // Ok, run the game now
      this.setGameReady(true);

      document.getElementById('loading').style.display = 'none';
      
  }//newGame

    // # The Game Loop
    updateGame() {

      if( ! this.gameReady ) return;
      
      // # Movements
      this.player.handleKeysEvent( this.cursors );
      
    }

    getScenario( scenario_id, saveData ) {

      // ItemsState
      if( saveData ) {
        localStorage.setItem( 'lostsoul__itemsState', JSON.stringify(saveData.scenario.items) );
      } else {
        localStorage.setItem( 'lostsoul__itemsState', JSON.stringify({}) ); // Clear previous savestate
      }

      switch(scenario_id) {
        case "main":
          return new scenarioMain(saveData);
          break;
      }

    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

    // Colliders
    checkTeleport(_player, teleport) {
      teleport.instance.collision(this.player, this.scenario ); // Usa a instância guardada ao invés da instância do Phaser que não tem as props de player
    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  
  // # Menu
  
  // @paused determine if the game came from a pause action or a new game (when page loads)
  mainMenu(paused) { 
    
    let divMenu = document.getElementById('mainMenu');

    // Set mainMenu class
    ( paused ) ? document.body.classList.add('paused') : '';
    ( paused ) ? '' : divMenu.classList.add('new-game');
    
    // Toggle Menu
    divMenu.classList.toggle('show');
    
  }
    // Handle Menu Action
    menuAction(action) {
      switch(action) {
        case 'continue':
          this.continueGame();
          break;
        case 'save':
          this.saveGame();
          break;
        case 'load':
          this.loadGame();
          break;
        case 'new':
          this.multiplayer = false;
          this.newGame(false);// false = won't load saveData
          break;
        case 'new-2-players':
          this.multiplayer = true;
          this.newGame(false);// false = won't load saveData
          break;
        case 'controls':
        case 'back-controls':
          document.getElementById('mainMenu').classList.toggle('show');
          document.getElementById('controls').classList.toggle('show');
          break;
      }
    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  
  // # New Game
  newGame(saveData) {
    
    if( this.menuSound ) {
      if( this.menuSound.playing() ) this.menuSound.stop();
    }

    this.pause();
    this.loading(true);
    setTimeout( () => {
      this.startNewGame(saveData); 
    }, 500 );
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Continue
  continueGame() {
    this.unpause();
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
 
  // # Save
  saveGame() {
    if( confirm('Salvar o jogo atual irá sobreescrever qualquer jogo salvo anteriormente. Deseja continuar?') ) {
      
      // Save items state first
      this.scenario.saveItemsState();

      let saveData = new Object();

      // Multiplayer
      saveData.multiplayer = this.multiplayer;

      // Scenario
      saveData.scenario = {
        scenarioId: this.scenario.getId(),
        stageId: this.scenario.getActualStageId(),
        items: this.getItemsState()
      }

      // Players
      saveData.players = new Array();
      this.players.map( (player) => {
        saveData.players.push({
          playerNumber: player.getPlayerNumber(),
          x: player.getX(),
          y: player.getY(),
          lifes: player.getLifes()
        });
      });
      
      // Convert to JSON
      saveData = JSON.stringify(saveData);
      
      // Save on LocalStorage
      localStorage.setItem( 'lostsoul__save', saveData );

      alert('Jogo salvo!');
    }
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Save
  loadGame() {
    
    // # Get data from localstorage and converts to json
    let saveData = JSON.parse( localStorage.getItem('lostsoul__save') );

    if( saveData ) {
      // Will be  multiplayer game?
      this.multiplayer = ( saveData ) ? saveData.multiplayer : false;

      // Replace items state on local storage with saved states
      localStorage.setItem( 'lostsoul__itemsState', JSON.stringify( saveData.scenario.items ) );

      // Load Items itens
      for( let i in saveData.scenario.items ) {
        this.addItemState( saveData.scenario.items[i] );
      };

      // # Loads a new game with save data
      this.newGame(saveData); 
    } else {
      alert('Não há jogo salvo previamente.')
    }
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Pause
  isPaused() { return this._pause; }
  pause() { 
    this._pause = true; 
    this.mainMenu(true);
    
    if( this.scenario ) this.scenario.sound.pause();

    //Hide Control screen
    document.getElementById('controls').classList.remove('show');
    
  }
  unpause() { 
    document.getElementById('mainMenu').classList.remove('show');
    this._pause = false; 
    
    this.menuSound.stop();
    if( this.scenario ) this.scenario.sound.play();
  }
  togglePause() { ( this.isPaused() ) ? this.unpause() : this.pause() }
  
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Loading
  loading(bool) {
    let display = ( bool ) ? 'flex' : 'none';
    document.getElementById('loading').style.display = display;
  }
  
  // # Loading
  gameOver(bool) {
    if( bool ) this._pause = true; 
    let display = ( bool ) ? 'flex' : 'none';
    document.getElementById('game-over').style.display = display;
    if( bool && this.gameOverSound ) {
      if( this.scenario ) this.scenario.sound.stop();
      this.gameOverSound.play();
    }
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  /*
    Items State
    - This are functions that handles items states between changing of stages. This will make an item to not respawn if it was collected before
  */
  
    getItemsState() { return this.itemsState; }
    addItemState( item ) { 
      this.itemsState[item.name_id] = item;  
    }

    saveItemsState() {
      let itemsState = JSON.stringify( this.getItemsState() );
      localStorage.setItem( 'lostsoul__itemsState', itemsState );
    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  
  // Helpers for classes to check if an object is colliding 
  checkCollision( object ) {
    if( this.isGameReady() )
      return this.collision.check(object);
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Run
  run(action) {
    
    this.cursors = this.input.keyboard.createCursorKeys();

    // Hide Elements
    document.getElementById('mainMenu').classList.remove('show');
    document.getElementById('gameCanvas').classList.remove('show');
    this.loading(false);
    this.gameOver(false);

    // Start the event listeners
    this.defaultEventListeners();

    // Shows Menu
    this.mainMenu(false);

    // Auto load a game - debug mode
    if( window.autoload ) {
      this.loadGame();
    } else {

      switch(action) {
        case 'new' :
          this.newGame();
          break;
      }

    }

  }

}
module.exports = Game;