'use strict';

angular.module('angularDemoApp.settings')
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.settings', {
                url: '/settings',
                abstract: true,
                template: '<div ui-view="page" class="fade-in-up"></div>'
            })
            .state('app.settings.view', {
                url: '/view',
                views: {
                    'page@app.settings': {
                        templateUrl: 'app/settings/settings.view.html',
                        controller: 'SettingsViewController as settingsCtrl',
                        resolve: {
                            settingsData: function ($stateParams, SettingsService) {
                                return SettingsService.fetchWorkSettings();
                            }
                        }
                    }
                }
            });
    });
