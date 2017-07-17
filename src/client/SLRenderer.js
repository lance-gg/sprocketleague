'use strict';

const AFrameRenderer = require('lance-gg').render.AFrameRenderer;
const aframeCubeMapComponent = require('aframe-cubemap-component');
const aframeChaseLookControls = require('./chase-look-controls');
const Utils = require('./Utils');

const debugWireframes = false;
const SLOW_RENDER_MESSAGE = 'Frame rate appears to be low. Try to shrink the window size. Maybe that will help? ¯\_(ツ)_/¯';


class SLRenderer extends AFrameRenderer {

    // constructor
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.scene = null;

        this.gameEngine.on('client__slowFrameRate', this.reportSlowness.bind(this));
    }

    // setup the 3D scene
    init() {
        if ('presentation' in Utils.getUrlVars())
            document.body.classList.add('presentation');

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
                document.body.classList.remove('loading');

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

    reportSlowness() {
        if (this.slownessReportedOnce)
            return;

        this.slownessReportedOnce = true;
        // alert(SLOW_RENDER_MESSAGE);
        console.log('ERROR: ' + SLOW_RENDER_MESSAGE);
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

        qs('.scoreBoard .teamRed').innerHTML = metaData.teams.red.score;
        qs('.scoreBoard .teamBlue').innerHTML = metaData.teams.blue.score;
    }

    updateHUD(data){
        if (data.RTT){ qs('.latencyData').innerHTML = data.RTT;}
        if (data.RTTAverage){ qs('.averageLatencyData').innerHTML = truncateDecimals(data.RTTAverage, 2);}
    }

    enableFullScreen(){
        let isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
            (document.mozFullScreen || document.webkitIsFullScreen);

        let docElm = document.documentElement;
        if (!isInFullScreen) {

            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        }
    }

    updateWheelRotation(amount){
        let rotation = amount * 60;
        qs('.wheel svg').style.transform = `rotate(${rotation}deg)`;
    }

}

// convenience function
function qs(selector) { return document.querySelector(selector);}

function truncateDecimals(number, digits) {
    let multiplier = Math.pow(10, digits);
    let adjustedNum = number * multiplier;
    let truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

module.exports = SLRenderer;
