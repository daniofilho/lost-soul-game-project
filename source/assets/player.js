const Sprite = require('../engine/core/Sprite');

class Player {

	constructor(playerProps) {

    this.player = null;
    
    // # Sprite
      
      this.sprite = new Sprite('player');
      
      this.spriteProps = {};
      
      this.step = [];
      this.defaultStep = 1;
      this.initialStep = 2;
      this.stepCount = this.defaultStep;
      this.maxSteps = 8;

      // Controls the player FPS Animation
      this.fpsInterval = 1000 / 12; // 1000 / FPS
      this.deltaTime = Date.now();

      this.chunkSize = window.game.gameProps.getProp('chunkSize');
    
    // # Position
      this.x = 0;
      this.y = 0;
      
      this.x0 = 0; // initial position
      this.y0 = 0;
    
    // # Properties
      this.width = 32; //px
      this.height = 64; //px

      this.offsetWidth = 6;
      this.offsetHeight = 32;
      
      this.speed0 = 160;
      this.speed = this.speed0;
      
      this.name = "player";
      this.type = "player";

      this.grabing = false;
      this.walking = false;
      
    // # Events  
      
      this.isCollidable = true;
      this.isMoving = false;
      this.hideSprite = false;
      this.hasCollisionEvent = true;
      this.stopOnCollision = true;
    
      // https://phaser.io/tutorials/coding-tips-005

      // Collision
      this.collisionWidth = 20
      this.collisionHeight = 32;

      // Grab/Pick Items Collision Box
      this.grabBox = null;
      this.grabCollisionWidth0 = 20;
      this.grabCollisionHeight0 = 32;
      this.grabCollisionWidth = this.grabCollisionWidth0;
      this.grabCollisionHeight = this.grabCollisionHeight0;
      this.grabCollisionX = 0;
      this.grabCollisionY = 0;

      this.objectGrabbed = null;

      // # Life
      this.defaultLifes = 6;
      this.lifes = this.defaultLifes;
      
      this.canBeHurt = true;
      this.hurtCoolDownTime = 2000; //2s

      // Player Props if has
      if( playerProps ) {
        this.lifes = playerProps.lifes;
      }

      this.walkSound = false;
      this.useSound = false;
      this.hurtSound = false;
      this.grabSound = false;
      
      this.run();
  }

  getPlayer() {
    return this.player; 
  }

  /*
    # Sounds
  */
    initSounds() {
      // Walk
      this.walkSound = new Howl({ src: ['./sounds/player/walk.mp3'], loop: true, volume: 0.6 });
      // Use
      this.useSound = new Howl({ src: ['./sounds/player/use.mp3'] });
      // Hurt
      this.hurtSound = new Howl({ src: ['./sounds/player/hurt.mp3'], volume: 0.5 });
      // Grab
      this.grabSound = new Howl({ src: ['./sounds/player/grab.mp3'] });
    }

  /* 
      Grab/Pick Items Collision Box
  */

    checkGrabbingObjects() {
      /*
      let hasGrabObject = false;
      // Check if player has grabbed items
      let renderedItems = window.game.scenario.getStaticItems();
      for( let i in renderedItems ) {
        let item = renderedItems[i];
        if( item.grabbed && item.playerWhoGrabbed == this.playerNumber ) {
          let obj = item;
          
          obj.grabHandler(this.playerNumber);
          this.grabObject( obj );

          this.grabing = true;
          this.resetStep();
          hasGrabObject = true;

          return obj;
        }
      }
      
      if( ! hasGrabObject ) {
        this.setNotGrabbing();
      }
      return false;
      */
    }
    checkItemOnGrabCollisionBox() {
      return window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
    }
    
    isGrabing() { return this.grabing; }
    setNotGrabbing(){
      this.removeGrabedObject();
      this.resetStep();
    }
    removeGrabedObject() { 
      this.grabing = false;
      this.objectGrabbed = false;
    }
    triggerGrab(){

      // Check if has a "_CanGrab" item colliding with grab hit box and "pick" item
      if( ! this.isGrabing() ) {
        var willGrab;
        // Verifica se está colidindo
        willGrab = window.game.phaserScene.physics.overlap( this.grabBox, window.game.itemsGroup, ( grabBox, item ) => {
          if( item.instance.canGrab ) {
            item.instance.grabHandler();
            this.grabObject( item.instance );
            this.grabing = true;
          } else {
            willGrab = false;
          }
        } );
       
        if( !willGrab ) {
          this.grabSound.play();
          this.grabing = !this.grabing;
        }
        
      } else {
        if( this.objectGrabbed ) {
          // Drop if has nothing o player grab collision box
          let overlapingItems = window.game.phaserScene.physics.overlap( this.grabBox, window.game.itemsGroup );
          let overlapingWalls = window.game.phaserScene.physics.overlap( this.grabBox, window.game.wallGroup );
          
          if( !overlapingItems && !overlapingWalls ) {
            this.objectGrabbed.drop( this.spriteProps.direction, this.getHeight() ); // Throw away object
            this.objectGrabbed = false; // remove grabbed
            this.grabing = !this.grabing;
          }
        } else {
          this.grabSound.play();
          this.grabing = !this.grabing;
        }
      }
    }

