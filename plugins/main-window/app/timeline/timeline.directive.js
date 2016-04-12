'use strict';

function Timeline($window, $rootScope, $document) {


    var link = function (scope, element, attrs, ctrl) {

        ctrl.init(element[0]);
        scope.$watch('timelineDirectiveCtrl.trackItems', function (newVal, oldVal) {
                ctrl.onTrackItemsChanged(newVal, oldVal);
            }
        );

        /*scope.$on('windowResize', resize);
         */
        scope.$on('addItemToTimeline', function (event, trackItem) {
            console.log('Adding Item to timeline:', trackItem);
            ctrl.addItemsToTimeline([trackItem]);
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