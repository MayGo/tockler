'use strict';


angular.module('trayApp')
    .controller('TrackItemListController', function (TrackItemService, $rootScope, $scope) {
        var ctrl = this;
        ctrl.trackItems = [];

        var today = moment().startOf('day');

        ctrl.loading = false;
        ctrl.list = function () {
            console.log("Refresh data");

            ctrl.loading = true;
            TrackItemService.findAll({
                limit: 10,
                orderBy: [
                    ['beginDate', 'DESC']
                ], where: {
                    taskName: {
                        '==': 'LogTrackItem'
                    }
                }
            }).then(function (items) {
                ctrl.trackItems = items;
                ctrl.loading = false;
                items.forEach(function (item) {
                    item.timeDiffInMs = moment(item.endDate).diff(item.beginDate);
                    item.duration = moment.duration(item.endDate - item.beginDate);
                });
                $rootScope.$apply();
            });
        };


        ctrl.startNewLogItem = function (oldItem) {
            console.log("startNewLogItem");

            var newItem = {};
            newItem.app = "Default";
            newItem.taskName = "LogTrackItem";
            newItem.color = oldItem.color;
            newItem.title = oldItem.title;
            newItem.beginDate = moment().toDate();
            newItem.endDate = moment().add(60, 'seconds').toDate();

            TrackItemService.create(newItem).then(function (item) {
                console.log("Created newItem to DB:", item);

                //$scope.$broadcast('addItemToTimeline', item);
                ctrl.runningLogItem = item;
                $scope.$apply();
            });
        };

        ctrl.stopRunningLogItem = function () {
            console.log("startNewLogItem");

            TrackItemService.update(ctrl.runningLogItem.id, {endDate: new Date()}).then(function (item) {
                console.log("Updated trackitem to DB:", item);

                ctrl.runningLogItem = null;
                $scope.$apply();
            });
        };

        ctrl.list();
    });
