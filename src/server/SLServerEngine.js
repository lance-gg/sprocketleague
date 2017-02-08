'use strict';

const ServerEngine = require('incheon').ServerEngine;

class SLServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/SumoRing'));
        this.serializer.registerClass(require('incheon').serialize.ThreeVector);
        this.serializer.registerClass(require('incheon').serialize.Quaternion);
    }
}

module.exports = SLServerEngine;
