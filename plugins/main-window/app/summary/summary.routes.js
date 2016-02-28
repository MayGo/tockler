'use strict';

angular.module('angularDemoApp.summary')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.summary', {
        url: '/summary',
        abstract: true,
        template: '<div ui-view="page" class="fade-in-up"></div>'
      })
      .state('app.summary.view', {
        url: '/view',
        views: {
          'page@app.summary': {
            templateUrl: 'app/summary/summary.view.html',
            controller: 'SummaryViewController as summaryCtrl'
          }
        }
      });
  });
