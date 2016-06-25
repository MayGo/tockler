var Sequelize = require('sequelize');
var sequelize = new Sequelize('bdgt', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'example2.db',
});

/*
 sequelize.sync().then(function() {
 return User.create({
 username: 'janedoe',
 birthday: new Date(1980, 6, 20)
 });
 }).then(function(jane) {
 console.log(jane.get({
 plain: true
 }));
 });

 */
var Config = require("./config");
var fs = require('fs');

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
    data: Sequelize.TEXT
});

//sequelize.sync({force: true});
sequelize.sync();

module.exports.TrackItem = TrackItem;
module.exports.AppItem = AppItem;
module.exports.Settings = Settings;

