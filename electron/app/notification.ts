import { Notification } from 'electron';
import { logManager } from './log-manager';
import config from './config';

const isDesktopNotificationSupported = Notification.isSupported();
const logger = logManager.getLogger('Notification');

export function showNotification({ body, title = 'Tockler', onClick = null, silent = false }) {
    if (isDesktopNotificationSupported) {
        logger.debug('Showing notification:', body, title);
        const notification = new Notification({
            title,
            body,
            silent,
            icon: config.iconBig,
        });
        if (onClick) {
            notification.once('click', onClick);
        }
        notification.show();
    } else {
        logger.error('Notifications not supported');
    }
}