    // Use items
    triggerUse() {
      // If has object in hand, use it
      if( this.objectGrabbed ) {
        this.objectGrabbed.use( this.spriteProps.direction, this.getHeight(), this );
      } else {
        /*
        // If not, try to use the one on front
        let object = window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
        if( object && object.canUse ) {
          object.useHandler( this.spriteProps.direction );
        } else {
          this.useSound.play();
        }*/
      }
    }

    getGrabBox(){ return this.grabBox; }
    getGrabCollisionHeight() { return this.grabCollisionHeight; }
    getGrabCollisionWidth() { return this.grabCollisionWidth; }
    getGrabCollisionX() {  return this.grabCollisionX; }
    getGrabCollisionY() {  return this.grabCollisionY; }

    // Attach an item to player
    grabObject( object ) {
      this.objectGrabbed = object;
      this.updateGrabbedObjectPosition();
    }

    // Set GrabCollision X and Y considering player look direction
    updateGrabCollision() {
      this.updateGrabCollisionXY();
      this.updateGrabCollisionSize();
    }
    updateGrabCollisionXY() {
      switch(this.spriteProps.direction) {
        case 'down':
          this.grabCollisionWidth = this.grabCollisionHeight0;
          this.grabCollisionHeight = this.grabCollisionWidth0;
          

          this.grabBox.setX( this.getX() );
          this.grabBox.setY( this.getY() + 58 );

          this.updateGrabCollisionSize();
          break;

        case  'up':
          this.grabCollisionWidth = this.grabCollisionHeight0;
          this.grabCollisionHeight = this.grabCollisionWidth0;
          

          this.grabBox.setX( this.getX() );
          this.grabBox.setY( this.getY() + 5 );

          this.updateGrabCollisionSize();
          break;
        
        case 'left':
          this.grabCollisionWidth = this.grabCollisionWidth0;
          this.grabCollisionHeight = this.grabCollisionHeight0;


          this.grabBox.setX( this.getX() - 20 );
          this.grabBox.setY( this.getY() + this.collisionHeight );

          this.updateGrabCollisionSize();
          break;
        
        case 'right':
          this.grabCollisionWidth = this.grabCollisionWidth0;
          this.grabCollisionHeight = this.grabCollisionHeight0;


          this.grabBox.setX( this.getX() + 20 );
          this.grabBox.setY( this.getY() + this.collisionHeight );

          this.updateGrabCollisionSize();
          break;
      }

      // If has some object grabbed, update position
      if( this.objectGrabbed ) {
        this.updateGrabbedObjectPosition();
      }
    }

    updateGrabbedObjectPosition() {
      this.objectGrabbed.updateX( this.getX() );
      this.objectGrabbed.updateY( this.getY() - this.objectGrabbed.getHeight() +  ( this.getHeight() * 0.1 )  );
    }

