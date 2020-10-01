const BaseModel = require('./BaseModel');
const path = require('path');

function Config() {};

Config.prototype = Object.create(BaseModel.prototype);

let instance = null;

module.exports = {
    getInstance: function () {
        if (instance !== null) {
            return instance
        }
        instance = new Config();
        instance.setBasePath('data/config');
        return instance;
    }
};