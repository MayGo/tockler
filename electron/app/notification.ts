import { Notification } from 'electron';
import { logManager } from './log-manager';
import config from './config';

const isDesktopNotificationSupported = Notification.isSupported();
const logger = logManager.getLogger('TrackItemService');

export function showNotification(body, title = 'Tockler', onClick = null) {
    if (isDesktopNotificationSupported) {
        logger.info('Showing notification:', body, title);
        const notification = new Notification({
            title,
            body,
            silent: false,
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
