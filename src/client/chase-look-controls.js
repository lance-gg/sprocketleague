// var registerComponent = require('../../node_modules/aframe/src/core/component').registerComponent;
var bind = require('../../node_modules/aframe/src/utils/bind');
const OrbitControls = require('../../node_modules/three/examples/js/controls/OrbitControls');


module.exports = AFRAME.registerComponent('chase-look-controls', {
    schema: {
        enabled: {default: true},
        target: {default: null, type: 'selector'}
    },

    init: function () {
        this.camera = this.el.object3D.children[0];
        this.cameraControls = new THREE.OrbitControls(this.camera);
        this.cameraControls.maxPolarAngle = Math.PI/2;

        this.setupMouseControls();
        this.bindMethods();
    },

    update: function (oldData) {
        var data = this.data;

        if (this.data.enabled && this.data.target){
                // TWEEN.update();
                let relativeCameraOffset = new THREE.Vector3( 0, 5, -10 );
                let cameraOffset = relativeCameraOffset.applyMatrix4( this.data.target.object3D.matrixWorld );
                // Camera TWEEN.
                if (this.lookAround) {
                    this.cameraControls.target.copy(this.data.target.object3D.position);
                    this.cameraControls.update();
                } else {
                    new TWEEN.Tween( this.camera.position ).to( {
                            x: cameraOffset.x,
                            y: cameraOffset.y,
                            z: cameraOffset.z }, 90 )
                        .interpolation( TWEEN.Interpolation.Bezier )
                        .easing( TWEEN.Easing.Sinusoidal.InOut ).start();
                    this.camera.lookAt( this.data.target.object3D.position );
                }

            }
    },

    play: function () {
        this.addEventListeners();
    },

    pause: function () {
        this.removeEventListeners();
    },

    tick: function (t) {
        this.update();
    },

    remove: function () {
        this.pause();
    },

    bindMethods: function () {
        this.onMouseDown = bind(this.onMouseDown, this);
        this.releaseMouse = bind(this.releaseMouse, this);
    },

    setupMouseControls: function () {
        // The canvas where the scene is painted
        this.lookAround = false;
    },


    addEventListeners: function () {
        let sceneEl = this.el.sceneEl;
        sceneEl.addEventListener('renderstart', ()=>{
            let canvasEl = sceneEl.canvas;

            // Mouse Events
            canvasEl.addEventListener('mousedown', this.onMouseDown, false);
            window.addEventListener('mouseup', this.releaseMouse, false);
        });
    },

    removeEventListeners: function () {
        var sceneEl = this.el.sceneEl;
        var canvasEl = sceneEl && sceneEl.canvas;
        if (!canvasEl) { return; }

        // Mouse Events
        canvasEl.removeEventListener('mousedown', this.onMouseDown);
        canvasEl.removeEventListener('mouseup', this.releaseMouse);
        canvasEl.removeEventListener('mouseout', this.releaseMouse);

    },

    onMouseDown: function (event) {
        this.lookAround = true;
        this.cameraControls.maxDistance = this.data.target.object3D.position.distanceTo(this.camera.position);
    },

    releaseMouse: function () {
        this.lookAround  = false;
    }
});