'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const MASS = 0;

class SumoRing extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = SumoRing;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(300, 1, 300, MASS, 0 );
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
    }

    toString() {
        return `Floor::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeBody(this.physicsObj);
    }

}

module.exports = SumoRing;
