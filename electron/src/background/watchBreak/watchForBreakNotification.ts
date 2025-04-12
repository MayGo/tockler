import { Duration } from 'luxon';
import { sendToNotificationWindow } from '../../app/window-manager';
import { dbClient } from '../../drizzle/dbClient';
import { State } from '../../enums/state';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import { getCurrentSessionDuration } from './watchForBreakNotification.utils';

const MINUTE = 60 * 1000;

const CHECK_INTERVAL_MS = 60 * 1000;

let notificationInterval: NodeJS.Timeout | null = null;
let isMonitoringEnabled = false;
let currentState: State = State.Online;
let lastNotificationTime = 0;

const logger = logManager.getLogger('watchForBreakNotification');

async function startInterval() {
    // Clear any existing interval
    if (notificationInterval) {
        logger.debug('Clearing existing interval');
        clearInterval(notificationInterval);
    }

    const settings = await dbClient.fetchWorkSettings();
    if (!settings.smallNotificationsEnabled) {
        return;
    }

    isMonitoringEnabled = true;
    logger.debug('Starting session monitoring interval');

    notificationInterval = setInterval(async () => {
        try {
            // Recheck the setting on each interval in case it changed
            const currentSettings = await dbClient.fetchWorkSettings();
            if (!currentSettings.smallNotificationsEnabled || !isMonitoringEnabled || currentState !== State.Online) {
                watchForBreakNotificationCleanup();
                return;
            }

            const currentSession = await getCurrentSessionDuration(currentSettings.minBreakTime);

            const readableDuration = Duration.fromObject({ milliseconds: currentSession }).toFormat('hh:mm:ss');

            logger.debug('currentSession2:', readableDuration, currentSession);

            const MAX_TIMER = currentSettings.sessionLength * MINUTE;
            const now = Date.now();
            const timeSinceLastNotification = now - lastNotificationTime;
            const reNotifyIntervalMs = currentSettings.reNotifyInterval * MINUTE;

            logger.debug('timeSinceLastNotification:', timeSinceLastNotification, reNotifyIntervalMs);

            if (
                currentSession > MAX_TIMER &&
                (timeSinceLastNotification >= reNotifyIntervalMs || lastNotificationTime === 0)
            ) {
                logger.debug('Sending notification');
                sendToNotificationWindow('notifyUser', currentSession);
                lastNotificationTime = now;
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
    lastNotificationTime = 0;
}

export async function watchForBreakNotification() {
    logger.debug('Initializing session monitoring');

    appEmitter.on('state-changed', async (state: State) => {
        logger.debug('State changed for break notification:', state);
        currentState = state;

        if (state === State.Online) {
            await startInterval();
        } else {
            watchForBreakNotificationCleanup();
        }
    });

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
