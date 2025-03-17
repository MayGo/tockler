import { Notification } from 'electron';
import { config } from '../utils/config';
import { logManager } from '../utils/log-manager';

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
            icon: config.iconNotification,
        });
        if (onClick) {
            notification.once('click', onClick);
        }
        notification.show();
    } else {
        logger.error('Notifications not supported');
    }
}
