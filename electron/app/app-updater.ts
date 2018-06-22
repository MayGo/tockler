import { app, dialog } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import * as os from 'os';
import config from './config';
import { showNotification } from './notification';

import { logManager } from './log-manager';
const logger = logManager.getLogger('AppUpdater');

const ONE_MINUTE_MS = 60 * 1000;
export const CHECK_INTERVAL_MS = ONE_MINUTE_MS * 60;

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
            showNotification(
                `Downloaded: ${Math.round(progressInfo.percent)}% `,
                'Tockler update downloading',
            );
        });

        autoUpdater.on('error', err => {
            showNotification(err ? err.stack || err : 'unknown', 'Tockler error');
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
        showNotification(
            `Up to date! Current ${currentVersionString} (latest: ${updateInfo.version})`,
        );
    };

    static async checkForUpdates() {
        logger.info('Checking for updates');
        showNotification(`Checking for updates...`);

        autoUpdater.on('update-not-available', AppUpdater.updateNotAvailable);
        const result: UpdateCheckResult = await autoUpdater.checkForUpdatesAndNotify();
        logger.info(`Update result ${result.updateInfo.version}`);
        autoUpdater.removeListener('update-not-available', AppUpdater.updateNotAvailable);
    }
}
