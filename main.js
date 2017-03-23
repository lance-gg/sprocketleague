'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

// Constants
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');

// network servers and routes
const server = express();
server.get('/', (req, res) => { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
const requestHandler = server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(requestHandler);

// get game classes
const MatchMaker = require('lance-gg').MatchMaker;
const SLServerEngine = require('./src/server/SLServerEngine.js');
const SLGameEngine = require('./src/common/SLGameEngine.js');
const CannonPhysicsEngine = require('lance-gg').physics.CannonPhysicsEngine;

// create instances
const physicsEngine = new CannonPhysicsEngine();
const gameEngine = new SLGameEngine({ physicsEngine, traceLevel: 0 });
const serverEngine = new SLServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });
new MatchMaker(server, serverEngine, {
    pollPeriod: 10,
    domain: 'herokuapp.com',
    hostname: 'sprocketleagueus'
});

// start the game
serverEngine.start();
