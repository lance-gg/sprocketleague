'use strict';

const PhysicalObject = require('incheon').serialize.PhysicalObject;
const RADIUS = 4;
const MASS = 0.1;
let CANNON = null;

class Ball extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Ball;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        CANNON = this.gameEngine.physicsEngine.CANNON;
        this.physicsObj = gameEngine.physicsEngine.addSphere(RADIUS, MASS);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        this.physicsObj.angularDamping = 0.1;

        this.scene = gameEngine.renderer ? gameEngine.renderer.scene : null;
        if (this.scene) {
            let el = this.renderEl = document.createElement('a-entity');
            this.scene.appendChild(el);
            let p = this.position;
            let q = this.quaternion;
            el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
            el.setAttribute('material', 'src: #ball');
            el.setAttribute('geometry', `primitive: sphere; radius: ${RADIUS}; segmentsWidth: 32; segmentsHeight: 16`);
            el.setAttribute('game-object-id', this.id);


            this.setupEmitters();
        }
    }

    onClientPostStep(){
        this.particleEmitter.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`)
    }

    setupEmitters(){
        const SPE = require('shader-particle-engine');
        const emitterDuration = 1;

        let scene = this.scene.object3D;
        this.emitterSettings = {};

        this.emitterGroup = new SPE.Group( {
            texture: {
                value: THREE.ImageUtils.loadTexture( './resources/images/sprite-explosion2.png' ),
                frames: new THREE.Vector2( 5, 5 ),
                loop: 1
            },
            depthTest: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            scale: 600
        } );
        

        this.shockwaveGroup = new SPE.Group( {
            texture: {
                value: THREE.ImageUtils.loadTexture( './resources/images/smokeparticle.png' ),
            },
            depthTest: false,
            depthWrite: true,
            blending: THREE.NormalBlending,
        } );

        this.emitterSettings.debris = {
            particleCount: 100,
            type: SPE.distributions.SPHERE,
            position: {
                radius: 0.1,
            },
            maxAge: {
                value: 2
            },
            // duration: 2,
            duration: emitterDuration,
            activeMultiplier: 40,

            velocity: {
                value: new THREE.Vector3( 100 )
            },
            acceleration: {
                value: new THREE.Vector3( 0, -20, 0 ),
                distribution: SPE.distributions.BOX
            },
            size: { value: 2 },
            drag: {
                value: 1
            },
            color: {
                value: [
                    new THREE.Color( 1, 1, 1 ),
                    new THREE.Color( 1, 1, 0 ),
                    new THREE.Color( 1, 0, 0 ),
                    new THREE.Color( 0.4, 0.2, 0.1 )
                ]
            },
            opacity: { value: [0.4, 0] }
        };

        this.emitterSettings.fireball = {
            particleCount: 20,
            type: SPE.distributions.SPHERE,
            position: {
                radius: 1
            },
            maxAge: { value: 2 },
            // duration: 1,
            duration: emitterDuration,
            activeMultiplier: 20,
            velocity: {
                value: new THREE.Vector3( 2 )
            },
            size: { value: [20, 100] },
            color: {
                value: [
                    new THREE.Color( 0.5, 0.1, 0.05 ),
                    new THREE.Color( 0.2, 0.2, 0.2 )
                ]
            },
            opacity: { value: [0.5, 0.35, 0.1, 0] }
        };

        this.emitterSettings.mist = {
            particleCount: 50,
            position: {
                spread: new THREE.Vector3( 10, 10, 10 ),
                distribution: SPE.distributions.SPHERE
            },
            maxAge: { value: 2 },
            // duration: 1,
            duration: emitterDuration,
            activeMultiplier: 2000,
            velocity: {
                value: new THREE.Vector3( 8, 3, 10 ),
                distribution: SPE.distributions.SPHERE
            },
            size: { value: 40 },
            color: {
                value: new THREE.Color( 0.2, 0.2, 0.2 )
            },
            opacity: { value: [0, 0, 0.2, 0] }
        };

        this.emitterSettings.flash = {
            particleCount: 50,
            position: { spread: new THREE.Vector3( 5, 5, 5 ) },
            velocity: {
                spread: new THREE.Vector3( 30 ),
                distribution: SPE.distributions.SPHERE
            },
            duration: emitterDuration,
            size: { value: [2, 20, 20, 20] },
            maxAge: { value: 2 },
            activeMultiplier: 2000,
            opacity: { value: [0.5, 0.25, 0, 0] }
        };

        this.emitterGroup.addPool( 10, this.emitterSettings.fireball, false );
        this.emitterGroup.addPool( 10, this.emitterSettings.flash, false );
        this.shockwaveGroup.addPool( 10, this.emitterSettings.debris, false );
        this.shockwaveGroup.addPool( 10, this.emitterSettings.mist, false );

        this.shockwaveGroup.mesh.frustumCulled = false;
        this.emitterGroup.mesh.frustumCulled = false;

        scene.add( this.shockwaveGroup.mesh );
        scene.add( this.emitterGroup.mesh );

        // for debug
        window.showExplosion = () => { this.showExplosion() };
    }

    showExplosion(){
        console.log('boom');
        if (this.scene) {
            let position = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
            this.emitterGroup.triggerPoolEmitter(1, position);
            this.shockwaveGroup.triggerPoolEmitter(1, position);
        }
    }

    refreshRenderObject(){
        this.emitterGroup.tick();
        this.shockwaveGroup.tick();
    }

    toString() {
        return `Ball::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.removeListener('client__postStep', this.onClientPostStep);
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

}

module.exports = Ball;
