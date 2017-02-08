'use strict';

const AFrameRenderer = require('incheon').render.AFrameRenderer;

const DEBUG__SHOW_CANNON_FRAMES = false;

class SLRenderer extends AFrameRenderer {

    // constructor
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.state = 54321;
    }

    // setup the 3D scene
    init() {

        super.init();

        // setup events for camera
        this.on('ready', () => {
            let onDocumentMouseDown = ( event ) => {
                event.preventDefault();
                this.lookAround = true;
                this.cameraControls.center.copy( this.playerCar.position );
                document.addEventListener( 'mouseup', onDocumentMouseUp, false );
            };

            let onDocumentMouseUp = ( event ) => {
                this.lookAround = false;
                document.removeEventListener( 'mouseup', onDocumentMouseUp );
            };

            document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        });

        return new Promise((resolve, reject) => {

            if (!DEBUG__SHOW_CANNON_FRAMES) {
                this.emit('ready');
                this.isReady = true;
                resolve();
                return;
            }

            // show cannon objects
            window.CANNON = this.gameEngine.physicsEngine.CANNON;
            let head = document.getElementsByTagName('head')[0];
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '/src/lib/CannonDebugRenderer.js';
            script.onload = () => {
                this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene, this.gameEngine.physicsEngine.world );
                this.emit('ready');
                this.isReady = true;
                resolve();
            };
            head.appendChild(script);
        });
    }

    // given a point on the camera (screen click)
    // calculate a corresponding impulse
    calculateImpulse(x, y, selfObj) {
        let mouse = new THREE.Vector2(x, y);
        this.raycaster.setFromCamera(mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children);

        for (let i in intersects) {
            if (intersects[i].object === this.floor) {
                let intersectPoint = intersects[i].point;
                let impulseVector = intersectPoint.sub(selfObj.renderObj.position);
                return impulseVector;
            }
        }

        console.log(`failed to calculate impulse`);
        return null;
    }

    // single step
    draw() {
        super.draw();
        if (this.cannonDebugRenderer)
            this.cannonDebugRenderer.update();
    }

    nextFloat() {
        const m = 0x80000000;
        const a = 1103515245;
        const c = 12345;
        this.state = (a * this.state + c) % m;
        return this.state / (m - 1);
    }

    // add a player's car
    addCar(id, position, radius) {

        // generate a color which is random but not dark
        let r = this.nextFloat();
        let g = this.nextFloat();
        let b = Math.max(0, 1 - r - g);
        let objColor = new THREE.Color(r, g, b);


        let renderObj = new THREE.Object3D();

        // keep a reference to the player car
        if (this.gameEngine.world.objects[id].playerId == this.clientEngine.playerId) {
            this.playerCar = renderObj;
        }

        this.objLoader.load( 'resources/models/modelt.obj', function( object ) {

            object.traverse( (child) => {
                if ( child instanceof THREE.Mesh ) {
                    child.material.color = objColor;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );

            object.scale.set(7.7, 7.7, 7.7);
            renderObj.add(object);
        });


        renderObj.position.copy(position);
        this.scene.add(renderObj);
        return renderObj;
    }

    addSumoBox(position, x, y, z) {
        // setup floor
        let floorMaterial = new THREE.MeshPhongMaterial({
            color: 0xde761a,
            wireframe: false,
            shininess: 30
        });
        this.floor = new THREE.Mesh(
            new THREE.BoxGeometry(x, y, z),
            floorMaterial);
        this.floor.position.copy(position);
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        return this.floor;
    }

    removeObject(o) {
        this.scene.remove(o);
    }
}

module.exports = SLRenderer;
