'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const MASS = 0;

class Arena extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Arena;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(300, 1, 300, MASS, 0 );
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);

        let scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = document.createElement('a-entity');
            scene.appendChild(el);
            el.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            el.setAttribute('quaternion', `${this.quaternion.w} ${this.quaternion.x} ${this.quaternion.y} ${this.quaternion.z}`);
            el.setAttribute('material', 'color: blue');
            el.setAttribute('geometry', 'primitive: box; width: 60; height: 0.5; depth: 60');
        }
    }

    toString() {
        return `Arena::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeBody(this.physicsObj);
    }

}

module.exports = Arena;
