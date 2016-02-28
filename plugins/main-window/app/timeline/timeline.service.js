'use strict';
angular.module('angularDemoApp')
    .service('TimelineService', function (DS, store) {

      return store.defineResource('timeline');
    });
