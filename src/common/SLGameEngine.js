'use strict';

const GameEngine = require('incheon').GameEngine;
const ThreeVector = require('incheon').serialize.ThreeVector;
const Car = require('./Car');
const Ball = require('./Ball');
const Arena = require('./Arena');
const TURN_IMPULSE = 0.14;
const FORWARD_IMPULSE = 0.3;
const BACKWARD_IMPULSE = -0.7;
const MAX_VELOCITY = 25;
const MIN_TURNING_VELOCITY = 4.0;
const SMALL_TURNING_VELOCITY = 8.0;
// todo check if this should be global
let CANNON = null;

class SLGameEngine extends GameEngine {

    constructor(options) {
        super(options);

        CANNON = this.physicsEngine.CANNON;

        this.qRight = new CANNON.Quaternion();
        this.qRight.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI/160);
        this.mRight = (new CANNON.Mat3()).setRotationFromQuaternion(this.qRight);

        this.qLeft = new CANNON.Quaternion();
        this.qLeft.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/160);
        this.mLeft = (new CANNON.Mat3()).setRotationFromQuaternion(this.qLeft);
        this.numCars = 0;
        this.numBalls = 0;

        this.on('server__playerJoined', this.makeCar.bind(this));
        this.on('server__playerDisconnected', this.removeCar.bind(this));
        this.on('server__init', this.gameInit.bind(this));
    }

    gameInit() {
        this.arena = new Arena(++this.world.idCount, this);
        this.arena.position.y = -4;
        this.addObjectToWorld(this.arena);
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

        // car physics
        this.world.forEachObject((id, o) => {
            if (o.class === Car) {
                o.adjustCarMovement();
            }
        });
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
        let x = Math.random() * 20 - 10;
        let z = Math.random() * 20 - 10;
        let position = new ThreeVector(x, 25, z);
        let car = new Car(++this.world.idCount, this, position);
        car.playerId = player.playerId;
        this.addObjectToWorld(car);
        this.numCars++;

        if (this.numCars === 2)
            this.makeBall();

        return car;
    }

    makeBall() {
        if (this.numBalls === 1)
            return;

        console.log(`adding ball`);
        let position = new ThreeVector(0, 25, -25);
        let ball = new Ball(++this.world.idCount, this, position);
        ball.playerId = 0;
        this.numBalls++;
        this.addObjectToWorld(ball);
    }

    removeCar(player) {
        console.log(`removing car of player`, player);
        let o = this.world.getPlayerObject(player.playerId);
        this.removeObjectFromWorld(o.id);
        this.numCars--;
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);


        let playerCar = this.world.getPlayerObject(playerId);

        if (playerCar) {
            if (inputData.input === 'up') {

                let curVel = playerCar.physicsObj.velocity.length();
                if (curVel < MAX_VELOCITY) {

                    // todo probably bad perf
                    let newVec = playerCar.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, FORWARD_IMPULSE));

                    // TODO: the following adjustments improve game-play, but they
                    // are completely arbitrary.  The idea is to accelerate faster at lower velocities.
                    // consider applying an analytical function
                    if ( curVel < 3) {
                        newVec.scale(3, newVec);
                    }
                    playerCar.physicsObj.velocity.vadd(newVec, playerCar.physicsObj.velocity);
                    if (playerCar.physicsObj.velocity.length() < 1) {
                        newVec.scale(2, newVec);
                        playerCar.physicsObj.velocity.vadd(newVec, playerCar.physicsObj.velocity);
                    }
                }

            } else if (inputData.input === 'down') {
                let newVec = playerCar.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, BACKWARD_IMPULSE));
                playerCar.physicsObj.velocity.vadd(newVec, playerCar.physicsObj.velocity);
            }

            if (inputData.input === 'right') {

                // only turn if the car is advancing
                let curVel = playerCar.physicsObj.velocity.length();
                if (curVel > MIN_TURNING_VELOCITY) {
                    let deltaAngularVelocity = playerCar.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
                    let impulse = TURN_IMPULSE;
                    if (curVel < SMALL_TURNING_VELOCITY) {
                        impulse *= 0.6;
                    }
                    deltaAngularVelocity.scale(-impulse, deltaAngularVelocity);
                    //console.log(`angular vel = ${deltaAngularVelocity.length()} at velocity ${curVel}`);
                    playerCar.physicsObj.angularVelocity.vadd(deltaAngularVelocity, playerCar.physicsObj.angularVelocity);
                }
            } else if (inputData.input === 'left') {

                // only turn if the car is advancing
                let curVel = playerCar.physicsObj.velocity.length();
                if (curVel > MIN_TURNING_VELOCITY) {
                    let deltaAngularVelocity = playerCar.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
                    let impulse = TURN_IMPULSE;
                    if (curVel < SMALL_TURNING_VELOCITY) {
                        impulse *= 0.6;
                    }
                    deltaAngularVelocity.scale(impulse, deltaAngularVelocity);
                    //console.log(`angular vel = ${deltaAngularVelocity.length()} at velocity ${curVel}`);
                    playerCar.physicsObj.angularVelocity.vadd(deltaAngularVelocity, playerCar.physicsObj.angularVelocity);
                }
            }

            playerCar.refreshFromPhysics();
        }

        // let sphere = playerSumo.physicsObj;
        // let playerSumoCenter = sphere.position.clone();
        // sphere.applyImpulse(moveDirection, playerSumoCenter);
    }

}

module.exports = SLGameEngine;
