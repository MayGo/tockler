'use strict';

angular.module('trayApp.logItem')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.logItem', {
        url: '/logItem',
        abstract: true,
        template: '<div ui-view="page"></div>'
      })
      .state('app.logItem.list', {
        url: '/list?search',
        views: {
          'page@app.logItem': {
            templateUrl: 'app/logItem/logItem.list.html',
            controller: 'LogItemListController as logItemCtrl'
          }
        }
      });
  });
