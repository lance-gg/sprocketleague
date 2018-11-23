'use strict';

import PhysicalObject3D from 'lance/serialize/PhysicalObject3D';
const MASS = 2;
const Utils = require('../client/Utils');

let CANNON = null;

export default class Car extends PhysicalObject3D {

    constructor(gameEngine, position) {
        super(gameEngine, null, { position });
        this.class = Car;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // TODO: convert to rotation using aframe/system.js

        // create the physics body
        this.gameEngine = gameEngine;
        CANNON = this.gameEngine.physicsEngine.CANNON;
        this.physicsObj = gameEngine.physicsEngine.addBox(1, 1, 2.9, MASS, 0.01);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        this.physicsObj.angularDamping = 0.1;

        let scene = this.scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (scene) {
            let el = this.renderEl = document.createElement('a-entity');

            this.carEl = document.createElement('a-gltf-model');
            this.carEl.setAttribute('gltf-model', '#car-obj');
            this.carEl.setAttribute('position', '0 -1.7 0.4');
            this.carEl.setAttribute('rotation', '0 180 0');

            this.headLight = document.createElement('a-entity');
            this.headLight.setAttribute('light', 'type: spot; color: #ffffff; intensity: 1; angle: 47; penumbra: 0.26');
            this.headLight.setAttribute('position', '0 -1.86 2.36');
            this.headLight.setAttribute('rotation', '0 180 0');

            // change car color
            // todo find out how to do this on gltf asset load
            if (this.carEl.components['gltf-model'].model) {
                this.onModelLoaded();
            } else {
                this.carEl.addEventListener('model-loaded', this.onModelLoaded.bind(this));
            }

            let p = this.position;
            let q = this.quaternion;
            el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
            el.object3D.quaternion.set(q.x, q.y, q.z, q.w);
            el.setAttribute('game-object-id', this.id);

            el.appendChild(this.headLight);
            el.appendChild(this.carEl);
            scene.appendChild(el);

        }
    }

    onModelLoaded() {
        // 0 chasis
        // 6 lights
        // 7 bumper
        // 8 backlights
        // 9 windows

        this.modelLoaded = true;
        this.backLightMaterial = this.carEl.object3D.children[0].children[0].children[0].children[8].material;
        this.windowMaterial = this.carEl.object3D.children[0].children[0].children[0].children[9].material;
        this.chasisMaterial = this.carEl.object3D.children[0].children[0].children[0].children[0].material;
        this.headLightsMaterial = this.carEl.object3D.children[0].children[0].children[0].children[6].material;

        // set headlights color
        this.headLightsMaterial.emissive.r = 255 / 255;
        this.headLightsMaterial.emissive.g = 235 / 255;
        this.headLightsMaterial.emissive.b = 16 / 255;

        if (this.team) {
            this.updateTeamColor();
        } else {
        // team color is unknown yet, set to neutral color
            this.setColor(220, 220, 200);
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

        if (this.scene) {
            if(this.isMovingForwards) {
                this.turnOffReverseLight();
            } else{
                this.turnOnReverseLight();
            }
        }
    }

    updateTeamColor() {
        if (this.team =='red') {
            this.setColor(213, 63, 63);
        } else{
            this.setColor(105, 171, 252);
        }
    }

    setColor(r, g, b) {
        if (this.modelLoaded) {
            this.chasisMaterial.color.r = r / 255;
            this.chasisMaterial.color.g = g / 255;
            this.chasisMaterial.color.b = b / 255;

            // too costly for performance on mobile
            if (Utils.isTouchDevice() == false) {

                // refractive windows
                let refracCubeTexture;
                if (!this.gameEngine.renderer.cubeTexture) {
                    let path = 'resources/images/flame/';
                    let format = '.jpg';
                    let urls = [
                        path + 'posx' + format, path + 'negx' + format,
                        path + 'posy' + format, path + 'negy' + format,
                        path + 'posz' + format, path + 'negz' + format
                    ];

                    refracCubeTexture = this.gameEngine.renderer.cubeTexture = new THREE.CubeTextureLoader().load(urls);
                    refracCubeTexture.mapping = THREE.CubeRefractionMapping;
                    refracCubeTexture.format = THREE.RGBFormat;
                }

                this.windowMaterial.color.r = 29 / 255;
                this.windowMaterial.color.g = 74 / 255;
                this.windowMaterial.color.b = 129 / 255;
                this.windowMaterial.envMap = refracCubeTexture;
                this.windowMaterial.combine = THREE.MixOperation;
                this.windowMaterial.reflectivity = 0.4;
            }
        }
    }

    turnOnReverseLight() {
        if (this.modelLoaded) {
            this.backLightMaterial.emissive.r = 200 / 255;
            this.backLightMaterial.emissive.g = 200 / 255;
            this.backLightMaterial.emissive.b = 200 / 255;
        }
    }

    turnOffReverseLight() {
        if (this.modelLoaded) {
            this.backLightMaterial.emissive.r = 166 / 255;
            this.backLightMaterial.emissive.g = 44 / 255;
            this.backLightMaterial.emissive.b = 44 / 255;
        }
    }

    toString() {
        return `Car::${super.toString()}`;
    }

    syncTo(other) {
        super.syncTo(other);
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

}
