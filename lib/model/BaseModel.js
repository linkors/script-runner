const fs = require('fs');
const path = require('path');

function BaseModel () {
    this.basePath = path.resolve(__dirname, `../../`);
}
BaseModel.prototype.setBasePath = function(pathname) {
    this.basePath = path.resolve(__dirname, `../../${pathname}`);
    if (!fs.existsSync(this.basePath)){
        fs.mkdirSync(this.basePath, { recursive: true });
    } 
}
BaseModel.prototype.saveData = function(name, json) {
    try {
        fs.writeFileSync(path.resolve(this.basePath, `${name}.json`), JSON.stringify(json, null, 2), 'utf8');
        return {
            success: true,
        }
    } catch(err) {
        return {
            success: false,
            error: err
        }
    }
};
BaseModel.prototype.loadData = function(name, default_data = []) {
    try {
        const json = require(`${this.basePath}/${name}.json`);
        return json;
    } catch (e) {
        return default_data;
    }
};
BaseModel.prototype.listData = function () {
    return fs.readdirSync(this.basePath).map(file => file.slice(0, -5))
}

module.exports = BaseModel;