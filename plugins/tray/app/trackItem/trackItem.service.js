'use strict';
angular.module('trayApp')
    .service('TrackItemService', function () {

        return require('remote').getGlobal('trackItemServiceInst');
    });
