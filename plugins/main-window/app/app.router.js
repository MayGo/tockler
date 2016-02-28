'use strict';

angular.module('angularDemoApp')
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        console.log("Routes loaded");
        $locationProvider.html5Mode(false).hashPrefix('!');
        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: './app/app.html',
                controller: 'AppController',
                controllerAs: 'appCtrl'
            });

        $urlRouterProvider.otherwise('/app/timeline/view');
    });
