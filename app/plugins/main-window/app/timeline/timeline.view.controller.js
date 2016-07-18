'use strict';
var ipc = require("electron").ipcRenderer;

angular.module('angularDemoApp')
    .controller('TimelineViewController', function ($window, $rootScope, $mdDialog, $scope, $filter,
                                                    TrackItemService, settingsData, $sessionStorage, AppSettingsService) {
        var ctrl = this;

        var loadedItems;
        ctrl.visibleItems = [];

        var resetLoadedItems = function () {
            ctrl.selectedTrackItem = null;
            loadedItems = {
                AppTrackItem: [],
                StatusTrackItem: [],
                LogTrackItem: []
            };
        };
        resetLoadedItems();

        ctrl.selectedTrackItem = null;
        ctrl.pieData = {};
        ctrl.dayStats = {};

        var w = $window.innerWidth;
        var pieWidth = w / 3 - 100 * 3;

        var refreshWindow = function (event, arg) {
            console.log("Main-Window gained focus, reloading");
            ctrl.refresh();
        };

        var parseReceivedTimelineData = function (event, startDate, taskName, items) {
            console.log('TIMELINE_LOAD_DAY_RESPONSE received', taskName);

            var nothingToUpdate = false;
            var upsert = function (arr, id, newval) {
                if (nothingToUpdate === true) {
                    arr.push(newval);
                    //console.log('Nothing to update, inserting instead');
                    return;
                }
                var index = _.indexOf(arr, _.find(arr, {id: id}));
                if (index === -1) {
                    arr.push(newval);
                    nothingToUpdate = true;
                } else {
                    arr.splice(index, 1, newval);
                }
            };

            if (loadedItems[taskName].length === 0) {
                loadedItems[taskName] = items;
            } else {
                _.each(items, function (item) {
                    upsert(loadedItems[taskName], item._id, item);
                });
            }

            ctrl.loading = false;
            console.log('Trackitems loaded, parsing ended.', taskName);
            $scope.$broadcast('addItemsToTimeline', loadedItems[taskName]);

            updatePieCharts(loadedItems[taskName], taskName);

            if (taskName === 'AppTrackItem') {
                setWorkStatsForDay(loadedItems[taskName]);
                ctrl.visibleItems = loadedItems[taskName];
            }

            $scope.$digest();
            console.log('Trackitems loaded, $digest.');
        };

        ipc.on('main-window-focus', refreshWindow);
        ipc.on('TIMELINE_LOAD_DAY_RESPONSE', parseReceivedTimelineData);

        $scope.$on('$destroy', function iVeBeenDismissed() {
            ipc.removeListener('main-window-focus', refreshWindow);
            ipc.removeListener('TIMELINE_LOAD_DAY_RESPONSE', parseReceivedTimelineData);
        });

        ctrl.pieOptions = {
            chart: {
                type: 'pieChart',
                height: pieWidth,
                width: pieWidth,
                x: function (d) {
                    if (d.app === 'Default') {
                        return d.title
                    }
                    return (d.app) ? d.app : 'undefined';
                },
                y: function (d) {
                    return d.timeDiffInMs;
                },
                color: function (d) {
                    return d.color;
                },
                valueFormat: function (d) {
                    return $filter('msToDuration')(d);
                },
                showLabels: false,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                showLegend: false,
                donut: true,
                donutRatio: 0.30
            }
        };

        ctrl.dayBack = function () {
            resetLoadedItems();
            ctrl.searchDate = moment(ctrl.searchDate).subtract(1, 'days').toDate();
            ctrl.list(ctrl.searchDate);
        };

        ctrl.dayForward = function () {
            resetLoadedItems();
            ctrl.searchDate = moment(ctrl.searchDate).add(1, 'days').toDate();
            ctrl.list(ctrl.searchDate);
        };

        ctrl.changeDay = function (day) {
            resetLoadedItems();
            ctrl.list(day);
        };

        ctrl.refresh = function () {
            var lastItem = (loadedItems['AppTrackItem'].length > 0) ? _(loadedItems['AppTrackItem']).last().valueOf() : null;

            var searchFrom = (lastItem) ? lastItem.beginDate : moment().startOf('day').toDate();
            console.log('Refreshing from:', searchFrom);
            ctrl.list(searchFrom);
        };

        ctrl.reload = function () {
            resetLoadedItems();
            var searchFrom = ctrl.searchDate;
            console.log('Reloading from:', searchFrom);
            ctrl.list(searchFrom);
        };

        ctrl.loading = false;

        ctrl.list = function (startDate) {
            console.log("Load data from:", startDate);
            ctrl.zoomScale = $sessionStorage.zoomScale || 0;
            ctrl.zoomX = $sessionStorage.zoomX || 0;
            ctrl.loading = true;

            _.keys(loadedItems).forEach(function (taskName) {
                console.log('TIMELINE_LOAD_DAY_REQUEST sent', startDate, taskName);
                ipc.send('TIMELINE_LOAD_DAY_REQUEST', startDate, taskName);
            })
        };

        function setWorkStatsForDay(items) {
            var firstItem = _.first(items);
            if (firstItem && settingsData.workDayStartTime) {

                var parts = settingsData.workDayStartTime.split(':')
                var startDate = moment(firstItem.beginDate);
                startDate.startOf('day');
                startDate.hour(parts[0]);
                startDate.minute(parts[1]);
                ctrl.dayStats.lateForWork = moment(firstItem.beginDate).diff(startDate)
            }
        }

        function sumApp(p, c) {
            return _.extend(p, {
                timeDiffInMs: p.timeDiffInMs + moment(c.endDate).diff(c.beginDate)
            });
        }

        var updatePieCharts = function (items, taskName) {

            console.log('Track Items changed. Updating pie charts');

            var groupBy = (taskName === 'LogTrackItem') ? 'title' : 'app'
            ctrl.pieData[taskName] = _(items)
                .groupBy(groupBy)
                .map(function (b) {
                    return b.reduce(sumApp, {app: b[0].app, title: b[0].title, timeDiffInMs: 0, color: b[0].color})
                })
                .valueOf();
            
            console.log('Updating pie charts ended.');

        };

        ctrl.onZoomChanged = function (scale, x) {
            $sessionStorage.zoomScale = scale;
            $sessionStorage.zoomX = x;
        };

        ctrl.showAddLogDialog = function (trackItem) {
            console.log(trackItem);
            $mdDialog.show({
                templateUrl: 'app/trackItem/trackItem.edit.modal.html',
                controller: 'TrackItemEditModalController as trackItemModalCtrl',
                parent: angular.element(document.body),
                locals: {
                    trackItem: trackItem
                },
                clickOutsideToClose: true
            }).then(function (trackItem) {
                console.log('TrackItem added.');
                ctrl.saveTrackItem(trackItem)
            });
        };

        ctrl.saveTrackItem = function (trackItem) {
            console.log("Saving trackitem.", trackItem);
            if (!trackItem.taskName) {
                trackItem.taskName = "LogTrackItem";
            }
            if (trackItem.id) {
                $mdDialog.show({
                    templateUrl: 'app/trackItem/trackItem.color.modal.html',
                    controller: 'TrackItemColorModalController as trackItemColorCtrl',
                    parent: angular.element(document.body)
                })
                    .then(function (answer) {
                        if (answer === 'ALL_ITEMS') {
                            ctrl.loading = true;
                            AppSettingsService.changeColorForApp(trackItem.app, trackItem.color);
                            TrackItemService.updateColorForApp(trackItem.app, trackItem.color).then(function () {
                                console.log("updated all item with color");
                                ctrl.reload();
                            })
                        } else if (answer === 'NEW_ITEMS') {
                            AppSettingsService.changeColorForApp(trackItem.app, trackItem.color);
                            updateItem(trackItem);
                        } else {
                            updateItem(trackItem);
                        }

                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });

            } else {
                if (!trackItem.app) {
                    trackItem.app = "Default";
                }
                TrackItemService.create(trackItem).then(function (item) {
                    console.log("Created trackitem to DB:", item);
                    ctrl.selectedTrackItem = null;

                    $scope.$broadcast('addItemToTimeline', item);

                    loadedItems[trackItem.taskName].push(item);
                    updatePieCharts(loadedItems[trackItem.taskName], trackItem.taskName);
                    $scope.$digest();
                });
            }

        };
        var updateItem = function (trackItem) {
            TrackItemService.updateItem(trackItem).then(function (item) {
                console.log("Updated trackitem to DB:", item);
                ctrl.selectedTrackItem = null;

                $scope.$broadcast('addItemToTimeline', item);

                var update = function (arr, id, newval) {
                    var index = _.indexOf(arr, _.find(arr, {id: id}));
                    arr.splice(index, 1, newval);
                };

                update(loadedItems[trackItem.taskName], item._id, item);
                updatePieCharts(loadedItems[trackItem.taskName], trackItem.taskName);
                $scope.$apply();
            });
        };

        ctrl.deleteTrackItem = function (trackItem) {
            console.log("Deleting trackitem.", trackItem);

            if (trackItem.id) {
                TrackItemService.deleteById(trackItem.id).then(function (item) {
                    console.log("Deleting trackitem from DB:", trackItem);
                    ctrl.selectedTrackItem = null;

                    var index = _.indexOf(ctrl.trackItems, _.find(loadedItems[trackItem.taskName], {id: trackItem.id}));
                    loadedItems[trackItem.taskName].splice(index, 1);
                    updatePieCharts(loadedItems[trackItem.taskName], trackItem.taskName);
                    $scope.$broadcast('removeItemsFromTimeline', loadedItems[trackItem.taskName]);
                    $scope.$apply();
                });
            } else {
                console.log("No id, not deleting from DB");
            }

        };

        ctrl.closeMiniEdit = function () {
            console.log("Closing mini edit.");
            ctrl.selectedTrackItem = null;
        };

        // Initialy load todays data
        ctrl.searchDate = moment().startOf('day').toDate();
        ctrl.list(ctrl.searchDate);

    });
