'use strict';
var osLocale = require('os-locale');
var ipc = require('electron').ipcRenderer;

angular.module('trayApp')
    .controller('AppController', function ($scope, $state, tmhDynamicLocale) {
        var ctrl = this;

        osLocale(function (err, locale) {
            var lang = locale.replace('_', '-').toLowerCase()
            console.log('OS locale: ' + lang);
            tmhDynamicLocale.set(lang);
        });

        ctrl.toggleMainWindow = function(){
            ipc.send('toggle-window', 'main-window')
        };

        ctrl.exitApp = function(){
            ipc.send('close-app')
        }
    });
