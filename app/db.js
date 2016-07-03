var Sequelize = require('sequelize');

var app = require('electron').app;
var path = require('path');
var userDir = app.getPath('userData');
var outputPath = path.join(userDir, 'tracker.db');

console.log('DB output path: ' + outputPath);
var sequelize = new Sequelize('bdgt', 'username', 'password', {
    dialect: 'sqlite',
    storage: outputPath
});


/**
 * Schemas
 */

var TrackItem = sequelize.define('TrackItem', {
    app: Sequelize.STRING,
    taskName: Sequelize.STRING,
    title: Sequelize.STRING,
    color: Sequelize.STRING,
    beginDate: Sequelize.DATE,
    endDate: Sequelize.DATE
}, {timestamps: false});

var AppItem = sequelize.define('AppItem', {
    name: Sequelize.STRING,
    color: Sequelize.STRING
}, {timestamps: false});

var Settings = sequelize.define('Settings', {
    name: Sequelize.STRING,
    jsonData: {type: Sequelize.TEXT, defaultValue: '{}'}
});

//sequelize.sync({force: true});
sequelize.sync();

module.exports.TrackItem = TrackItem;
module.exports.AppItem = AppItem;
module.exports.Settings = Settings;

