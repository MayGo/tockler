'use strict';

const notifier = require('node-notifier');
const path = require('path');
const moment = require('moment');
const iconUrl = path.join(__dirname, 'shared/img/icon/timetracker_icon.ico');

var LogManager = require("./log-manager.js");
var logger = LogManager.getLogger('UserMessages');

class UserMessages {

    static showError(title, error) {
        let diffInMinutes = moment().diff(UserMessages.lastTime, 'minutes');

        if (UserMessages.lastError === error && diffInMinutes < 1) {
            logger.debug('Same error message, waiting one minute');
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
            logger.error('Notifier error:', err, response);
        });
    }
}

UserMessages.lastError = '';
UserMessages.lastTime = moment();

module.exports = UserMessages;