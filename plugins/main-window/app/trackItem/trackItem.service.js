'use strict';

angular.module('angularDemoApp')
    .service('TrackItemService', function () {
        var service = require('remote').getGlobal('BackgroundService').getTrackItemService();
        return service;
    });
