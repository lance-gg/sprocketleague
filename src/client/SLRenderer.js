'use strict';

const AFrameRenderer = require('incheon').render.AFrameRenderer;
const aframeCubeMapComponent = require('aframe-cubemap-component');
const debugWireframes = false;

class SLRenderer extends AFrameRenderer {

    // constructor
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.scene = null;
    }

    // setup the 3D scene
    init() {

        return super.init().then(() =>{

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


            this.emit('ready');
            this.isReady = true;
        });

    }

    draw(){
        super.draw();
        if (this.cannonDebugRenderer)
            this.cannonDebugRenderer.update();
    }

}

module.exports = SLRenderer;
