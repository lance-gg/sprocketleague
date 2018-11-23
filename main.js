import express from 'express';
import socketIO from 'socket.io';
import path from 'path';

// Constants
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './dist/index.html');

// network servers
const server = express();

// get game classes
import SLServerEngine from './src/server/SLServerEngine.js';
import SLGameEngine from './src/common/SLGameEngine.js';
import Trace from 'lance/lib/Trace';
const LancePro = require('lance-pro');


// can define routes after the matchmaker
server.get('/gameStatus', (req, res) => { res.send(serverEngine.gameStatus()); });
server.get('/', (req, res) => { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, './dist/')));
const requestHandler = server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(requestHandler);
io.set('origins', '*:*');

// create instances
const gameEngine = new SLGameEngine({ traceLevel: Trace.TRACE_NONE });
const serverEngine = new SLServerEngine(io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 20 });
new LancePro.StatsCollector(gameEngine);
new LancePro.MatchMakerTarget(server, serverEngine);

// start the game
serverEngine.start();
