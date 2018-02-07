'use strict';

import ServerEngine from 'lance/ServerEngine';

export default class SLServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);

        gameEngine.on('scoreChange', this.updateMetaData, this);
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);

        let makePlayerCar = (team) => {
            let playerTeam;
            if (team == 'red') {
                playerTeam = 'red';
            } else if (team == 'blue') {
                playerTeam = 'blue';
            } else {
                // make sure players join the right team
                if (this.gameEngine.metaData.teams.red.players.length < this.gameEngine.metaData.teams.blue.players.length) {
                    playerTeam = 'red';
                } else{
                    playerTeam = 'blue';
                }
            }

            // console.log('add car', playerTeam, socket.playerId);
            if (this.gameEngine.metaData.teams[playerTeam]) {
                this.gameEngine.metaData.teams[playerTeam].players.push(socket.playerId);
                this.gameEngine.makeCar(socket.playerId, playerTeam);
                this.updateMetaData();
            } else{
                console.error('no such team', playerTeam);
            }
        };

        // handle client restart requests
        socket.on('requestRestart', makePlayerCar);
        socket.on('requestMetaDataUpdate', ()=>{
            this.updateMetaData(socket);
        });

        socket.on('keepAlive', ()=>{
            this.resetIdleTimeout(socket);
        });

        this.updateMetaData();
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        this.gameEngine.removeCar(playerId);

        // remove player from team
        let redTeam = this.gameEngine.metaData.teams['red'];
        let blueTeam = this.gameEngine.metaData.teams['blue'];

        let redTeamIndex = redTeam.players.indexOf(playerId);
        if (redTeamIndex > -1) {
            redTeam.players.splice(redTeamIndex, 1);
        }

        let blueTeamIndex = blueTeam.players.indexOf(playerId);
        if (blueTeamIndex > -1) {
            blueTeam.players.splice(blueTeamIndex, 1);
        }

        this.updateMetaData();
    }


    updateMetaData(socket) {
        if (socket) {
            socket.emit('metaDataUpdate', this.gameEngine.metaData);
        } else{
            // emit to all
            // delay so player socket can catch up
            setTimeout(() => {
                this.io.sockets.emit('metaDataUpdate', this.gameEngine.metaData);
            }, 100);
        }
    }

    gameStatus(statusQuery) {
        let statusString = super.gameStatus();
        if (statusQuery && statusQuery.debug) {
            let lanceStatus = JSON.parse(statusString);
            lanceStatus.log = this.gameEngine.log;
            statusString = JSON.stringify(lanceStatus);
        }
        return statusString;
    }
}
