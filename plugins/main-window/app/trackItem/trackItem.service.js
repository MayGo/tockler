'use strict';

angular.module('globalServices', [])
    .service('TrackItemService', function () {
        var service = require('remote').getGlobal('BackgroundService').getTrackItemService();
        return service;
    });
