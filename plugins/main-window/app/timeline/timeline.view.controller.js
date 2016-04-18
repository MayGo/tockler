'use strict';
var ipc = require("electron").ipcRenderer

angular.module('angularDemoApp')
    .controller('TimelineViewController', function ($window, $rootScope, $mdDialog, $scope, $filter, TrackItemService, settingsData, $sessionStorage) {
        var ctrl = this;

        ctrl.trackItems = [];
        var loadedItems = [];
        ctrl.selectedTrackItem = null;
        ctrl.pieData = [];
        ctrl.dayStats = {};

        var w = $window.innerWidth;
        var pieWidth = w / 3 - 16 * 3;

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

        function getTomorrow(d) {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
        }

        ctrl.dayBack = function () {
            loadedItems = [];
            ctrl.searchDate = moment(ctrl.searchDate).subtract(1, 'days').toDate();
            ctrl.list(ctrl.searchDate);

        };
        ctrl.dayForward = function () {
            loadedItems = [];
            ctrl.searchDate = moment(ctrl.searchDate).add(1, 'days').toDate();
            ctrl.list(ctrl.searchDate);
        };

        ctrl.refresh = function () {
            var searchFrom = _.chain(ctrl.trackItems).filter(function (item) {
                return item.taskName === 'AppTrackItem';
            }).last().valueOf().beginDate;
            console.log('Refreshing from:', searchFrom);
            ctrl.list(searchFrom);
        };

        ctrl.loading = false;

        ctrl.list = function (startDate) {
            console.log("Load data from:", startDate);
            ctrl.zoomScale = $sessionStorage.zoomScale || 0;
            ctrl.zoomX = $sessionStorage.zoomX || 0;
            ctrl.loading = true;
            TrackItemService.findAll({

                orderBy: [
                    ['beginDate', 'ASC']
                ], where: {
                    endDate: {
                        '>=': startDate,
                        '<': getTomorrow(startDate)
                    }
                }
            }).then(function (items) {
                var upsert = function (arr, id, newval) {
                    var index = _.indexOf(arr, _.find(arr, {id: id}));
                    if (index === -1) {
                        arr.push(newval);
                    } else {
                        arr.splice(index, 1, newval);
                    }
                };
                if (loadedItems.length === 0) {
                    loadedItems = items;
                } else {
                    _.each(items, function (item) {
                        upsert(loadedItems, item._id, item);
                    });
                }

                ctrl.trackItems = loadedItems;
                ctrl.loading = false;
                $scope.$apply();

            });
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

        $scope.$watch('timelineCtrl.selectedTrackItem', function (newValue, oldValue) {
            if (newValue) {
                console.log('Track Item selected', newValue);
                // var el = angular.element( document.querySelector( '#trackItemMiniEdit'));
                // console.log(el)

            }
        }, true);

        $scope.$watchCollection('timelineCtrl.trackItems', function (items, oldValue) {

            console.log('Track Items changed. Updating pie charts');
            function sumApp(p, c) {
                return _.extend(p, {
                    timeDiffInMs: p.timeDiffInMs + moment(c.endDate).diff(c.beginDate)
                });
            };

            ctrl.pieDataApp = _.chain(items).filter(function (item) {
                return item.taskName === 'AppTrackItem';
            })
                .groupBy('app')
                .map(function (b) {
                    return b.reduce(sumApp, {app: b[0].app, timeDiffInMs: 0, color: b[0].color})
                })
                .valueOf();

            ctrl.pieDataLog = _.chain(items).filter(function (item) {
                return item.taskName === 'LogTrackItem';
            })
                .groupBy('title')
                .map(function (b) {
                    return b.reduce(sumApp, {app: b[0].app, title: b[0].title, timeDiffInMs: 0, color: b[0].color})
                })
                .valueOf();

            ctrl.pieDataStatus = _.chain(items).filter(function (item) {
                return item.taskName === 'StatusTrackItem';
            })
                .groupBy('app')
                .map(function (b) {
                    return b.reduce(sumApp, {app: b[0].app, timeDiffInMs: 0, color: b[0].color})
                })
                .valueOf();

            setWorkStatsForDay(items.filter(function (item) {
                return item.taskName === 'AppTrackItem';
            }));
            // $rootScope.$apply();

        });

        ctrl.onZoomChanged = function (scale, x) {
            $sessionStorage.zoomScale = scale;
            $sessionStorage.zoomX = x;
        };

        ipc.on('main-window-focus', function (event, arg) {
            console.log("Main-Window gained focus, reloading");
            ctrl.refresh();
        });

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
                TrackItemService.update(trackItem.id, trackItem).then(function (item) {
                    console.log("Updated trackitem to DB:", item);
                    ctrl.selectedTrackItem = null;

                    $scope.$broadcast('addItemToTimeline', item);

                    var update = function (arr, id, newval) {
                        var index = _.indexOf(arr, _.find(arr, {id: id}));
                        arr.splice(index, 1, newval);
                    };

                    update(ctrl.trackItems, item._id, item);

                    $scope.$apply();
                });
            } else {
                if (!trackItem.app) {
                    trackItem.app = "Default";
                }
                TrackItemService.create(trackItem).then(function (item) {
                    console.log("Created trackitem to DB:", item);
                    ctrl.selectedTrackItem = null;

                    $scope.$broadcast('addItemToTimeline', item);

                    ctrl.trackItems.push(item);

                    $scope.$apply();
                });
            }

        };

        ctrl.deleteTrackItem = function (trackItem) {
            console.log("Deleting trackitem.", trackItem);

            if (trackItem.id) {
                TrackItemService.destroy(trackItem.id).then(function (item) {
                    console.log("Deleting trackitem from DB:", trackItem);
                    ctrl.selectedTrackItem = null;

                    var index = _.indexOf(ctrl.trackItems, _.find(ctrl.trackItems, {id: trackItem.id}));
                    ctrl.trackItems.splice(index, 1);
                    $scope.$broadcast('removeItemsFromTimeline', ctrl.trackItems);
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
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        ctrl.searchDate = today;
        ctrl.list(today);

    });
