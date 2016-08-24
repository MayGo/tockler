'use strict';

angular.module('trayApp.config')
    .constant('appConfig', (function () {

        var defaultConfig = {
            itemsByPage: 15
        };

        return defaultConfig;
    })())
    .config(function ($translateProvider) {
        $translateProvider.translations('en', {
            app: {
                name: 'Tockler'
            }, "button": {
                "ok": "Ok"
            },
            "header": {
                "navbar": {
                    "user": {
                        "settings": "Settings",
                        "docs": "Help"
                    },
                    "NOTIFICATIONS": "Notifications",
                    "logout": "Logout"
                },
                "search": {
                    "placeholder": "Search something"
                }
            },
            "messages": {
                "loading": "Loading ..."
            },
            menu: {
                domain: {
                    items: 'List',
                    timeline: 'Timeline',
                    summary: 'Summary'
                }
            }
        });
        $translateProvider.preferredLanguage('en');

    });
;
