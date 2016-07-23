var Sequelize = require('sequelize');

var app = require('electron').app;
var path = require('path');
var userDir = app.getPath('userData');
var outputPath = path.join(userDir, 'tracker.db');

console.log('DB output path: ' + outputPath);
var sequelize = new Sequelize('bdgt', 'username', 'password', {
    dialect: 'sqlite',
    storage: outputPath,
    logging: false
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
    endDate: {
        type: Sequelize.DATE,
        validate: {
            isAfter: function (value) {
                if (this.beginDate > value) {
                    throw new Error('BeginDate must be before endDate! ' + this.beginDate + ' - ' + value);
                }
            }
        }
    }
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
sequelize.sync().then(function () {
    console.log("Database synced.");
}).catch(function (error) {
    console.error("Database not synced.", error);
});

module.exports.TrackItem = TrackItem;
module.exports.AppItem = AppItem;
module.exports.Settings = Settings;

