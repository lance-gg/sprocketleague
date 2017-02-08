const ClientEngine = require('incheon').ClientEngine;
const KeyboardControls = require('../client/KeyboardControls');
const SLRenderer = require('./SLRenderer');


// The Sumo client-side engine
class SLClientEngine extends ClientEngine {

    // constructor
    constructor(gameEngine, options) {
        super(gameEngine, options, SLRenderer);

        // TODO: 1. shouldn't be necessary to register ThreeVector and Quternion
        // TODO: 2. on the original sumo I registered the classes in the gameEngine
        //          instead of doing it twice (clientEngine and serverEngine)
        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/SumoRing'));
        this.serializer.registerClass(require('incheon').serialize.ThreeVector);
        this.serializer.registerClass(require('incheon').serialize.Quaternion);

        this.gameEngine.on('client__preStep', this.preStep, this);
    }

    // start then client engine
    start() {

        super.start();
        if (this.verbose) console.log(`starting client, registering input handlers`);

        if (this.renderer.isReady){
            this.onRendererReady();
        }
        else{
            this.renderer.once('ready', this.onRendererReady, this);
        }

    }

    onRendererReady(){
        this.controls = new KeyboardControls();

        this.controls.on('fire', () => {
            this.sendInput('space');
        });

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
