'use strict';

angular.module('angularDemoApp.timeline')
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.timeline', {
                url: '/timeline',
                abstract: true,
                template: '<div ui-view="page" class="fade-in-up"></div>'
            })
            .state('app.timeline.view', {
                url: '/view',
                views: {
                    'page@app.timeline': {
                        templateUrl: 'app/timeline/timeline.view.html',
                        controller: 'TimelineViewController as timelineCtrl',
                        resolve: {
                            settingsData: function ($stateParams, SettingsService) {
                                return SettingsService.fetchWorkSettings();
                            }
                        }
                    }
                }
            });
    });
