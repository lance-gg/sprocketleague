import querystring from 'query-string';
import { Lib } from 'lance-gg';
import SLClientEngine from './SLClientEngine';
import SLGameEngine from '../common/SLGameEngine';
const qsOptions = querystring.parse(location.search);
require('../../dist/resources/sass/main.scss');

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: Lib.Trace.TRACE_NONE,
    delayInputCount: 3,
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
