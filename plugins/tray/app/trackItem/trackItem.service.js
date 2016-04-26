'use strict';
angular.module('trayApp')
    .service('TrackItemService', function () {
        var service = require('remote').getGlobal('BackgroundService').getTrackItemService();
        return service;
    });
