import { app, dialog } from 'electron';
import { autoUpdater, UpdateCheckResult, UpdateInfo } from 'electron-updater';
import config from './config';
import { showNotification } from './notification';

import { logManager } from './log-manager';

const logger = logManager.getLogger('AppUpdater');

const ONE_MINUTE_MS = 60 * 1000;
export const CHECK_INTERVAL_MS = ONE_MINUTE_MS * 30;

function isNetworkError(errorObject) {
    return errorObject.message.includes('net::ERR');
}

export default class AppUpdater {
    static init() {
        autoUpdater.logger = logger;
        (autoUpdater.logger as any).transports.console.level = 'error';

        autoUpdater.on('download-progress', progressInfo => {
            logger.debug(`Downloaded: ${Math.round(progressInfo.percent)}% `);
        });

        autoUpdater.on('update-available', (info: UpdateInfo) => {
            showNotification({
                body: `Downloading Tockler version ${info.version}`,
                title: 'Update available',
                silent: true,
            });
        });

        autoUpdater.on('update-downloaded', async (event, releaseNotes, releaseName) => {
            logger.debug('Update downloaded');
            const { response } = await dialog.showMessageBox({
                type: 'question',
                buttons: ['Update', 'Cancel'],
                defaultId: 0,
                message: `Version ${releaseName} is available, do you want to install it now?`,
                title: 'Update available',
            });

            if (response === 0) {
                autoUpdater.quitAndInstall();
            }
        });

        autoUpdater.on('error', e => {
            if (isNetworkError(e)) {
                logger.debug('Network error:', e);
            } else {
                logger.error('AutoUpdater error:', e);
                showNotification({
                    title: 'Tockler update error',
                    body: e ? e.stack || e : 'unknown',
                });
            }
        });

        setInterval(() => AppUpdater.checkForNewVersions(), CHECK_INTERVAL_MS);
    }

    static checkForNewVersions() {
        let isAutoUpdateEnabled = config.persisted.get('isAutoUpdateEnabled');
        isAutoUpdateEnabled =
            typeof isAutoUpdateEnabled !== 'undefined' ? isAutoUpdateEnabled : true;

        if (isAutoUpdateEnabled) {
            logger.debug('Checking for updates.');
            autoUpdater.checkForUpdates();
        } else {
            logger.debug('Auto update disabled.');
        }
    }

    static async checkForUpdatesManual() {
        logger.debug('Checking for updates');
        showNotification({ body: `Checking for updates...`, silent: true });

        try {
            const result: UpdateCheckResult = await autoUpdater.checkForUpdates();

            if (result?.updateInfo?.version) {
                const latestVersion = result.updateInfo.version;
                logger.debug(`Update result ${latestVersion}`);
                const currentVersionString = app.getVersion();

                if (currentVersionString === latestVersion) {
                    showNotification({
                        body: `Up to date! You have version ${currentVersionString}`,
                        silent: true,
                    });
                }
            }
        } catch (e) {
            logger.error('Error checking updates', e);
            showNotification({
                title: 'Tockler error',
                body: e ? e.stack || e : 'unknown',
            });
        }
    }
}
