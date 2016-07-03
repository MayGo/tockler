'use strict';

angular.module('globalServices', [])
    .service('TrackItemService', function () {
        var service = require('electron').remote.getGlobal('BackgroundService').getTrackItemService();

        return service;
    })
;
