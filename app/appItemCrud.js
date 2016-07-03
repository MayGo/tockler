const AppItem = require('./db').AppItem;
var $q = require('q');
var randomcolor = require('randomcolor');

/**
 * Module
 */

module.exports.getAppColor = function (appName) {
    'use strict';
    var deferred = $q.defer();
    var params = {
        where: {
            name: appName
        }
    };

    AppItem.findAll(params).then(function (items) {
        if (items.length > 0) {
            deferred.resolve(items[0].color);
        } else {
            var color = randomcolor();
            AppItem.create({name: appName, color: color}).then(function (item) {
                console.log("Created color item to DB:", item);
            });
            deferred.resolve(color);
        }
    });
    return deferred.promise;
};

module.exports.changeColorForApp = function  (appName, color) {
    'use strict';
    var deferred = $q.defer();

    var params = {
        where: {
            name: appName
        }
    };

    console.log("Quering color with params:", params);
    AppItem.findAll(params).then(function (items) {
        if (items.length > 0) {
            items[0].color = color;
            items[0].save();
            console.log("Saved color item to DB:", items[0]);

            deferred.resolve(items[0]);
        }else {
            AppItem.create({name: appName, color: color}).then(function (item) {
                console.log("Created color item to DB:", item);
                deferred.resolve(item);
            });

        }
    });

    return deferred.promise;
};