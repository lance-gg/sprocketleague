'use strict';

const ServerEngine = require('incheon').ServerEngine;

class SLServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/Ball'));
        this.serializer.registerClass(require('../common/Arena'));
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);

        let makePlayerCar = () => {
            this.gameEngine.makeCar(socket.playerId);
        };

        // handle client restart requests
        socket.on('requestRestart', makePlayerCar);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        this.gameEngine.removeCar(playerId);
    }
}

module.exports = SLServerEngine;
