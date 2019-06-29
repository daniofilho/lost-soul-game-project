/**
 *  Store Assets that needs to be on any stage, like keys or items that player grabs
 * 
 *  Declare all of this assets here
 */

const Key = require('../../assets/scenario/Key');
const Object_Throw = require('../../assets/scenario/Object_Throw');
const Object_Push = require('../../assets/scenario/Object_Push');
const Wall = require('../../assets/scenario/Wall');
const Floor = require('../../assets/scenario/Floor');
const Fire = require('../../assets/scenario/Fire');
const Heal = require('../../assets/scenario/Heal');
const Teleport = require('../../assets/scenario/Teleport');
const Door = require('../../assets/scenario/Door');
const Enemy = require('../../assets/scenario/Enemy');
const Dialog = require('./_Dialog');

class GlobalAssets {

  constructor(chunkSize) { 
		this.chunkSize = chunkSize;
	}

  getAsset( _class, props, fromSaveState ) {
    let r;
    switch( _class ) {
      case 'key':
        r = new Key( props.code, props.x0, props.y0, props.stage, fromSaveState );
        break;
      case 'object_throw':
        r = new Object_Throw( props.code, props.x0, props.y0, props.stage, fromSaveState );
        break;
      case "wall":
        r = new Wall( props.code, props.x0, props.y0 );
        break;
      case "floor":
        r = new Floor( props.code, props.x0, props.y0 );
        break;
      case "object_throw":
        return new Object_Throw( props.code, props.x0, props.y0, props.stageID );
        break;
      case "object_push":
        return new Object_Push( props.code, props.x0, props.y0, props.stageID );
        break;
      case "fire":
        return new Fire( props.code, props.x0, props.y0 );
        break;
      case "heal":
        return new Heal( props.code, props.x0, props.y0, props.stageID );
        break;
      case "door":
        return new Door( props.code, props.x0, props.y0, props.stageID );
        break;
      case "teleport":
        return new Teleport(props.xIndex, props.yIndex, props.props );
        break;
      case "dialog":
        return new Dialog(props.x, props.y, props.dialog );
        break;
      case "enemy":
        return new Enemy(props.code, props.x0, props.y0, props.stage);
        break;
    }
    return r;
  }

}//class
module.exports = GlobalAssets;