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

            document.querySelector("a-assets").addEventListener('loaded', ()=>{
                console.log('assets loaded');

                this.emit('ready');
                this.isReady = true;
            });
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
            //setup chase camera, disable default camera controls
            document.querySelector('.chaseCamera').setAttribute('chase-look-controls', `target: a-entity[game-object-id="${objData.id}"]`);
            document.querySelector('.chaseCamera').setAttribute('camera', 'active', true);

            document.querySelector('.spectatorCamera').setAttribute('camera','active', false);
            // document.querySelector('a-entity[camera]').removeAttribute('look-controls');
            // document.querySelector('a-entity[camera]').removeAttribute('wasd-controls');

            document.body.classList.add('gameActive');
            document.querySelector('#joinGame').disabled = true;
            document.querySelector('#joinGame').style.opacity = 0;
        }
    }

    onMetaDataUpdate(){
        //update player teams
        let metaData = this.gameEngine.metaData;

        for(let x=0; x<metaData.teams.red.players.length;x++){
            let playerId = metaData.teams.red.players[x];
            let playerCar = this.gameEngine.world.getPlayerObject(playerId);
            if (playerCar) {
                playerCar.team = 'red';
                playerCar.updateTeamColor();
            }
        }

        for(let x=0; x<metaData.teams.blue.players.length;x++){
            let playerId = metaData.teams.blue.players[x];
            let playerCar = this.gameEngine.world.getPlayerObject(playerId);
            if (playerCar) {
                playerCar.team = 'blue';
                playerCar.updateTeamColor();
                // console.log(`changing player car of ${playerId} to blue`);
            }
            else{
                // console.log(`no player car for player ${playerId}`);
            }
        }
    }

}

module.exports = SLRenderer;
