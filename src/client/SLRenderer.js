'use strict';

const AFrameRenderer = require('incheon').render.AFrameRenderer;
const aframeCubeMapComponent = require('aframe-cubemap-component');
const aframeChaseLookControls = require('./chase-look-controls');
const Utils = require('./Utils');

const debugWireframes = false;


class SLRenderer extends AFrameRenderer {

    // constructor
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.scene = null;

        this.gameEngine.on('objectAdded', this.addObject.bind(this));
    }

    // setup the 3D scene
    init() {
        return super.init().then(() =>{
            if (Utils.isTouchDevice()){
                document.body.classList.add('touch');
            }

            // show cannon objects
            if (debugWireframes) {
                window.CANNON = this.gameEngine.physicsEngine.CANNON;
                let head = document.getElementsByTagName('head')[0];
                let script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '/src/lib/CannonDebugRenderer.js';
                script.onload = () => {
                    this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene.object3D, this.gameEngine.physicsEngine.world );
                };
                head.appendChild(script);
            }

            this.frameNum = 0;
            this.emit('ready');
            this.isReady = true;
        });

    }

    draw(){
        super.draw();
        this.frameNum++;
        if (this.cannonDebugRenderer)
            this.cannonDebugRenderer.update();
    }

    addObject(objData, options) {
        
        if (this.clientEngine.isOwnedByPlayer(objData)) {
            document.querySelector('a-entity[camera]').setAttribute('chase-look-controls', `target: a-entity[game-object-id="${objData.id}"]`);
        }
    }

}

module.exports = SLRenderer;
