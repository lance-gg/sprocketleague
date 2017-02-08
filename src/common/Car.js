'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;

class Car extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Car;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(2, 2, 4, 1, 0);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);

        let scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = this.renderEl = document.createElement('a-entity');
            scene.appendChild(el);
            el.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            el.setAttribute('quaternion', `${this.quaternion.w} ${this.quaternion.x} ${this.quaternion.y} ${this.quaternion.z}`);
            el.setAttribute('material', 'color: red');
            el.setAttribute('obj-model', 'obj: #car-obj');
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
