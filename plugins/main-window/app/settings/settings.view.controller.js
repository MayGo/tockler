'use strict';

angular.module('angularDemoApp')
    .controller('SettingsViewController', function ($rootScope, $mdDialog, settingsData, SettingsService) {
        var ctrl = this;

        ctrl.settings = {};
        ctrl.settings.workDayStartTime = settingsData.workDayStartTime || '08:30';
        ctrl.settings.workDayEndTime = settingsData.workDayEndTime|| '17:00';

        //public methods
        ctrl.saveSettings = saveSettings;

        function saveSettings() {

            SettingsService.update(settingsData.id, ctrl.settings).then(function (item) {
                console.log("Updated!", item.settings);
            })
        }
    });
