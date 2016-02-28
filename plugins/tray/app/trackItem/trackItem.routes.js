'use strict';

angular.module('trayApp.trackItem')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.trackItem', {
        url: '/trackItem',
        abstract: true,
        template: '<div ui-view="page" class="fade-in-up"></div>'
      })
      .state('app.trackItem.list', {
        url: '/list?search',
        views: {
          'page@app.trackItem': {
            templateUrl: 'app/trackItem/trackItem.list.html',
            controller: 'TrackItemListController as trackItemCtrl'
          }
        }
      });
  });
