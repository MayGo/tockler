'use strict';

angular.module('globalServices')
    .controller('SettingsViewController', function ($rootScope, $mdDialog, settingsData, SettingsService) {
        var ctrl = this;

        ctrl.settings = {};
        ctrl.settings.workDayStartTime = settingsData.workDayStartTime || '08:30';
        ctrl.settings.workDayEndTime = settingsData.workDayEndTime || '17:00';

        //public methods
        ctrl.saveSettings = saveSettings;

        function saveSettings() {

            SettingsService.updateByName('WORK_SETTINGS', ctrl.settings).then(function (item) {
                console.log("Updated!", item.jsonData);
            })
        }
    });
