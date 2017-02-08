'use strict';

const GameEngine = require('incheon').GameEngine;
const ThreeVector = require('incheon').serialize.ThreeVector;
const Car = require('./Car');
const SumoRing = require('./SumoRing');
const IMPULSE_STRENGTH = 12;

//todo check if this should be global
let CANNON = null;

class SLGameEngine extends GameEngine {

    constructor(options) {
        super(options);

        CANNON = this.physicsEngine.CANNON;

        this.qRight = new CANNON.Quaternion();
        this.qRight.setFromAxisAngle(new CANNON.Vec3(0,1,0), -Math.PI/160);
        this.mRight = (new CANNON.Mat3()).setRotationFromQuaternion(this.qRight);

        this.qLeft = new CANNON.Quaternion();
        this.qLeft.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/160);
        this.mLeft = (new CANNON.Mat3()).setRotationFromQuaternion(this.qLeft);

        this.on('server__playerJoined', this.makeCar.bind(this));
        this.on('server__playerDisconnected', this.removeCar.bind(this));
        this.on('server__init', this.gameInit.bind(this));
    }

    gameInit() {
        this.sumoRing = new SumoRing(++this.world.idCount, this);
        this.sumoRing.position.y = -4;
        this.addObjectToWorld(this.sumoRing);
    }

    start() {
        super.start();

        // TODO: refactor world settings
        this.worldSettings = {
            width: 800,
            height: 600
        };
    }


    // the Sumo Game Engine Step.
    step() {

        super.step();

        // on server-side:
        // decide if fighter has died
        for (let objId of Object.keys(this.world.objects)) {
            let obj = this.world.objects[objId];
            if (this.isServer && obj.y < -100) {
                console.log(`object ${objId} has fallen off the board`);
                this.resetFighter({ playerId: objId });
            }
        }
    }

    resetFighter(fighter) {
        fighter.x = Math.random() * 20 - 10;
        fighter.y = Math.random() * 20 - 10;
        fighter.initPhysicsObject(this.physicsEngine);
        console.log(`reset Fighter#${newGuy.playerId} at ${fighter.x},${fighter.y},${fighter.z}`);
    }

    // server-side function to add a new player
    makeCar(player) {
        console.log(`adding car of player`, player);

        // create a fighter for this client
        let position = new ThreeVector(0, 25, 0);
        let car = new Car(++this.world.idCount, this, position);
        car.playerId = player.playerId;
        this.addObjectToWorld(car);

        return car;
    }

    removeCar(player) {
        console.log(`removing car of player`, player);
        let o = this.world.getPlayerObject(player.playerId);
        this.removeObjectFromWorld(o.id);
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);

        // apply a central impulse
        // let moveDirection = new CANNON.Vec3(inputData.input.x, 0, inputData.input.z);
        // moveDirection.normalize();
        // moveDirection = moveDirection.scale(IMPULSE_STRENGTH);
        // console.log(inputData, playerId);

        let playerCar = this.world.getPlayerObject(playerId);

        if (playerCar){
            if (inputData.input == 'up') {
                //todo probably bad perf
                let newVec = playerCar.physicsObj.quaternion.vmult(new CANNON.Vec3(0,0,1));
                // console.log(newVec);
                playerCar.physicsObj.velocity.vadd(newVec, playerCar.physicsObj.velocity);
            } else if (inputData.input === 'right') {
                this.mRight.vmult(playerCar.physicsObj.velocity, playerCar.physicsObj.velocity);
                this.qRight.mult(playerCar.physicsObj.quaternion, playerCar.physicsObj.quaternion);
            } else if (inputData.input === 'left') {
                this.mLeft.vmult(playerCar.physicsObj.velocity, playerCar.physicsObj.velocity);
                this.qLeft.mult(playerCar.physicsObj.quaternion, playerCar.physicsObj.quaternion);
            }  else if (inputData.input === 'down') {
                playerCar.physicsObj.velocity.mult(0.9, playerCar.physicsObj.velocity);

            }

            playerCar.refreshFromPhysics();
        }

        // let sphere = playerSumo.physicsObj;
        // let playerSumoCenter = sphere.position.clone();
        // sphere.applyImpulse(moveDirection, playerSumoCenter);
    }

}

module.exports = SLGameEngine;
