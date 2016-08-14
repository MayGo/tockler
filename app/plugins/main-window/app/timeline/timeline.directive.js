'use strict';

function Timeline($window, $rootScope, $document) {


    var link = function (scope, element, attrs, ctrl) {

        ctrl.init(element[0]);

        scope.$watch('timelineDirectiveCtrl.startDate', function (newVal, oldVal) {
                console.log("StartDate change", newVal, oldVal);
                 ctrl.changeDay(newVal);
            }
        );

        scope.$watch('timelineDirectiveCtrl.selectedTrackItem', function (newVal, oldVal) {
                console.log('SelectedTrackItem changed', newVal, oldVal);
                if (newVal === null) {
                    console.log('Clearing brush....');
                    //ctrl.clearBrush();
                }
            }
        );

        /*scope.$on('windowResize', resize);
         */
        scope.$on('addItemToTimeline', function (event, trackItem) {
            console.log('Adding Item to timeline:', trackItem);
            ctrl.addItemsToTimeline([trackItem]);
        });

        scope.$on('addItemsToTimeline', function (event, trackItems) {
            console.log('Adding Items to timeline:', trackItems);
            //ctrl.removeItemsFromTimeline(trackItems);
            ctrl.addItemsToTimeline(trackItems);
        });

        scope.$on('removeItemsFromTimeline', function (event, trackItems) {
            console.log('Removing Items from timeline(refreshing):', trackItems.length);
           // ctrl.removeItemsFromTimeline(trackItems);
        });

    }

    return {

        controller: 'TimelineDirectiveController',
        controllerAs: 'timelineDirectiveCtrl',

        scope: {
            trackItems: '=',
            startDate: '=',
            selectedTrackItem: '=',
            onZoomChanged: '=',
            zoomScale: '=',
            zoomX: '='
        },
        bindToController: true,

        link: link,
        restrict: 'E'
    };
}

angular
    .module('angularDemoApp.timeline')
    .directive('timeline', Timeline);