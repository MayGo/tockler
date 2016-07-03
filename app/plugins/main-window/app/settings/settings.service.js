'use strict';

angular.module('globalServices')
    .service('SettingsService', function () {
        var service = require('electron').remote.getGlobal('BackgroundService').getSettingsService();

        return service;
    });
