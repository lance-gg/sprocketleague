'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const MASS = 2;

class Car extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Car;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // TODO: convert to rotation using aframe/system.js
        // function rad2deg(r) { return r*180/Math.PI; }

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(2, 2, 4, MASS, 0);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        this.physicsObj.angularDamping = 0.1;

        let scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = this.renderEl = document.createElement('a-entity');
            scene.appendChild(el);
            // let eulerRotation = (new THREE.Euler()).setFromQuaternion(this.quaternion);
            // let r = { x: rad2deg(eulerRotation.x), y: rad2deg(eulerRotation.y), z: rad2deg(eulerRotation.z) };
            el.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            el.setAttribute('quaternion', `${this.quaternion.w} ${this.quaternion.x} ${this.quaternion.y} ${this.quaternion.z}`);
            // el.setAttribute('rotation', `${r.x} ${r.y} ${r.z}`);
            el.setAttribute('material', 'color: red');
            el.setAttribute('obj-model', 'obj: #car-obj');
            el.setAttribute('game-object-id', this.id);
        }
    }

    toString() {
        return `Car::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

}

module.exports = Car;
