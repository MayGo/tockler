'use strict';

angular.module('globalServices')
    .service('SettingsService', function (TrackItemService, $q) {
        var service = require('electron').remote.getGlobal('BackgroundService').getSettingsService();

        service.fetchWorkSettings = function () {
            return service.findByName('WORK_SETTINGS').then(function (item) {
                return angular.fromJson(item)
            });
        };

        service.getRunningLogItem = function () {
            return service.findByName('RUNNING_LOG_ITEM').then(function (item) {
                var deferred = $q.defer();
                console.log("got RUNNING_LOG_ITEM: ", item);
                if (item.data) {
                    TrackItemService.findById(item.refId).then(function (logItem) {
                        console.log("resolved log item RUNNING_LOG_ITEM: ", logItem);
                        deferred.resolve(logItem)
                    })
                } else {
                    console.log("No RUNNING_LOG_ITEM ref id");
                    deferred.resolve()
                }
                return deferred.promise;
            });
        };
        service.saveRunningLogItemReferemce = function (logItemId) {
            service.updateByName('RUNNING_LOG_ITEM', logItemId).then(function (item) {
                console.log("Updated RUNNING_LOG_ITEM!", item);
            });
            if (logItemId) {
                //Lets update items end date
                TrackItemService.updateEndDateWithNow(logItemId).then(function (item) {
                    console.log("Updated log item to DB:", item);

                });
            }
        }
        return service;
    });
