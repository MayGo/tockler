'use strict';
var osLocale = require('os-locale');

angular.module('angularDemoApp')
    .controller('AppController', function ($scope, $state, tmhDynamicLocale) {
        var ctrl = this;

        osLocale(function (err, locale) {
            var lang = locale.replace('_', '-').toLowerCase()
            console.log('OS locale: ' + lang);
            tmhDynamicLocale.set(lang);
        });
    });
