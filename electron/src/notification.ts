import { Notification } from 'electron';
import { logManager } from './log-manager.js';
import config from './config.js';

const isDesktopNotificationSupported = Notification.isSupported();
const logger = logManager.getLogger('Notification');

export function showNotification({
    body,
    title = 'Tockler',
    onClick,
    silent = false,
}: {
    body: string;
    title?: string;
    onClick?: () => void;
    silent?: boolean;
}) {
    if (isDesktopNotificationSupported) {
        logger.debug('Showing notification:', body, title);
        const notification = new Notification({
            title,
            body,
            silent,
            icon: config.iconTray,
        });
        if (onClick) {
            notification.once('click', onClick);
        }
        notification.show();
    } else {
        logger.error('Notifications not supported');
    }
}
