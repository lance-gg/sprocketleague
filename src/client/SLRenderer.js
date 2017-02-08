'use strict';

const AFrameRenderer = require('incheon').render.AFrameRenderer;

class SLRenderer extends AFrameRenderer {

    // constructor
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.scene = null;
    }

    // setup the 3D scene
    init() {

        super.init();
        this.emit('ready');
        this.isReady = true;

        return Promise.resolve();
    }

}

module.exports = SLRenderer;
