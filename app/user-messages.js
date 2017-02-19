'use strict';

const notifier = require('node-notifier');
const path = require('path');
const $q = require('q');
const _ = require('lodash');
const moment = require('moment');
const iconUrl = path.join(__dirname, 'shared/img/icon/timetracker_icon.ico');

class UserMessages {

    static showError(title, error) {
        let diffInMinutes = moment().diff(UserMessages.lastTime, 'minutes');

        if (UserMessages.lastError === error && diffInMinutes < 1) {
            return;
        }

        UserMessages.lastError = error;
        UserMessages.lastTime = moment();

        notifier.notify({
            title: title,
            message: error,
            icon: iconUrl,
            sound: true, // Only Notification Center or Windows Toasters
            wait: false // Wait with callback, until user action is taken against notification
        }, function (err, response) {
            // Response is response from notification
        });
    }
}
UserMessages.lastError = '';
UserMessages.lastTime = moment();
module.exports = UserMessages;