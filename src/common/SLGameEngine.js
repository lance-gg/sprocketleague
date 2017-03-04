'use strict';

const GameEngine = require('incheon').GameEngine;
const ThreeVector = require('incheon').serialize.ThreeVector;
const CarControl = require('./CarControl');
const Car = require('./Car');
const Ball = require('./Ball');
const Arena = require('./Arena');

// todo check if this should be global
let CANNON = null;

class SLGameEngine extends GameEngine {

    constructor(options) {
        super(options);

        CANNON = this.physicsEngine.CANNON;
        this.carControl = new CarControl({ CANNON });

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
        this.arena.position.y = -15.4;
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


    // the Sprocket League Game Engine Step.
    step() {
        super.step();

        // car physics
        this.world.forEachObject((id, o) => {
            if (o.class === Car) {
                o.adjustCarMovement();
            }
        });

        // check if a goal has been made
        if (this.ball) {
            if (this.arena.isObjInGoal1(this.ball)) {
                console.log('Ball in goal 1');
                this.resetBall();
            }

            if (this.arena.isObjInGoal2(this.ball)) {
                console.log('Ball in goal 2');
                this.resetBall();
            }
        }
    }

    // server-side function to add a new player
    makeCar(player) {
        console.log(`adding car of player`, player);

        // create a fighter for this client
        let x = Math.random() * 20 - 10;
        let z = Math.random() * 20 - 10;
        let position = new ThreeVector(x, 10, z);
        let car = new Car(++this.world.idCount, this, position);
        car.playerId = player.playerId;
        this.addObjectToWorld(car);
        this.numCars++;

        if (this.numCars === 1)
            this.makeBall();

        return car;
    }

    makeBall() {
        if (this.numBalls === 1)
            return;

        console.log(`adding ball`);
        let position = new ThreeVector(0, 10, 0);
        this.ball = new Ball(++this.world.idCount, this, position);
        this.ball.playerId = 0;
        this.numBalls++;
        this.addObjectToWorld(this.ball);
    }

    resetBall() {
        this.ball.position.set(0, 10, 0);
        this.ball.velocity.set(0, 0, 0);
        this.ball.angularVelocity.set(0, 0, 0);
        this.ball.refreshToPhysics();
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
            if (['up', 'down'].includes(inputData.input)) this.carControl.accelerate(playerCar, inputData.input);
            if (['right', 'left'].includes(inputData.input)) this.carControl.turn(playerCar, inputData.input);
            playerCar.refreshFromPhysics();
        }
    }
}

module.exports = SLGameEngine;
