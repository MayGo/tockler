'use strict';

angular.module('angularDemoApp')
    .service('SettingsService', function () {
        var service = require('remote').getGlobal('BackgroundService').getSettingsService();

        service.fetchSettings = function(){
            return service.find(18, {cacheResponse: false}).then(function (item) {
                return item
            }).catch(function () {
                return service.create({
                    id: 18
                })
            });
        }
        return service;
    });
