'use strict';

angular.module('globalServices')
    .service('AppSettingsService', function () {
        var service = require('electron').remote.getGlobal('BackgroundService').getAppSettingsService();

        return service;
    });
