import { app } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import * as os from 'os';
import config from './config';
import { showNotification } from './notification';

import { logManager } from './log-manager';

const logger = logManager.getLogger('AppUpdater');

const ONE_MINUTE_MS = 60 * 1000;
export const CHECK_INTERVAL_MS = ONE_MINUTE_MS * 30;

function isNetworkError(errorObject) {
    return (
        errorObject.message === 'net::ERR_INTERNET_DISCONNECTED' ||
        errorObject.message === 'net::ERR_PROXY_CONNECTION_FAILED' ||
        errorObject.message === 'net::ERR_CONNECTION_RESET' ||
        errorObject.message === 'net::ERR_CONNECTION_CLOSE' ||
        errorObject.message === 'net::ERR_NAME_NOT_RESOLVED' ||
        errorObject.message === 'net::ERR_CONNECTION_TIMED_OUT'
    );
}

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

        autoUpdater.on('error', e => {
            if (isNetworkError(e)) {
                logger.debug('Network error:', e);
            } else {
                logger.error('AutoUpdater error:', e);
                showNotification({
                    title: 'Tockler error',
                    body: e ? e.stack || e : 'unknown',
                });
            }
        });

        AppUpdater.checkForNewVersions();
        setInterval(() => AppUpdater.checkForNewVersions(), CHECK_INTERVAL_MS);
    }

    static checkForNewVersions() {
        let isAutoUpdateEnabled = config.persisted.get('isAutoUpdateEnabled');
        isAutoUpdateEnabled =
            typeof isAutoUpdateEnabled !== 'undefined' ? isAutoUpdateEnabled : true;

        if (isAutoUpdateEnabled) {
            logger.debug('Checking for updates.');
            autoUpdater.checkForUpdatesAndNotify();
        } else {
            logger.debug('Auto update disabled.');
        }
    }

    static async checkForUpdates() {
        logger.debug('Checking for updates');
        showNotification({ body: `Checking for updates...`, silent: true });

        try {
            const result: UpdateCheckResult = await autoUpdater.checkForUpdatesAndNotify();

            if (result?.updateInfo?.version) {
                const latestVersion = result.updateInfo.version;
                logger.debug(`Update result ${latestVersion}`);
                const currentVersionString = app.getVersion();

                showNotification({
                    body: `Up to date! Current ${currentVersionString} (latest: ${latestVersion})`,
                    silent: true,
                });
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
