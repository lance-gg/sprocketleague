const ClientEngine = require('incheon').ClientEngine;
const MobileControls = require('../client/MobileControls');
const KeyboardControls = require('../client/KeyboardControls');
const SLRenderer = require('./SLRenderer');
const Utils = require('./Utils');

// The SoccerLeague client-side engine
class SLClientEngine extends ClientEngine {

    // constructor
    constructor(gameEngine, options) {
        super(gameEngine, options, SLRenderer);

        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/Ball'));
        this.serializer.registerClass(require('../common/Arena'));

        this.gameEngine.on('client__preStep', this.preStep, this);
    }

    // start then client engine
    start() {

        super.start();
        if (this.verbose) console.log(`starting client, registering input handlers`);

        if (this.renderer.isReady) {
            this.onRendererReady();
        } else {
            this.renderer.once('ready', this.onRendererReady, this);
        }

        // save reference to the ball
        this.gameEngine.on('objectAdded', obj => {
            if(obj.constructor.name == 'Ball'){
                this.gameEngine.ball = obj;
            }
            if(obj.constructor.name == 'Arena'){
                this.gameEngine.arena = obj;
            }
        });

    }

    onRendererReady() {
        //  Game input
        if (Utils.isTouchDevice()){
            this.controls = new MobileControls(this.renderer);
        } else {
            this.controls = new KeyboardControls(this.renderer);
        }
    }

    // our pre-step is to process inputs that are "currently pressed" during the game step
    preStep() {
        if (this.controls) {
            if (this.controls.activeInput.up) {
                this.sendInput('up', { movement: true });
            }

            if (this.controls.activeInput.left) {
                this.sendInput('left', { movement: true });
            }

            if (this.controls.activeInput.right) {
                this.sendInput('right', { movement: true });
            }

            if (this.controls.activeInput.down) {
                this.sendInput('down', { movement: true });
            }
        }
    }

}


module.exports = SLClientEngine;
