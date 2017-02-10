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

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(2, 2, 4, MASS, 0);
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

    toString() {
        return `Car::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

}

module.exports = Car;
