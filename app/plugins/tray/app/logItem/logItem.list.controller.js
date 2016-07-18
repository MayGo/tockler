'use strict';

var ipcRenderer = require("electron").ipcRenderer;

angular.module('trayApp')
    .controller('LogItemListController', function (TrackItemService, $rootScope, $scope, SettingsService, $mdToast, $q) {
        var ctrl = this;
        ctrl.trackItems = [];
        ctrl.newItem = {color: '#426DFC'};

        ctrl.loading = false;

        ctrl.list = function () {
            ctrl.loading = true;
            TrackItemService.findFirstLogItems().then(function (items) {
                ctrl.trackItems = items;
                ctrl.loading = false;
                items.forEach(function (item) {
                    item.timeDiffInMs = moment(item.endDate).diff(item.beginDate);
                    item.duration = moment.duration(item.endDate - item.beginDate);
                });
                $scope.$apply();
            });
        };

        ctrl.refresh = function () {
            console.log("Refresh data");
            SettingsService.getRunningLogItem().then(function (item) {
                console.log("Running log item.", item);
                ctrl.runningLogItem = item;
            });
            ctrl.list();
        };

        ipc.on('focus-tray', ctrl.refresh);


        ctrl.startNewLogItem = function (oldItem) {
            console.log("startNewLogItem");

            var newItem = {};
            newItem.app = oldItem.app || "WORK";
            newItem.taskName = "LogTrackItem";
            newItem.color = oldItem.color;
            newItem.title = oldItem.title;
            newItem.beginDate = moment().toDate();
            newItem.endDate = moment().add(60, 'seconds').toDate();

            var qWhen = $q.when()

            if (ctrl.runningLogItem && ctrl.runningLogItem.id) {
                qWhen = ctrl.stopRunningLogItem();
            }

            qWhen.then(function () {
                TrackItemService.createItem(newItem).then(function (item) {
                    console.log("Created newItem to DB:", item);

                    ctrl.runningLogItem = item;
                    SettingsService.saveRunningLogItemReferemce(item.id);

                    var toast = $mdToast.simple()
                        .textContent('Task is running!');
                    $mdToast.show(toast);

                    $scope.$apply();
                });
            })
        };

        ctrl.stopRunningLogItem = function () {
            console.log("stopRunningLogItem");

            return TrackItemService.updateEndDateWithNow(ctrl.runningLogItem.id).then(function (item) {
                console.log("Updated trackitem to DB:", item);

                ctrl.runningLogItem = null;
                SettingsService.saveRunningLogItemReferemce(null);
                var toast = $mdToast.simple()
                    .textContent('Running task is stopped!');
                $mdToast.show(toast);
                $scope.$apply();
            });
        };

        ctrl.refresh();
    });
