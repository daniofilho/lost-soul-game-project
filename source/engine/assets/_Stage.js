const Player = require('../../assets/Player.js');

class _Stage {

  constructor(stageId, stageMap, stageAssets, scenarioTileSet) {
    
    this.renderItems = new Array();
    
    this.renderLayerItems = new Array();

    this.chunkSize = window.game.getChunkSize();

    this.player = null;

    this.playerStartX = 0;
    this.playerStartY = 0;

    this.stageId = stageId;

    this.jsonStageMap = stageMap;
    this.jsonStageAssets = stageAssets;
    this.jsonTileSet = scenarioTileSet;

    this.stageMap = new Array();

    this.cols = this.jsonStageMap.width;
    this.rows = this.jsonStageMap.height;

    this.coordinates = {};

    // Groups for collision
    this.wall = window.game.phaserScene.physics.add.staticGroup();

    this.run();
  }

  // # Gets
  getStaticItems() { return this.renderItems; }
  getLayerItems() { return this.renderLayerItems; }
  
  getPlayer(){ return this.player; }
  getPlayerStartX() { return this.playerStartX; }
  getPlayerStartY() { return this.playerStartY; }
  
  getStageId() { return this.stageId; }
  
  // # Sets
  setPlayerStartX(x) { this.playerStartX = x; }
  setPlayerStartY(y) { this.playerStartY = y; }
  
  // # Add Items to the render
	addStaticItem(item){
    this.renderItems.push(item);
    
    // Renderiza o asset na tela
    let asset = window.game.phaserScene.add.image(item.getX(), item.getY(), item.sprite.getSprite() )
      .setOrigin(0,0)
      .setFrame( item.sprite.getSpriteIndex() ); 

    // Adiciona ao grupo correto
    switch( item.group ) {
      case 'floor':
        window.game.floorGroup.add(asset);
        break;
      case 'wall':
        window.game.wallGroup.add(asset);
        break;
    }
    
  }
  clearArrayItems(){
    this.renderItems = new Array();
  }

  calculateStageCoordinates() {
    let index = 0;
    for( let r=0; r<this.rows;r++ ) {
        for( let c=0; c<this.cols;c++ ) {
            this.coordinates[index] = { 
              x: this.chunkSize * c,
              y: this.chunkSize * r
            }
            index++;
        }
    }
  }
  
  // Loads JSON file
  loadJSON() {
    
    // Map each layer
    this.jsonStageMap.layers.map( (layer) => {

      // Check if it's a player layer
      if( layer.name == "player") {
        this.stageMap.push( {code: 'player'} );

        this.setPlayerStartX( layer.properties.find( x => x.name === 'player_x' ).value * this.chunkSize );
        this.setPlayerStartY( layer.properties.find( x => x.name === 'player_y' ).value * this.chunkSize );

      }

      // Check if it's the assets layer
      if( layer.name == "assets") {
        this.stageMap.push({'code': 'assets'});
      }
      
      // Check if it's the save state layer
      if( layer.name == "saved-items") {
        this.stageMap.push({'code': 'saved-items'});
      }
      
      let index = 0;
      // Map each item inside layer
      layer.data.map( (obj) => {
        if( obj != 0 ) { // avoid empty objects
          obj = parseInt(obj - 1); // Adjust Tiled ID: they add +1 to IDs to allow 0 as a empty tile // #https://discourse.mapeditor.org/t/wrong-ids-in-tileset/1425
          let tileset = this.jsonTileSet.tiles.find( x => x.id === obj ); // Get the index of corresponding id  
          //console.log(this.coordinates[index].x, this.coordinates[index].y, tileset.properties.find( x => x.name === 'type' ).value);        
          this.stageMap.push( 
            {
              'x': this.coordinates[index].x,
              'y': this.coordinates[index].y,
              'code': obj,
              'class': tileset.properties.find( x => x.name === 'class' ).value,
              'type': tileset.properties.find( x => x.name === 'type' ).value,
              'stageID': this.stageId
            }
          );
        }      
        index++;
      });
    });
    
  }

