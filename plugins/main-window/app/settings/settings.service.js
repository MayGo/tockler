'use strict';

angular.module('globalServices')
    .service('SettingsService', function (TrackItemService, $q) {
        var service = require('electron').remote.getGlobal('BackgroundService').getSettingsService();

        service.fetchWorkSettings = function () {
            return service.find('WORK_SETTINGS', {cacheResponse: false}).then(function (item) {
                return item
            }).catch(function () {
                return service.create({
                    id: 'WORK_SETTINGS'
                })
            });
        };

        service.getRunningLogItem = function () {
            return service.find('RUNNING_LOG_ITEM', {cacheResponse: false}).then(function (item) {
                var deferred = $q.defer();
                console.log("got RUNNING_LOG_ITEM: ", item);
                if (item.refId) {
                    TrackItemService.find(item.refId).then(function (logItem) {
                        console.log("resolved log item RUNNING_LOG_ITEM: ", logItem);
                        deferred.resolve(logItem)
                    })
                } else {
                    console.log("No RUNNING_LOG_ITEM ref id");
                    deferred.resolve()
                }
                return deferred.promise;
            }).catch(function () {
                return service.create({
                    id: 'RUNNING_LOG_ITEM'
                })
            });
        };
        service.saveRunningLogItemReferemce = function (logItemId) {
            service.update('RUNNING_LOG_ITEM', {refId: logItemId}).then(function (item) {
                console.log("Updated RUNNING_LOG_ITEM!", item);
            });
            if (logItemId) {
                //Lets update items end date
                TrackItemService.update(logItemId, {endDate: new Date()}).then(function (item) {
                    console.log("Updated log item to DB:", item);

                });
            }
        }
        return service;
    });
