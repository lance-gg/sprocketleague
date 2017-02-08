'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const RADIUS = 4;
const MASS = 3;

class Car extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Car;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(10, 10, 20, 1, 0);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);

        // create the render object
        if (gameEngine.renderer)
            this.renderObj = gameEngine.renderer.addCar(this.id, this.position, RADIUS);
    }

    toString() {
        return `Fighter::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
        if (this.renderObj)
            this.gameEngine.renderer.removeObject(this.renderObj);
    }

}

module.exports = Car;
