import ClientEngine from 'lance/ClientEngine';
import MobileControls from '../client/MobileControls';
import KeyboardControls from '../client/KeyboardControls';
import SLRenderer from './SLRenderer';
import Utils from './Utils';

// The SoccerLeague client-side engine
export default class SLClientEngine extends ClientEngine {

    // constructor
    constructor(gameEngine, options) {
        super(gameEngine, options, SLRenderer);

        this.gameEngine.on('client__preStep', this.preStep, this);
    }

    step(t, dt, physicsOnly) {
        super.step(t, dt, physicsOnly);
    }

    // start then client engine
    start() {

        super.start();
        if (this.verbose) console.log(`starting client, registering input handlers`);

        if (this.renderer.isReady) {
            this.onRendererReady();
        } else {
            this.renderer.once('ready', this.onRendererReady, this);
        }

        // save reference to the ball
        this.gameEngine.on('objectAdded', obj => {
            if(obj.constructor.name == 'Ball'){
                this.gameEngine.ball = obj;
            }
            if(obj.constructor.name == 'Arena'){
                this.gameEngine.arena = obj;
            }
        });

        this.networkMonitor.on('RTTUpdate', (e) => {
            this.renderer.updateHUD(e);
        });

    }

    // extend ClientEngine connect to add own events
    connect() {
        return super.connect().then(() => {

            this.socket.on('disconnect', e => {
                console.log('disconnected');
                document.body.classList.add('disconnected');
                document.body.classList.remove('gameActive');
                document.querySelector('#reconnect').disabled = false;
            });

            this.socket.on('metaDataUpdate', e => {
                console.log('metaDataUpdate', e);
                this.gameEngine.metaData = e;
                this.renderer.onMetaDataUpdate();
            });

            if ('autostart' in Utils.getUrlVars()) {
                this.socket.emit('requestRestart');
            }

            // join a specific team
            if ('jointeam' in Utils.getUrlVars()) {
                this.socket.emit('requestRestart', Utils.getUrlVars().jointeam);
            }

            //in presentation mode make sure to not idle
            if ('presentation' in Utils.getUrlVars()) {
                setInterval(() =>{
                    this.socket.emit('keepAlive');
                }, 1000 * 10)
            }
        });
    }

    onRendererReady() {
        this.connect();

        //  Game input
        if (Utils.isTouchDevice()){
            this.controls = new MobileControls(this.renderer);
        } else {
            this.controls = new KeyboardControls(this.renderer);
        }

        document.querySelector('#joinGame').addEventListener('click', () => {
            if (Utils.isTouchDevice()){
                this.renderer.enableFullScreen();
            }
            this.socket.emit('requestRestart');
        });

        document.querySelector('#reconnect').addEventListener('click', () => {
            window.location.reload();
        });
    }

    // our pre-step is to process inputs that are "currently pressed" during the game step
    preStep() {
        if (this.controls) {
            if (this.controls.activeInput.up) {
                this.sendInput('up', { movement: true });
            }

            if (this.controls.activeInput.left) {
                this.sendInput('left', { movement: true });
            }

            if (this.controls.activeInput.right) {
                this.sendInput('right', { movement: true });
            }

            if (this.controls.activeInput.down) {
                this.sendInput('down', { movement: true });
            }
        }
    }

}
