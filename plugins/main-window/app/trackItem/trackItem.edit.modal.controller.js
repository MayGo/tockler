'use strict';


angular.module('angularDemoApp')
    .controller('TrackItemEditModalController', function ($mdDialog, $scope, trackItem) {
        var ctrl = this;

        ctrl.cancel = function () {
            $mdDialog.cancel();
        };

        var today = moment().startOf('day');
        if (trackItem) {
            ctrl.trackItem = trackItem
        } else {
            ctrl.selectedDate = today.toDate();
            ctrl.trackItem = {
                app: 'Log',
                taskName: 'LogTrackItem',
                color: '#ff0000'
            };
        }

        ctrl.save = function () {
            console.log("Closing log track item.");
            $mdDialog.hide(ctrl.trackItem);
        };
        $scope.$watch('trackItemModalCtrl.selectedDate', function (oldValue, newValue) {
            console.log('Date changed:', newValue)
            if (!ctrl.trackItem.beginDate) {
                ctrl.trackItem.beginDate = moment(newValue).add(7, 'hours').toDate();
            }
            if (!ctrl.trackItem.endDate) {
                ctrl.trackItem.endDate = moment(newValue).add(8, 'hours').toDate();
            }


        })


    });
