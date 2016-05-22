'use strict';

angular.module('trayApp')
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $locationProvider.html5Mode(false).hashPrefix('!');
        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: './app/app.html',
                controller: 'AppController',
                controllerAs: 'appCtrl'
            });

        $urlRouterProvider.otherwise('/app/logItem/list');
    });
