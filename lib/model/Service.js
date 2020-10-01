const BaseModel = require('./BaseModel');

function Service () {};

Service.prototype = Object.create(BaseModel.prototype);

Service.prototype.loadData = function () {
    return BaseModel.prototype.loadData.call(this, 'services', {})
}
Service.prototype.saveData = function (json) {
    return BaseModel.prototype.saveData.call(this, 'services', json)
}

let instance = null;
module.exports = {
    getInstance: function () {
        if (instance !== null) {
            return instance
        }
        instance = new Service();
        instance.setBasePath('data')
        return instance;
    }
};