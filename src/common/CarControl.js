'use strict';
const FORWARD_IMPULSE = 0.3;
const MAX_VELOCITY = 25;
const MIN_TURNING_VELOCITY = 4.0;
const TURN_IMPULSE = 0.14;
const SMALL_TURNING_VELOCITY = 8.0;
let CANNON = null;

class CarControl {

    constructor(options) {
        CANNON = options.CANNON;
    }

    accelerate(car, direction) {
        let curVel = car.physicsObj.velocity.length();
        if (curVel > MAX_VELOCITY)
            return;

        // TODO: probably bad perf
        let impulse = FORWARD_IMPULSE;
        if (direction === 'down') impulse *= -1;
        let newVec = car.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, impulse));

        // TODO: the following adjustments improve game-play, but they
        // are completely arbitrary.  The idea is to accelerate faster at lower velocities.
        // consider applying an analytical function
        // if ( curVel < 3) {
        //     newVec.scale(3, newVec);
        // }
        car.physicsObj.velocity.vadd(newVec, car.physicsObj.velocity);
        // if (car.physicsObj.velocity.length() < 1) {
        //     newVec.scale(2, newVec);
        //     car.physicsObj.velocity.vadd(newVec, car.physicsObj.velocity);
        // }
    }

    turn(car, direction) {

        // only turn if the car is advancing
        let curVel = car.physicsObj.velocity.length();
        if (curVel < MIN_TURNING_VELOCITY)
            return;

        // check if we are going in reverse
        let XZPlaneOrientation = car.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
        let XZPlaneVelocity = car.physicsObj.velocity.clone();
        XZPlaneOrientation.y = 0;
        XZPlaneVelocity.y = 0;
        let carInReverse = XZPlaneOrientation.dot(XZPlaneVelocity) < 0;

        let deltaAngularVelocity = car.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
        let impulse = TURN_IMPULSE;
        if (direction === 'right') impulse *= -1;
        if (carInReverse) impulse *= -1;
        if (curVel < SMALL_TURNING_VELOCITY) impulse *= 0.6;
        deltaAngularVelocity.scale(impulse, deltaAngularVelocity);
        car.physicsObj.angularVelocity.vadd(deltaAngularVelocity, car.physicsObj.angularVelocity);
    }
}

module.exports = CarControl;
