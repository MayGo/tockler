import { app, dialog } from 'electron';
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
            showNotification(`Downloaded: {progressInfo.percent}% `, 'Tockler downloading');
        });
        autoUpdater.on('error', err => {
            showNotification(err ? err.stack || err : 'unknown', 'Tockler error');
        });

        autoUpdater.checkForUpdatesAndNotify();
        setInterval(() => autoUpdater.checkForUpdatesAndNotify(), CHECK_INTERVAL_MS);
    }

    static updateNotAvailable = updateInfo => {
        const currentVersionString = app.getVersion();
        showNotification(
            `Up to date! Current ${currentVersionString} (latest: ${updateInfo.version})`,
        );
    };

    static async checkForUpdates() {
        logger.info('Checking for updates');

        autoUpdater.on('update-not-available', AppUpdater.updateNotAvailable);
        await autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.removeListener('update-not-available', AppUpdater.updateNotAvailable);
    }
}

// function notify(title: string, message: string) {
//   let windows = BrowserWindowElectron.getAllWindows()
//   if (windows.length == 0) {
//     return
//   }
//
//   windows[0].webContents.send("notify", title, message)
// }
