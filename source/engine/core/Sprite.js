class Sprite {

    constructor(sprite) {

        // The Image Sprite
        this.sprite = sprite;
        this.spriteIndex = 0;

        this.run();
    }

    // # Gets
    getSprite()         { return this.sprite; }
    getSpriteIndex()    { return this.spriteIndex; }
    setSpriteIndex(index) {
        this.spriteIndex = index;
    }

    // # Run
    run() { }

}
module.exports = Sprite;