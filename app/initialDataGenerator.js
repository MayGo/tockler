'use strict';

const TrackItemCrud = require('./TrackItemCrud');
const SettingsCrud = require('./SettingsCrud');
const AppItemCrud = require('./AppItemCrud');
const path = require('path');

const moment = require('moment');

module.exports.generate = function () {
    console.log("Generating data if none");
    SettingsCrud.fetchAnalyserSettings().then((analyserItems)=> {

        if (!analyserItems || analyserItems.length == 0) {
            console.log("ANALYSER_SETTINGS empty, generating");

            let analyserSettings = [
                {findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', active: true},
                {findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', active: true}
            ];

            SettingsCrud.updateByName('ANALYSER_SETTINGS', analyserSettings).then(function (item) {
                console.log("Updated ANALYSER_SETTINGS!", item);
            })
        }
    });
};