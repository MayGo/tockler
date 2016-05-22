'use strict';

angular.module('globalServices')
    .service('AppSettingsService', function () {
        var service = require('electron').remote.getGlobal('BackgroundService').getAppSettingsService();

        service.changeColorForApp = function (appName, color) {
            var params = {
                name: appName
            };
            console.log("Quering color with params:", params);
            service.findAll(params).then(function (items) {
                if (items.length > 0) {
                    items[0].color = color;
                    items[0].DSSave();
                    console.log("Saved color item to DB:", items[0]);
                } else {
                    service.create({name: appName, color: color}).then(function (item) {
                        console.log("Created color item to DB:", item);
                    });
                }
            });
        };

        return service;
    });
