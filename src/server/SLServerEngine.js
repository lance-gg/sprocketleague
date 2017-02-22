'use strict';

const ServerEngine = require('incheon').ServerEngine;

class SLServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/Ball'));
        this.serializer.registerClass(require('../common/Arena'));
    }
}

module.exports = SLServerEngine;
