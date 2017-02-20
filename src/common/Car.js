'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const MASS = 2;
let CANNON = null;

class Car extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Car;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // TODO: convert to rotation using aframe/system.js

        // create the physics body
        this.gameEngine = gameEngine;
        CANNON = this.gameEngine.physicsEngine.CANNON;
        this.physicsObj = gameEngine.physicsEngine.addBox(1, 1, 2, MASS, 0);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        this.physicsObj.angularDamping = 0.1;

        let scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = this.renderEl = document.createElement('a-entity');
            scene.appendChild(el);
            let p = this.position;
            let q = this.quaternion;
            el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
            el.object3D.quaternion.set(q.x, q.y, q.z, q.w);
            el.setAttribute('material', 'color: red');
            el.setAttribute('obj-model', 'obj: #car-obj');
            el.setAttribute('game-object-id', this.id);
        }
    }

    // reduce the perpendicular component of the velocity
    adjustCarMovement() {

        // gradually slow down the angular velocity
        this.physicsObj.angularVelocity.scale(0.95, this.physicsObj.angularVelocity);
        this.physicsObj.velocity.scale(0.995, this.physicsObj.velocity);

        // ignore very small velocities
        if (this.physicsObj.velocity.length() < 0.4) {
            this.physicsObj.velocity.scale(0.5, this.physicsObj.velocity);
            this.refreshFromPhysics();
            return;
        }

        // grab velocity and orientation on the XZ plane
        let XZPlaneOrientation = this.physicsObj.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
        let XZPlaneVelocity = this.physicsObj.velocity.clone();
        XZPlaneOrientation.y = 0;
        XZPlaneVelocity.y = 0;

        // ignore very small velocities
        if (XZPlaneVelocity.length() < 0.1)
            return;

        // calculate the projection of the two vectors
        XZPlaneOrientation.normalize();
        XZPlaneVelocity.normalize();
        let length = XZPlaneOrientation.dot(XZPlaneVelocity);

        // if they are close just take the orientation
        if (Math.abs(length) > 0.9) {
            XZPlaneVelocity = this.physicsObj.velocity.clone();
            XZPlaneVelocity.y = 0;
            let XZPlaneVelocityLength = XZPlaneVelocity.length() * Math.sign(length);
            XZPlaneOrientation.scale(XZPlaneVelocityLength, XZPlaneOrientation);
            this.physicsObj.velocity.x = XZPlaneOrientation.x;
            this.physicsObj.velocity.z = XZPlaneOrientation.z;
        } else {
            // apply the dot product as a factor
            XZPlaneVelocity = this.physicsObj.velocity.clone();
            XZPlaneVelocity.scale(length, XZPlaneVelocity);
            this.physicsObj.velocity.x = XZPlaneVelocity.x;
            this.physicsObj.velocity.z = XZPlaneVelocity.z;
        }

        this.refreshFromPhysics();
    }

    toString() {
        return `Car::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

}

module.exports = Car;
