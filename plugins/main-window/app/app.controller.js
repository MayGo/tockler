'use strict';
var osLocale = require('os-locale');
var packageJson = require('../../package.json');

angular.module('angularDemoApp')
    .controller('AppController', function ($scope, $state, tmhDynamicLocale) {
        var ctrl = this;

        osLocale(function (err, locale) {
            var lang = locale.replace('_', '-').toLowerCase()
            console.log('OS locale: ' + lang);
            tmhDynamicLocale.set(lang);
        });
        ctrl.versions = {};
        ctrl.versions.electron = process.versions['electron'];
        ctrl.versions.chrome = process.versions['chrome'];
        ctrl.versions.app = packageJson.version;
    });