  loadAssets() {
    // Teleports
    this.jsonStageAssets.teleports.map( (asset) => {
      let props = {
        xIndex: ( asset.xIndex * this.chunkSize ),
        yIndex: ( asset.yIndex * this.chunkSize ),
        target: {
					stage: asset.props.target.stage,
					x: ( asset.props.target.x * this.chunkSize ),
					y: ( asset.props.target.y * this.chunkSize ),
					look: asset.props.target.look
				}
      }
      this.addStaticItem(
        window.game.globalAssets.getAsset('teleport', { xIndex: props.xIndex, yIndex: props.yIndex, props: props }, false ) 
      );
    });

    // Dialogs
    this.jsonStageAssets.dialogs.map( (dialog) => {
      let props = {
        x: ( dialog.x * this.chunkSize ),
        y: ( dialog.y * this.chunkSize ),
        dialog: dialog.dialog
      }
      this.addStaticItem(
        window.game.globalAssets.getAsset('dialog', { x: props.x, y: props.y, dialog: props.dialog }, false ) 
      )
    });
  }

  loadSavedStateItems() {
    // Check if player has something grabbed and include in render
    let savedItemsState = localStorage.getItem('gufitrupi__itemsState');  
    if( savedItemsState != "{}" ) {
      savedItemsState = JSON.parse(savedItemsState);
      for( let i in savedItemsState ) {
        let item = savedItemsState[i];
        // Include grabbed item
        if( item.grabbed ) {
          let obj = window.game.globalAssets.getAsset( item.grabProps.class, item.grabProps, true ); // true = came from save state
          obj.grabHandler( item.grabProps.playerWhoGrabbed ); // start a setup on the object, so the player will check the saved state of item
          this.addStaticItem(obj);
        }
        // Include dropped item
        if( item.dropped ) {
          let obj = window.game.globalAssets.getAsset( item.dropProps.class, { code: item.dropProps.code, x0: item.dropProps.x0, y0: item.dropProps.y0, stage: item.dropProps.stage }, true );
          
          if( this.getStageId() != item.dropProps.droppedStage ) {
            obj.hide();
          }

          obj.droppedStage = item.dropProps.droppedStage;
          obj.dropped = true;
          obj.updateX( item.dropProps.dropX );
          obj.updateY( item.dropProps.dropY );
          obj.dropX = item.dropProps.dropX;
          obj.dropY = item.dropProps.dropY;
          obj.x0 = item.dropProps.x0;
          obj.y0 = item.dropProps.y0;

          this.addStaticItem(obj);
        }
      };
    }
  }

  loadStageItems() {
    this.stageMap.map( (obj) => {

      switch( obj.code ) {

        case 'player':
          // Check saved state!!!!!!
          this.player = new Player();
          break;

        case 'assets':
          this.loadAssets();
          break;

        case 'saved-items':
          this.loadSavedStateItems();
          break;

        default:
          this.addStaticItem(
            window.game.globalAssets.getAsset( obj.class, { code: obj.type, x0: obj.x, y0: obj.y, stage: obj.stageID }, false ) // false = not from save state
          );
          break;
      }

    });
  }

  proccessStageAssets() {
    this.renderItems.map( (item) => {
      
      switch( item.group ){
        default:
          break;

        case "wall":
          this.wall.add.sprite( item.getX(), item.getY(), item.sprite.getSprite().id )
            .setOrigin(0,0)
            .setFrame( this.sprite.getSpriteIndex() - 1 ); //
          //.setScale( this.sprite.getScaleFactor() );*/
          break;
      }

    });
  }

  run () {  
    this.calculateStageCoordinates();
    this.loadJSON();
    this.loadStageItems();

    this.proccessStageAssets();
  }

} // class
module.exports = _Stage;