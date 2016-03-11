'use strict';


angular.module('angularDemoApp')
    .controller('TrackItemListController', function (TrackItemService, $rootScope) {
        var ctrl = this;

        ctrl.maxDate = new Date();


        function getTomorrow(d) {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
        }

        var today = new Date();
        var tomorrow = getTomorrow(today);
        ctrl.searchDate = today;

        today.setHours(0, 0, 0, 0);
        console.log(today, tomorrow);

        ctrl.dayBack = function () {
            ctrl.searchDate = moment(ctrl.searchDate).subtract(1, 'days').toDate();
            ctrl.list();

        };
        ctrl.dayForward = function () {
            ctrl.searchDate = moment(ctrl.searchDate).add(1, 'days').toDate();
            ctrl.list();
        };


        var PAGE_SIZE = 50;
        var currentPage = 1;
        ctrl.list = function () {
            console.log("Refresh data");

            TrackItemService.findAll({
                offset: PAGE_SIZE * (currentPage - 1),
                limit: PAGE_SIZE,
                orderBy: [
                    ['beginDate', 'DESC']
                ], where: {
                    beginDate: {
                        '>=': ctrl.searchDate,
                        '<': getTomorrow(ctrl.searchDate)
                    }
                }
            }, {
                keepChangeHistory: false,
                cacheResponse: false
            }).then(function (items) {
                ctrl.trackItems = items;
                $rootScope.$apply();
            });
        };

        ctrl.list();

    });
