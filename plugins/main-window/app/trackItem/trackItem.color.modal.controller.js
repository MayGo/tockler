'use strict';

angular.module('angularDemoApp')
    .controller('TrackItemColorModalController', function ($mdDialog) {
        var ctrl = this;

        ctrl.answer = function (config) {
            $mdDialog.hide(config);
        };
    });
