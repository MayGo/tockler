'use strict';

angular.module('angularDemoApp')
    .controller('SummaryViewController', function ($rootScope, $mdDialog, $scope, TrackItemService) {
        var ctrl = this;

        ctrl.trackItems = [];
        ctrl.selectedTrackItem = null;
        console.log($scope)
        //ctrl.maxDate = new Date();

        function getTomorrow(d) {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
        }

        var today = new Date();
        var tomorrow = getTomorrow(today);
        ctrl.searchMinDate = today;
        ctrl.searchMaxDate = tomorrow;

        today.setHours(0, 0, 0, 0);
        console.log(today, tomorrow);

        ctrl.loading = false;
        ctrl.list = function () {
            console.log("Refresh data");
            ctrl.loading = true;
            TrackItemService.findAll({

                orderBy: [
                    ['beginDate', 'DESC']
                ], where: {
                    taskName: {
                        '==': 'LogTrackItem'
                    },
                    beginDate: {
                        '>=': ctrl.searchMinDate,
                        '<': ctrl.searchMaxDate
                    }
                }
            }).then(function (items) {
                ctrl.trackItems = items;
                ctrl.loading = false;
                items.forEach(function(item) {
                    item.timeDiffInMs = moment(item.endDate).diff(item.beginDate)
                    item.duration = moment.duration(item.endDate - item.beginDate);
                });
                $rootScope.$apply();
            });
        };

        ctrl.list();

    });
