require('events').EventEmitter.defaultMaxListeners = 30;

import { initBackgroundJob } from './initBackgroundJob.js';
import { backgroundService } from './background-service.js';
import { app, ipcMain, powerMonitor } from 'electron';
import { logManager } from './log-manager.js';
import AppManager from './app-manager.js';
import WindowManager from './window-manager.js';
import { extensionsManager } from './extensions-manager.js';
import AppUpdater from './app-updater.js';
import config from './config.js';

let logger = logManager.getLogger('AppIndex');
app.setAppUserModelId(process.execPath);

/* Single Instance Check */

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        logger.debug('Make single instance');
        WindowManager.openMainWindow();
    });

    AppUpdater.init();

    app.commandLine.appendSwitch('disable-renderer-backgrounding');

    require('electron-context-menu')({});

    ipcMain.on('close-app', function () {
        logger.info('Closing Tockler');
        app.quit();
    });

    app.on('will-quit', async () => {
        logger.debug('will-quit');
        await AppManager.destroy();
    });
    app.on('window-all-closed', function () {
        logger.debug('window-all-closed');
        // app.quit();
    });

    // User want's to open main window when reopened app. (But not open main window on application launch)

    app.on('activate', function () {
        logger.debug('Activate event');
        if (app.isReady()) {
            WindowManager.openMainWindow();
        } else {
            logger.debug('App is not ready in activate event');
        }
    });

    app.on('ready', async () => {
        try {
            if (config.isDev) {
                await extensionsManager.init();
            }

            WindowManager.initMainWindowEvents();

            if (!config.isDev || config.trayEnabledInDev) {
                WindowManager.setTrayWindow();
            }

            WindowManager.setNotificationWindow();

            await AppManager.init();

            await initBackgroundJob();

            powerMonitor.on('suspend', function () {
                logger.debug('The system is going to sleep');
                backgroundService.onSleep();
            });

            powerMonitor.on('resume', function () {
                logger.debug('The system is going to resume');
                backgroundService.onResume().then(
                    () => logger.debug('Resumed'),
                    (e) => logger.error('Error in onResume', e),
                );
            });
        } catch (error: any) {
            logger.error(`App errored in ready event: ${error.toString()}`, error);
        }
    });
} else {
    logger.debug('Quiting instance.');
    app.quit();
}