    updateGrabCollisionSize(){
      this.grabBox.setSize( this.grabCollisionWidth, this.grabCollisionHeight );
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
        
  /*
    Sprite / Animation
  */

    getSpriteProps() { return this.spriteProps; }

    
		hidePlayer() { this.hideSprite = true; }
    showPlayer() { this.hideSprite = false; }
    

  // # Controls the player FPS Movement independent of game FPS
    resetStep() {
      /*this.stepCount = this.defaultStep;
      switch ( this.spriteProps.direction ) {
        case 'left': 
          this.setLookDirection( this.lookLeft() );
          break;
        case 'right': 
          this.setLookDirection( this.lookRight() );
          break;
        case 'up': 
          this.setLookDirection( this.lookUp() );
          break;
        case 'down': 
          this.setLookDirection( this.lookDown() );
          break;
      }*/
    }
    
    setLookDirection(lookDirection) { this.lookDirection = lookDirection; }
		triggerLookDirection(direction) { 
      this.spriteProps.direction = direction;
      this.resetStep();
    }
		resetPosition() {
			this.setX( this.x0 );
      this.setY( this.y0 );
      this.setCollisionX( this.collisionX0 );
      this.setCollisionY( this.collisionY0 );
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
    
  /*
    Movement
  */
    
    setStartPosition(x, y) {
      this.setX( x );
      this.setY( y );
      this.x0 = x;
      this.y0 = y;
      this.checkGrabbingObjects();
    }

    getX() { return this.player.x; }
    getY() { return this.player.y; }
    
    getSpeed() { return this.speed; }

    setX(x) { 
      this.x = x; 
      this.player.setX(x);
      this.updateGrabCollisionXY();
    }
    setY(y) { 
      this.y = y; 
      this.player.setY(y);
      this.updateGrabCollisionXY();
    }
    
    setSpeed(speed) { this.speed = this.chunkSize * speed; }
    
		movLeft(up, down) { 
      let anim = ( this.grabing ) ? 'left-grab' : 'left';
      this.player.setVelocityX( -1 * this.speed );
      if( !up && !down ) {
        this.player.anims.play(anim, true);
        this.spriteProps.direction = 'left';
      }
      this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movRight(up, down) { 
      let anim = ( this.grabing ) ? 'right-grab' : 'right';
      this.player.setVelocityX( 1 * this.speed );
      if( !up && !down ) {
        this.player.anims.play(anim, true);
        this.spriteProps.direction = 'right';
      }
      this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movUp() { 
      let anim = ( this.grabing ) ? 'up-grab' : 'up';
      this.player.setVelocityY( -1 * this.speed );
      this.player.anims.play(anim, true);
      this.spriteProps.direction = 'up';
      this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movDown() {  
      let anim = ( this.grabing ) ? 'down-grab' : 'down';
      this.player.setVelocityY( 1 * this.speed );
      this.player.anims.play(anim, true);
      this.spriteProps.direction = 'down';
      this.updateGrabCollisionXY();
      this.walking = true;
    };

    iddle() {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.walking = false;
      this.walkSound.stop();
      
      let anim = 'iddle-up';

      switch( this.spriteProps.direction ) {
        case 'up':
          anim = ( this.grabing ) ? 'iddle-up-grab' : 'iddle-up';
          break;
        case 'down':
          anim = ( this.grabing ) ? 'iddle-down-grab' : 'iddle-down';
          break;
        case 'left':
          anim = ( this.grabing ) ? 'iddle-left-grab' : 'iddle-left';
          break;
        case 'right':
          anim = ( this.grabing ) ? 'iddle-right-grab' : 'iddle-right';
          break;
      }
      this.walking = false;
      this.player.anims.play(anim);
    }

    createActions() {
      
      let phaser = window.game.phaserScene;

      phaser.anims.create({
        key: 'down',
        frames: phaser.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
        frameRate: 15,
        repeat: -1
      });
      phaser.anims.create({
        key: 'down-grab',
        frames: phaser.anims.generateFrameNumbers('player', { start: 32, end: 39 }),
        frameRate: 15,
        repeat: -1
      });
      
      phaser.anims.create({
        key: 'up',
        frames: phaser.anims.generateFrameNumbers('player', { start: 8, end: 15 }),
        frameRate: 15,
        repeat: -1
      });
      phaser.anims.create({
        key: 'up-grab',
        frames: phaser.anims.generateFrameNumbers('player', { start: 40, end: 47 }),
        frameRate: 15,
        repeat: -1
      });
      
      phaser.anims.create({
        key: 'right',
        frames: phaser.anims.generateFrameNumbers('player', { start: 16, end: 23 }),
        frameRate: 15,
        repeat: -1
      });
      phaser.anims.create({
        key: 'right-grab',
        frames: phaser.anims.generateFrameNumbers('player', { start: 48, end: 55 }),
        frameRate: 15,
        repeat: -1
      });
      
      window.game.phaserScene.anims.create({
        key: 'left',
        frames: phaser.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
        frameRate: 15,
        repeat: -1
      });
      window.game.phaserScene.anims.create({
        key: 'left-grab',
        frames: phaser.anims.generateFrameNumbers('player', { start: 56, end: 63 }),
        frameRate: 15,
        repeat: -1
      });

      phaser.anims.create({
        key: 'iddle-down',
        frames: [ { key: 'player', frame: 0 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle-down-grab',
        frames: [ { key: 'player', frame: 32 } ],
        frameRate: 10
      });

      phaser.anims.create({
        key: 'iddle-up',
        frames: [ { key: 'player', frame: 8 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle-up-grab',
        frames: [ { key: 'player', frame: 40 } ],
        frameRate: 10
      });

      phaser.anims.create({
        key: 'iddle-right',
        frames: [ { key: 'player', frame: 16 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle-right-grab',
        frames: [ { key: 'player', frame: 48 } ],
        frameRate: 10
      });

      phaser.anims.create({
        key: 'iddle-left',
        frames: [ { key: 'player', frame: 24 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle-left-grab',
        frames: [ { key: 'player', frame: 56 } ],
        frameRate: 10
      });
      
    }

    handleKeysEvent( cursors ) {
      
      let left  = cursors.left.isDown;
      let right = cursors.right.isDown;
      let up    = cursors.up.isDown;
      let down  = cursors.down.isDown;
      let shift  = cursors.shift.isDown;

      // If dialog active, don't walk
      if( window.game.isDialogActive() ) return;
      
      if( left  && !right ) this.movLeft(up, down);
      if( right && !left )  this.movRight(up, down);
      if( left && right ) this.player.anims.play('iddle_right'); // Previne ficar com animação de andando quando ambas teclas estão apertadas
      if( up    && !down )  this.movUp();
      if( down  && !up )    this.movDown();
      if( up && down ) this.player.anims.play('iddle_down');

      if( !left && !right && !up && !down ) this.iddle();
      
      this.speed = (shift) ? this.speed0 *2 : this.speed0;
      
    }

    handleKeyDownEvent() {
      window.game.phaserScene.input.keyboard.on('keydown', function (e) {
        if (e.key == 'Control') this.triggerGrab();  // Grab => CTRL
        if (e.key == ' ') this.triggerUse();   // Use => Space
      }.bind(this), false);
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
		
  /*
    Collision
  */
    /*
    setCollisionX(x) { this.collisionX = x; }
    setCollisionY(y) { this.collisionY = y; }

    //The collision will be just half of the player height
    getCollisionHeight() { return this.collisionHeight; }
    getCollisionWidth() { return this.collisionWidth; }
    getCollisionX() {  return this.collisionX; }
    getCollisionY() {  return this.collisionY; }

    getCenterX( _x ) { // May get a custom centerX, used to check a future collision
      let x = ( _x ) ? _x : this.getCollisionX();
      return x + this.getCollisionWidth() / 2; 
    }
    getCenterY( _y ) { 
      let y = ( _y ) ? _y : this.getCollisionY();
      return y + this.getCollisionHeight() / 2; 
    }
    
    // Has a collision Event?
    triggersCollisionEvent() { return this.hasCollisionEvent; }

    // Will it Stop the other object if collides?
    stopIfCollision() { return this.stopOnCollision; }

		noCollision() {
			// What happens if the player is not colliding?
			this.setSpeed(this.speed0); // Reset speed
    }
      
    collision(object) {
      return this.isCollidable;
    };*/
		
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	/*
    Life / Heal / Death
  */	
    getLifes() { return this.lifes; }

    hurtPlayer( amount ) {
      if( this.canBeHurt ) {
        
        this.hurtSound.play();

        // Hurt player
        this.lifes -= amount;
        if( this.lifes < 0 ) this.lifes = 0;

        // Start cooldown
        this.canBeHurt = false;
        setTimeout( () => {
          this.canBeHurt = true;
          this.hideSprite = false;
        }, this.hurtCoolDownTime);

        // Check if player died
        this.checkPlayerDeath();
      }
    }

    healPlayer( amount ) {
      this.lifes += parseInt(amount);
      if( this.lifes > this.defaultLifes ) this.lifes = this.defaultLifes;
    }

    checkPlayerDeath() {
      if( this.lifes < 1 && !window.god_mode ) {
        window.game.gameOver(true);
      }
    }
  
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
		
    /*
      General
    */
        
      setHeight(height) { this.height = height; }
      setWidth(width) { this.width = width; }
      
      getPlayerNumber() { return this.playerNumber; }

      getColor() { return this.color; }
        
      getWidth() { return this.width; }
      getHeight() { return this.height; }
    
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
	
  /*  
    Render
  */
  		
	  render(ctx) {
      
      // Blink player if it can't be hurt
      if( ! this.canBeHurt ) {
        this.hideSprite = !this.hideSprite;
      }
      
      if ( this.hideSprite ) return;

      if( this.walking && !this.walkSound.playing() ) {
        this.walkSound.play();
      }
      
		};


    run() {
      this.initSounds();

      // Inicia o player do Phaser
      this.player = window.game.phaserScene.physics.add.sprite(0, 0, 'player');
      this.player
        .setOrigin(0, 0)
        .setSize( this.collisionWidth, this.collisionHeight, false)
        .setOffset( this.offsetWidth, this.offsetHeight)  // Move o box definido acima para outra posição
        .setFrame(0) // Frame inicial do personagem
        .setCollideWorldBounds(true) // Não deixa ele sair fora da tela
        .setDrag(2000); // faz o player "grudar" no chão, o que impede ele de andar eternamente quando aperta uma tecla de movimento

      //Inicia o colision box do player
      this.grabBox = window.game.phaserScene.physics.add.sprite(0, 0, 'teleport')
        .setFrame(0)
        .setOrigin(0, 0)
        .setSize( this.grabCollisionWidth, this.grabCollisionHeight, false)
        .setCollideWorldBounds(false)
        .setDebugBodyColor(199);

      this.updateGrabCollision();

      //this.checkGrabbingObjects();
      this.handleKeyDownEvent(); // Event listener das teclas - KEYDOWN
      
      this.createActions(); // cria as funções de animação

    }
		
}//class
module.exports = Player;
