import { Duration } from 'luxon';
import { sendToNotificationWindow } from '../app/window-manager';
import { settingsService } from '../drizzle/queries/settings-service';
import { appEmitter } from '../utils/appEmitter';
import { logManager } from '../utils/log-manager';
import { getCurrentSessionDuration } from './watchForBreakNotification.utils';

const MINUTE = 60 * 1000;

const CHECK_INTERVAL_MS = 20 * 1000;

let notificationInterval: NodeJS.Timeout | null = null;
let isMonitoringEnabled = false;

const logger = logManager.getLogger('SessionMonitor');

async function startInterval() {
    // Clear any existing interval
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }

    const settings = await settingsService.fetchWorkSettings();
    if (!settings.smallNotificationsEnabled) {
        return;
    }

    isMonitoringEnabled = true;
    logger.debug('Starting session monitoring interval');

    notificationInterval = setInterval(async () => {
        try {
            // Recheck the setting on each interval in case it changed
            const currentSettings = await settingsService.fetchWorkSettings();
            if (!currentSettings.smallNotificationsEnabled || !isMonitoringEnabled) {
                watchForBreakNotificationCleanup();
                return;
            }

            const currentSession = await getCurrentSessionDuration(currentSettings.minBreakTime);

            const readableDuration = Duration.fromObject({ milliseconds: currentSession }).toFormat('hh:mm:ss');

            logger.debug('currentSession:', readableDuration, currentSession);

            const MAX_TIMER = currentSettings.sessionLength * MINUTE;

            if (currentSession > MAX_TIMER) {
                logger.debug('Sending notification');
                sendToNotificationWindow('notifyUser', currentSession);
            }
        } catch (error) {
            logger.error('Error in session monitoring interval:', error);
        }
    }, CHECK_INTERVAL_MS);
}

export function watchForBreakNotificationCleanup() {
    logger.debug('Stopping session monitoring');
    isMonitoringEnabled = false;
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
}

export async function watchForBreakNotification() {
    logger.debug('Initializing session monitoring');

    appEmitter.on('smallNotificationsEnabled-changed', async (smallNotificationsEnabled: boolean) => {
        if (smallNotificationsEnabled && !isMonitoringEnabled) {
            await startInterval();
        } else if (!smallNotificationsEnabled && isMonitoringEnabled) {
            watchForBreakNotificationCleanup();
        }
    });

    // Initial start based on current settings
    await startInterval();
}
