import * as notifier from 'node-notifier';
import * as moment from 'moment';
import config from './config';
import { logManager } from './log-manager';

const logger = logManager.getLogger('UserMessages');

const iconUrl = config.iconBig;

export default class UserMessages {
    static lastError = '';
    static lastTime = moment();

    static showError(title: string, error: string) {
        let diffInMinutes = moment().diff(UserMessages.lastTime, 'minutes');

        if (UserMessages.lastError === error && diffInMinutes < 1) {
            logger.debug('Same error message, waiting one minute');
            return;
        }

        UserMessages.lastError = error;
        UserMessages.lastTime = moment();

        notifier.notify(
            {
                title: title,
                message: error,
                icon: iconUrl,
                sound: true, // Only Notification Center or Windows Toasters
                wait: false, // Wait with callback, until user action is taken against notification
            },
            function(err, response) {
                logger.error('Notifier error:', err, response);
                // UserMessages.lastError = '';
            },
        );
    }
}
