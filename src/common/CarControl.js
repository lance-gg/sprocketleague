'use strict';
const FORWARD_IMPULSE = 0.45;
const MAX_VELOCITY = 25;
const MIN_TURNING_VELOCITY = 4.0;
const TURN_IMPULSE = 0.14;
const SMALL_TURNING_VELOCITY = 8.0;
const BOOST_VELOCITY = 3.0;
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
        let move = this.isMovingForwards(car)?'up':'down';
        if (curVel < BOOST_VELOCITY && direction === move) impulse *= 3;
        let newVec = car.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, impulse));

        car.physicsObj.velocity.vadd(newVec, car.physicsObj.velocity);
    }

    isMovingForwards(car) {
        let XZPlaneOrientation = car.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
        let XZPlaneVelocity = car.physicsObj.velocity.clone();
        XZPlaneOrientation.y = 0;
        XZPlaneVelocity.y = 0;
        return XZPlaneOrientation.dot(XZPlaneVelocity) >= 0;
    }

    turn(car, direction) {

        // only turn if the car is advancing
        let curVel = car.physicsObj.velocity.length();
        if (curVel < MIN_TURNING_VELOCITY)
            return;

        let deltaAngularVelocity = car.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 1, 0));
        let impulse = TURN_IMPULSE;
        if (direction === 'right') impulse *= -1;
        if (!this.isMovingForwards(car)) impulse *= -1;
        if (curVel < SMALL_TURNING_VELOCITY) impulse *= 0.6;
        deltaAngularVelocity.scale(impulse, deltaAngularVelocity);
        car.physicsObj.angularVelocity.vadd(deltaAngularVelocity, car.physicsObj.angularVelocity);
    }
}

module.exports = CarControl;
