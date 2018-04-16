import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as os from 'os';
import config from './config';

import { logManager } from './log-manager';
const logger = logManager.getLogger('AppUpdater');

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

        autoUpdater.signals.updateDownloaded(versionInfo => {
            const dialogOptions = {
                type: 'question',
                defaultId: 0,
                message: `The update is ready to install, Version ${
                    versionInfo.version
                } has been downloaded and will be automatically installed when you click OK`,
            };
            let focusedWindow = BrowserWindow.getFocusedWindow();

            BrowserWindow.getAllWindows();
            dialog.showMessageBox(focusedWindow, dialogOptions, function() {
                setImmediate(() => {
                    app.removeAllListeners('window-all-closed');
                    if (focusedWindow != null) {
                        focusedWindow.close();
                    }
                    autoUpdater.quitAndInstall(false);
                });
            });
        });
        autoUpdater
            .checkForUpdates()
            .then(
                () => logger.info('checkForUpdates'),
                e => logger.error('Error in checkForUpdates', e),
            );
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
