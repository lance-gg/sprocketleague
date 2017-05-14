const qsOptions = require('query-string').parse(location.search);
const SLClientEngine = require('./SLClientEngine');
const SLGameEngine = require('../common/SLGameEngine');
const CannonPhysicsEngine = require('lance-gg').physics.CannonPhysicsEngine;
require('../../dist/resources/sass/main.scss');

// the official Lance.gg sprocketleague uses a matchmaker
let matchmaker = null;
if (window.location.hostname === 'sprocketleagueus.lance.gg')
    matchmaker = 'http://srv.lance.gg/sprocketleagueus.lance.gg/matchmaker';

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: 1000,
    delayInputCount: 3,
    clientIDSpace: 1000000,
    matchmaker: matchmaker,
    syncOptions: {
        sync: qsOptions.sync || 'extrapolate',
        localObjBending: 0.6,
        remoteObjBending: 0.8,
        bendingIncrements: 6
    },
    autoConnect: false
};
let options = Object.assign(defaults, qsOptions);

// create the singletons
const physicsEngine = new CannonPhysicsEngine();
const gameOptions = Object.assign({ physicsEngine }, options);
const gameEngine = new SLGameEngine(gameOptions);
const clientEngine = new SLClientEngine(gameEngine, options);

document.addEventListener('DOMContentLoaded', function(e) { clientEngine.start(); });
