'use strict';

angular.module('globalServices')
    .controller('SettingsViewController', function ($rootScope, $scope, $mdDialog, workSettingsData,
                                                    analyserSettingsData,
                                                    SettingsService, TrackItemService) {
        var ctrl = this;

        if (_.isEmpty(workSettingsData)) {
            ctrl.workSettings = {};
        } else {
            ctrl.workSettings = workSettingsData;
        }

        ctrl.workSettings.workDayStartTime = workSettingsData.workDayStartTime || '08:30';
        ctrl.workSettings.workDayEndTime = workSettingsData.workDayEndTime || '17:00';
        ctrl.workSettings.splitTaskAfterIdlingForMinutes = workSettingsData.splitTaskAfterIdlingForMinutes || 3;

        ctrl.analyserTestItems = [];

        if (_.isEmpty(analyserSettingsData)) {
            ctrl.analyserSettings = [];
        } else {
            ctrl.analyserSettings = analyserSettingsData
        }

        var todaysTrackItems;

        var startDate = moment();
        startDate.startOf('day');
        TrackItemService.findAllFromDay(startDate.toDate(), 'AppTrackItem').then(function (items) {
            console.log(items);
            todaysTrackItems = items;
            $scope.$apply();
        });

        //public methods
        ctrl.saveSettings = saveSettings;
        ctrl.testAnalyserItem = testAnalyserItem;
        ctrl.removeAnalyserItem = removeAnalyserItem;
        ctrl.addNewAnalyserItem = addNewAnalyserItem;

        function findFirst(str, findRe) {
            if (!findRe) {
                return;
            }
            var re = new RegExp(findRe, "g");
            var result = re.exec(str);

            if (result != null) {
                let first = result[0];
                return first;
            }
        }

        function saveSettings() {
            console.log("Saving:", ctrl.workSettings, ctrl.analyserSettings);
            SettingsService.updateByName('WORK_SETTINGS', ctrl.workSettings).then(function (item) {
                console.log("Updated WORK_SETTINGS!", item);
            });

            SettingsService.updateByName('ANALYSER_SETTINGS', ctrl.analyserSettings).then(function (item) {
                console.log("Updated ANALYSER_SETTINGS!", item);
            })
        }

        function addNewAnalyserItem() {
            ctrl.analyserSettings.push({findRe: '', takeTitle: '', takeGroup: '', active: true});
        }

        function removeAnalyserItem(index) {
            ctrl.analyserSettings.splice(index, 1);
        }

        function testAnalyserItem(analyseSetting, index) {
            if (!todaysTrackItems) {
                alert('Track items not loaded, try again!');
                return;
            }

            var testItems = [];
            _.each(todaysTrackItems, function (item) {

                var str = item.title;

                item.findRe = findFirst(str, analyseSetting.findRe);
                item.takeGroup = findFirst(str, analyseSetting.takeGroup) || item.findRe;
                item.takeTitle = findFirst(str, analyseSetting.takeTitle) || item.title;

                if (item.findRe) {
                    testItems.push(item);
                }
            });

            ctrl.analyserTestItems[index] = _.uniqBy(testItems, 'title');
        }

    });
