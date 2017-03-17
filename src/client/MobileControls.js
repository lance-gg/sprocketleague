const EventEmitter = require('eventemitter3');
const Utils = require('./Utils');

const betaTiltThreshold = 40;
const gammaTiltThreshold = 40;
const steerThreshold = 0.05;

/**
 * This class handles touch device controls
 */
class MobileControls{

    constructor(renderer){
        Object.assign(this, EventEmitter.prototype);
        this.renderer = renderer;

        this.gasButton = document.querySelector(".gasButton");
        this.breakButton= document.querySelector(".breakButton");
        this.setupListeners();

        this.activeInput = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    setupListeners(){
        window.addEventListener('deviceorientation', (event) => { this.handleOrientation(event) });
        this.gasButton.addEventListener('touchstart', () => this.activeInput.up = true, false);
        this.gasButton.addEventListener('touchend', () => this.activeInput.up = false, false);

        this.breakButton.addEventListener('touchstart', () => this.activeInput.down = true , false);
        this.breakButton.addEventListener('touchend', () => this.activeInput.down = false, false);

    }

    handleOrientation(event) {
        let isPortrait = window.innerHeight > window.innerWidth;
        let beta = event.beta;  // In degree in the range [-180,180]
        let gamma = event.gamma; // In degree in the range [-90,90]

        let steerValue;
        if (isPortrait){
            let flip = beta < 0;
            steerValue = Math.max(-1, Math.min(1, gamma / gammaTiltThreshold)) * (flip?-1:1);
        } else {
            let flip = gamma > 0;
            steerValue = Math.max(-1, Math.min(1, beta / betaTiltThreshold)) * (flip?-1:1);
        }

        // output.innerHTML  = "alpha : " + event.alpha + "\n";
        // output.innerHTML = "beta : " + event.beta + "\n";
        // output.innerHTML += "gamma: " + event.gamma + "\n";
        // output.innerHTML += "steerValue: " + steerValue + "\n";
        // output.innerHTML += "isPortrait: " + isPortrait + "\n";

        this.activeInput.left = false;
        this.activeInput.right = false;

        //prevent hypesensitive steering on mobile
        let frameThreshold = 6;
        let x = Math.abs(steerValue);
        let frameStep = Math.round(frameThreshold-x*x*frameThreshold);
        let shouldSteer = this.renderer.frameNum % frameStep == 0;
        
        if (shouldSteer) {
            if (steerValue < -steerThreshold) {
                this.activeInput.left = true;
            }
            else if (steerValue > steerThreshold) {
                this.activeInput.right = true;
            }
        }
    }

}

module.exports = MobileControls;
