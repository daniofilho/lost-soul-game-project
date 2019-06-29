/*
  Sandbox Scenario
*/
const _Scenario = require('../../engine/assets/_Scenario');
const _Stage = require('../../engine/assets/_Stage');

const jsonScenarioTileSet = require('./sprites/tilesetScenario.json');

const jsonStageD8 = require('./stages/d8.json');
const jsonStageD8Assets = require('./stages/d8-assets.json');


class scenarioMain extends _Scenario {

  constructor(ctx, canvas, saveData){
    let soundSrc = "./sounds/sandbox-background.mp3";
    super(ctx, canvas, "main", soundSrc);
    this.defaultStageId = "D8";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;

    /*
    if( !saveData ) {
      let dialog = [
        {
					"hideSprite": false,
					"text": "Welcome to Gufitrupi! This is a sandbox Scenario where you can test all the features of this game. [PRESS SPACE TO CONTINUE]"
				},
        {
					"hideSprite": false,
					"text": "Press the GRAB/DROP button to pick up an object. With the object on your hands, press the USE button again to drop it or press the USE/THROW button to throw it."
				},
        {
					"hideSprite": false,
					"text": "You can also press the USE button in front of a board to read it."
				},
        { "hideSprite": true, "text": "" },
      ];
      window.game.setDialog(dialog); 
    }*/

    this.run();
  }

  // # Stages
  setStage(stage_id, firstStage) {
    
    // Save items state before clear
    if( !firstStage ) {
      this.saveItemsState();
    }

    this.clearArrayItems();

    // Set Actual Stage ID
    this.setActualStageId( stage_id );

    let _stage = null;

    switch( stage_id ) {
      default:
      case 'D8':
        _stage = new _Stage( stage_id, jsonStageD8, jsonStageD8Assets, jsonScenarioTileSet );
        break;
    }
    
    // Load the stage defined
    this.loadStage(_stage, firstStage);
  }
 
  // Set Default Stage
  run() {
    this.setStage( this.stageToLoad, true );    
  }

}//class
module.exports = scenarioMain;