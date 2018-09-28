import querystring from 'query-string';
import SLClientEngine from './SLClientEngine';
import SLGameEngine from '../common/SLGameEngine';
import Trace from 'lance/lib/Trace';
const qsOptions = querystring.parse(location.search);
require('../../dist/resources/sass/main.scss');

// the official Lance.gg sprocketleague uses a matchmaker
let matchmaker = null;
if (window.location.hostname === 'sprocketleagueus.lance.gg' ||
    window.location.hostname === 'sprocketleague.lance.gg')
    matchmaker = 'http://srv.lance.gg/sprocketleagueus.lance.gg/matchmaker';

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: Trace.TRACE_NONE,
    delayInputCount: 3,
    matchmaker: matchmaker,
    scheduler: 'render-schedule',
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
const gameEngine = new SLGameEngine(options);
const clientEngine = new SLClientEngine(gameEngine, options);

document.addEventListener('DOMContentLoaded', function(e) { clientEngine.start(); });
