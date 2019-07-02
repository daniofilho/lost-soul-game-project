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
      this.width = this.chunkSize; //px
      this.height = this.chunkSize * 2; //px
      
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
    
      // # Collision
      this.collisionWidth = this.width * 0.8;
      this.collisionHeight = this.height * 0.3;
      this.CollisionXFormula = this.width * 0.1; // Used to set collision X when setting X 
      this.CollisionYFormula = this.height * 0.7; 
      this.collisionX = 0;//this.x0 + this.CollisionXFormula;
      this.collisionY = 0;//this.y0 + this.CollisionYFormula;

      // https://phaser.io/tutorials/coding-tips-005

      this.collisionX0 = this.collisionX;
      this.collisionY0 = this.collisionY;

      // Grab/Pick Items Collision Box
      this.grabCollisionWidth = 0;
      this.grabCollisionHeight = 0;
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
        let object = window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
        if( object && object.canGrab ) {
          if( object.isGrabbed() ) return; // avoid players grabbing the same object
          object.grabHandler(this.playerNumber);
          this.grabObject( object );
        } else {
          this.grabSound.play();
        }
        this.grabing = !this.grabing;
        this.resetStep();
      } else {
        if( this.objectGrabbed ) {
          // Drop if has nothing o player grab collision box
          let object = window.game.collision.justCheckAll(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
          if( !object ) {
            this.objectGrabbed.drop( this.spriteProps.direction, this.getHeight() ); // Throw away object
            this.objectGrabbed = false; // remove grabbed
            this.grabing = !this.grabing;
            this.resetStep();
          }
        } else {
          this.grabSound.play();
          this.grabing = !this.grabing;
          this.resetStep();
        }
      }

    }

    // Use items
    triggerUse() {
      // If has object in hand, use it
      if( this.objectGrabbed ) {
        this.objectGrabbed.use( this.spriteProps.direction, this.getHeight(), this );
      } else {
        // If not, try to use the one on front
        let object = window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
        if( object && object.canUse ) {
          object.useHandler( this.spriteProps.direction );
        } else {
          this.useSound.play();
        }
      }
    }

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
    updateGrabCollisionXY() {
      switch(this.spriteProps.direction) {
        case 'down':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX;
          this.grabCollisionY = this.collisionY + this.collisionHeight;
          break;

        case  'up':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX;
          this.grabCollisionY = this.collisionY - this.grabCollisionHeight;
          break;
        
        case 'left':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX - this.grabCollisionWidth;
          this.grabCollisionY = this.collisionY;
          break;
        
        case 'right':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX + this.collisionWidth;
          this.grabCollisionY = this.collisionY;
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

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
        
  /*
    Sprite / Animation
  */

    getSpriteProps() { return this.spriteProps; }

    
		hidePlayer() { this.hideSprite = true; }
    showPlayer() { this.hideSprite = false; }
    

  // # Controls the player FPS Movement independent of game FPS
    resetStep() {
      this.stepCount = this.defaultStep;
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
      }
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
      //this.collisionX = x + this.CollisionXFormula;
      //this.collisionY = y + this.CollisionYFormula;
      this.checkGrabbingObjects();
    }

    getX() { return this.x; }
    getY() { return this.y; }
    
    getSpeed() { return this.speed; }

    setX(x, setCollision) { 
      this.x = x; 
      this.player.setX(x);
      //if( setCollision ) this.setCollisionX( x + this.CollisionXFormula );
    }
    setY(y, setCollision) { 
      this.y = y; 
      this.player.setY(y);
      //if( setCollision ) this.setCollisionY( y + this.CollisionYFormula );
    }
    
    setSpeed(speed) { this.speed = this.chunkSize * speed; }
    
		movLeft(up, down) { 
      this.player.setVelocityX( -1 * this.speed );
      if( !up && !down ) {
        this.player.anims.play('left', true);
        this.spriteProps.direction = 'left';
      }
      /*
      this.increaseStep();
      this.setLookDirection( this.lookLeft() );
      this.setX( this.getX() - this.getSpeed()); 
      this.setCollisionX( this.getCollisionX() - this.getSpeed()); 
      this.updateGrabCollisionXY();
      this.walking = true; */
    };
			
		movRight(up, down) { 
      this.player.setVelocityX( 1 * this.speed );
      if( !up && !down ) {
        this.player.anims.play('right', true);
        this.spriteProps.direction = 'right';
      }

      //this.increaseStep();
      //this.setLookDirection( this.lookRight() );
      //this.setX( this.getX() + this.getSpeed() ); 
      //this.setCollisionX( this.getCollisionX() + this.getSpeed()); 
      //this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movUp() { 
      this.player.setVelocityY( -1 * this.speed );
      this.player.anims.play('up', true);
      this.spriteProps.direction = 'up';
      
      /*this.increaseStep();
      this.setLookDirection( this.lookUp() );
      this.setY( this.getY() - this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() - this.getSpeed() );
      this.updateGrabCollisionXY();
      this.walking = true;*/
    };
			
		movDown() {  
      this.player.setVelocityY( 1 * this.speed );
      this.player.anims.play('down', true);
      this.spriteProps.direction = 'down';

      /*this.increaseStep();
      this.setLookDirection( this.lookDown() );
      this.setY( this.getY() + this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() + this.getSpeed() );
      this.updateGrabCollisionXY();
      this.walking = true; */
    };

    iddle() {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.walking = false;
      this.walkSound.stop();

      switch( this.spriteProps.direction ) {
        case 'up':
          this.player.anims.play('iddle_up');
          break;
        case 'down':
          this.player.anims.play('iddle_down');
          break;
        case 'left':
          this.player.anims.play('iddle_left');
          break;
        case 'right':
          this.player.anims.play('iddle_right');
          break;
      }
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
        key: 'up',
        frames: phaser.anims.generateFrameNumbers('player', { start: 8, end: 15 }),
        frameRate: 15,
        repeat: -1
      });
      
      phaser.anims.create({
        key: 'right',
        frames: phaser.anims.generateFrameNumbers('player', { start: 16, end: 23 }),
        frameRate: 15,
        repeat: -1
      });
      
      window.game.phaserScene.anims.create({
        key: 'left',
        frames: phaser.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
        frameRate: 15,
        repeat: -1
      });

      phaser.anims.create({
        key: 'iddle_down',
        frames: [ { key: 'player', frame: 0 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle_up',
        frames: [ { key: 'player', frame: 8 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle_right',
        frames: [ { key: 'player', frame: 16 } ],
        frameRate: 10
      });
      phaser.anims.create({
        key: 'iddle_left',
        frames: [ { key: 'player', frame: 24 } ],
        frameRate: 10
      });
      
    }

    handleKeysEvent( cursors ) {
     
      let left  = cursors.left.isDown;
      let right = cursors.right.isDown;
      let up    = cursors.up.isDown;
      let down  = cursors.down.isDown;

      // If dialog active, don't walk
      if( window.game.isDialogActive() ) return;
      
      if( left  && !right ) this.movLeft(up, down);
      if( right && !left )  this.movRight(up, down);
      if( left && right ) this.player.anims.play('iddle_right'); // Previne ficar com animação de andando quando ambas teclas estão apertadas
      if( up    && !down )  this.movUp();
      if( down  && !up )    this.movDown();
      if( up && down ) this.player.anims.play('iddle_down');

      if( !left && !right && !up && !down ) this.iddle();
      
      /*
      // Player 1
      if( this.playerNumber == 1 ) {
        if (keyUp == 17) this.triggerGrab();  // Grab => CTRL
        if (keyUp == 32) this.triggerUse();   // Use => Space
      }*/
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
		
  /*
    Collision
  */
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
    };
		
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
        .setSize(20, 32, false)
        .setOffset(6, 32)  // Move o box definido acima para outra posição
        .setFrame(0) // Frame inicial do personagem
        .setCollideWorldBounds(true) // Não deixa ele sair fora da tela
        .setDrag(2000); // faz o player "grudar" no chão, o que impede ele de andar eternamente quando aperta uma tecla de movimento

      //this.checkGrabbingObjects();
      //this.lookDirection = this.lookDown();
      //this.updateGrabCollisionXY();
      
      this.createActions(); // cria as funções de animação

    }
		
}//class
module.exports = Player;
