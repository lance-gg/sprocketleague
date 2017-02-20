'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const MASS = 0;
const ARENA_SCALE = 0.1;

// width, depth, and height specified in half-segements
const ARENA_DEPTH = 470 * ARENA_SCALE;
const ARENA_WIDTH = 700 * ARENA_SCALE;
const ARENA_HEIGHT = 100 * ARENA_SCALE;
const ARENA_MODEL_SCALE = 125 * ARENA_SCALE;
const WALL_WIDTH = 10;

class Arena extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Arena;
        this.gameEngine = gameEngine;
        this.walls = [];
    }

    // add a wall
    // (x, y, z) are position
    // (dx, dy, dz) are dimensions
    addWall(x, y, z, dx, dy, dz) {
        let wall = this.gameEngine.physicsEngine.addBox(dx, dy, dz);
        wall.position.set(x, y, z);
        return wall;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(ARENA_WIDTH, 1, ARENA_DEPTH, MASS, 0 );
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        let x = this.position.x;
        let y = this.position.y;
        let z = this.position.z;

        // add five walls: left, right, front, back, ceiling
        this.walls.push(this.addWall(x - ARENA_WIDTH, y + ARENA_HEIGHT, z, WALL_WIDTH, ARENA_HEIGHT, ARENA_DEPTH));
        this.walls.push(this.addWall(x + ARENA_WIDTH, y + ARENA_HEIGHT, z, WALL_WIDTH, ARENA_HEIGHT, ARENA_DEPTH));
        this.walls.push(this.addWall(x, y + ARENA_HEIGHT, z - ARENA_DEPTH, ARENA_WIDTH, ARENA_HEIGHT, WALL_WIDTH));
        this.walls.push(this.addWall(x, y + ARENA_HEIGHT, z + ARENA_DEPTH, ARENA_WIDTH, ARENA_HEIGHT, WALL_WIDTH));
        this.walls.push(this.addWall(x, y + ARENA_HEIGHT * 2, z, ARENA_WIDTH, WALL_WIDTH, ARENA_DEPTH));

        let scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = this.renderEl = document.createElement('a-gltf-model');
            scene.appendChild(el);
            el.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            el.setAttribute('src', `#stadium`);
            el.setAttribute('scale', `${ARENA_MODEL_SCALE} 0 ${ARENA_MODEL_SCALE}`);
            el.setAttribute('rotate', `0 90 0`);
            el.setAttribute('game-object-id', this.id);
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
