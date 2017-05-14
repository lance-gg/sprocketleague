'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

// Constants
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './dist/index.html');

// network servers
const server = express();
const requestHandler = server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(requestHandler);

// get game classes
const SLServerEngine = require('./src/server/SLServerEngine.js');
const SLGameEngine = require('./src/common/SLGameEngine.js');
const CannonPhysicsEngine = require('lance-gg').physics.CannonPhysicsEngine;
const LancePro = require('lance-pro');

// create instances
const physicsEngine = new CannonPhysicsEngine();
const gameEngine = new SLGameEngine({ physicsEngine, traceLevel: 0 });
const serverEngine = new SLServerEngine(io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 20 });
new LancePro.StatsCollector(gameEngine);
new LancePro.MatchMakerTarget(server, serverEngine);

// can define routes after the matchmaker
server.get('/gameStatus', (req, res) => { res.send(serverEngine.gameStatus()); });
server.get('/', (req, res) => { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, './dist/')));

// start the game
serverEngine.start();
