'use strict';

import PhysicalObject from 'lance/serialize/PhysicalObject';
const MASS = 0;
const ARENA_SCALE = 0.2;

// width, depth, and height specified in half-segements
const ARENA_BASELINE = 10;
const ARENA_DEPTH = 390 * ARENA_SCALE;
const ARENA_WIDTH = 700 * ARENA_SCALE;
const ARENA_HEIGHT = 250 * ARENA_SCALE;
const ARENA_MODEL_SCALE = 125 * ARENA_SCALE;
const WALL_WIDTH = 5;

const GOAL_DEPTH = 18;
const GOAL_WIDTH = 20;
const GOALSIDE_WIDTH = (ARENA_DEPTH - GOAL_WIDTH) / 2;
const CORNER_RADIUS = 80 * ARENA_SCALE;

// The Arena
//
// Orientation: The 3D world is represented with a right-handed coordinate system.
// The X and Z axis are the floor of the arena, and the Y axis is the height.
// Using the X axis as the North, the Arena is laid out so that it is wide is along
// the X axis, and the goals are at the North end and the South end.
export default class Arena extends PhysicalObject {

    constructor(gameEngine) {
        super(gameEngine);
        this.class = Arena;
        this.gameEngine = gameEngine;
        this.walls = [];
    }

    // add a wall
    // (x, y, z) are position
    // (dx, dy, dz) are dimensions
    addWall(x, y, z, dx, dy, dz) {
        let wall = this.gameEngine.physicsEngine.addBox(dx, dy, dz, 0, 0.01);
        wall.position.set(x, y, z);
        return wall;
    }

    addCorner(x, y, z) {
        let wall = this.addWall(x, y, z, CORNER_RADIUS, ARENA_HEIGHT, CORNER_RADIUS);
        wall.fixedRotation = true;
        wall.quaternion.setFromEuler(0, Math.PI / 4, 0, 'XYZ');
        return wall;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(ARENA_WIDTH * 1.5, ARENA_BASELINE, ARENA_DEPTH * 1.5, MASS, 0 );
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        let x = this.position.x;
        let y = this.position.y;
        let z = this.position.z;

        // add walls: West, East, and ceiling
        this.walls.push(this.addWall(x, y + ARENA_BASELINE + ARENA_HEIGHT, z - ARENA_DEPTH, ARENA_WIDTH, ARENA_HEIGHT, WALL_WIDTH));
        this.walls.push(this.addWall(x, y + ARENA_BASELINE + ARENA_HEIGHT, z + ARENA_DEPTH, ARENA_WIDTH, ARENA_HEIGHT, WALL_WIDTH));
        this.walls.push(this.addWall(x, y + ARENA_BASELINE + ARENA_HEIGHT * 2, z, ARENA_WIDTH, WALL_WIDTH, ARENA_DEPTH));

        // add walls for South goal: backplate, left plate, right plate
        this.walls.push(this.addWall(x - ARENA_WIDTH - GOAL_DEPTH, y + ARENA_BASELINE +ARENA_HEIGHT, z, WALL_WIDTH, ARENA_HEIGHT, GOAL_WIDTH ));
        this.walls.push(this.addWall(x - ARENA_WIDTH - 11, y + ARENA_BASELINE + ARENA_HEIGHT, z - GOALSIDE_WIDTH - GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));
        this.walls.push(this.addWall(x - ARENA_WIDTH - 11, y + ARENA_BASELINE + ARENA_HEIGHT, z + GOALSIDE_WIDTH + GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));

        // add walls for North goal: backplate, left plate, right plate
        this.walls.push(this.addWall(x + ARENA_WIDTH + GOAL_DEPTH, y + ARENA_BASELINE +ARENA_HEIGHT, z, WALL_WIDTH, ARENA_HEIGHT, GOAL_WIDTH ));
        this.walls.push(this.addWall(x + ARENA_WIDTH + 11, y + ARENA_BASELINE + ARENA_HEIGHT, z - GOALSIDE_WIDTH - GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));
        this.walls.push(this.addWall(x + ARENA_WIDTH + 11, y + ARENA_BASELINE + ARENA_HEIGHT, z + GOALSIDE_WIDTH + GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));

        // add corner angled-walls, NorthWest, NorthEast, SouthEast, SouthWest
        this.walls.push(this.addCorner(x + ARENA_WIDTH, y + ARENA_BASELINE + ARENA_HEIGHT, z - ARENA_DEPTH));
        this.walls.push(this.addCorner(x + ARENA_WIDTH, y + ARENA_BASELINE + ARENA_HEIGHT, z + ARENA_DEPTH));
        this.walls.push(this.addCorner(x - ARENA_WIDTH, y + ARENA_BASELINE + ARENA_HEIGHT, z + ARENA_DEPTH));
        this.walls.push(this.addCorner(x - ARENA_WIDTH, y + ARENA_BASELINE + ARENA_HEIGHT, z - ARENA_DEPTH));

        let scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = this.renderEl = document.createElement('a-gltf-model');
            scene.appendChild(el);
            el.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            el.setAttribute('gltf-model', `#stadium`);
            el.setAttribute('scale', `${ARENA_MODEL_SCALE} ${ARENA_MODEL_SCALE} ${ARENA_MODEL_SCALE}`);
            el.setAttribute('rotate', `0 90 0`);
            el.setAttribute('game-object-id', this.id);
        }
        else{
            console.log("Tried to add arena object but renderer not ready")
        }
    }

    isObjInGoal1(obj) {
        return obj.position.x < -ARENA_WIDTH;
    }

    isObjInGoal2(obj) {
        return obj.position.x > ARENA_WIDTH;
    }

    toString() {
        return `Arena::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeBody(this.physicsObj);
    }

}
