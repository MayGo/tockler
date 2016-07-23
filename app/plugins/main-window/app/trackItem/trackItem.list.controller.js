'use strict';


angular.module('angularDemoApp')
    .controller('TrackItemListController', function (TrackItemService, $scope) {
        var ctrl = this;

        ctrl.searchMinDate = moment().startOf('day').toDate();
        ctrl.searchMaxDate = moment().startOf('day').add(1, 'days').toDate();
        ctrl.searchTask = 'AppTrackItem';
        ctrl.selectedItems = [];

        ctrl.query = {
            order: 'beginDate',
            limit: 15,
            page: 1
        };

        function success(items) {
            ctrl.trackItems = items;
            //$scope.$apply();
        }

        ctrl.list = function () {
            console.log("Refresh data");
            ctrl.promise = TrackItemService.findAllItems(ctrl.searchMinDate, ctrl.searchMaxDate, ctrl.searchTask, ctrl.searchStr, ctrl.query);
            ctrl.promise.then(success)
        };

        ctrl.removeItems = function (ids) {
            console.log("Removing items");
            ctrl.selectedItems = [];
            TrackItemService.deleteByIds(ids).then(function(){
                ctrl.list();
            });

        };

        ctrl.dateDiff = function(c) {
            return moment(c.endDate).diff(c.beginDate)
        };


        ctrl.list();

    });
