import { app } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import * as os from 'os';
import config from './config';
import { showNotification } from './notification';

import { logManager } from './log-manager';

const logger = logManager.getLogger('AppUpdater');

const ONE_MINUTE_MS = 60 * 1000;
export const CHECK_INTERVAL_MS = ONE_MINUTE_MS * 30;

export default class AppUpdater {
    static init() {
        if (config.isDev) {
            return;
        }

        const platform = os.platform();
        if (platform === 'linux') {
            return;
        }

        autoUpdater.logger = logger;
        autoUpdater.on('download-progress', progressInfo => {
            showNotification({
                body: `Downloaded: ${Math.round(progressInfo.percent)}% `,
                title: 'Tockler update downloading',
                silent: true,
            });
        });

        autoUpdater.on('error', err => {
            showNotification({ title: 'Tockler error', body: err ? err.stack || err : 'unknown' });
        });

        AppUpdater.checkIfEnabled();
        setInterval(() => AppUpdater.checkIfEnabled(), CHECK_INTERVAL_MS);
    }

    static checkIfEnabled() {
        let isAutoUpdateEnabled = config.persisted.get('isAutoUpdateEnabled');
        isAutoUpdateEnabled =
            typeof isAutoUpdateEnabled !== 'undefined' ? isAutoUpdateEnabled : true;

        if (isAutoUpdateEnabled) {
            logger.info('Checking for updates.');
            autoUpdater.checkForUpdatesAndNotify();
        } else {
            logger.info('Auto update disabled.');
        }
    }

    static updateNotAvailable = updateInfo => {
        const currentVersionString = app.getVersion();
        showNotification({
            body: `Up to date! Current ${currentVersionString} (latest: ${updateInfo.version})`,
            silent: true,
        });
    };

    static async checkForUpdates() {
        logger.info('Checking for updates');
        showNotification({ body: `Checking for updates...`, silent: true });

        autoUpdater.on('update-not-available', AppUpdater.updateNotAvailable);
        const result: UpdateCheckResult = await autoUpdater.checkForUpdatesAndNotify();
        logger.info(`Update result ${result.updateInfo.version}`);
        autoUpdater.removeListener('update-not-available', AppUpdater.updateNotAvailable);
    }
}
