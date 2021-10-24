require('events').EventEmitter.defaultMaxListeners = 30;

import { backgroundJob } from './background-job';
import { backgroundService } from './background-service';
import { app, ipcMain, powerMonitor } from 'electron';
import { logManager } from './log-manager';
import AppManager from './app-manager';
import WindowManager, { sendToMainWindow } from './window-manager';
import { extensionsManager } from './extensions-manager';
import AppUpdater from './app-updater';
import config from './config';
import { Deeplink } from 'electron-deeplink';

const UrlParse = require('url-parse');

let logger = logManager.getLogger('AppIndex');
app.setAppUserModelId(process.execPath);

/* Single Instance Check */
const isMas = process.mas === true;
const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock || isMas) {
    const protocol = 'tockler';
    const deeplink = new Deeplink({ app, mainWindow: WindowManager.mainWindow, protocol });

    app.on('second-instance', (event, commandLine, workingDirectory) => {
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

            await AppManager.init();

            backgroundJob.init();

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
        } catch (error) {
            logger.error(`App errored in ready event: ${error.toString()}`, error);
        }
    });

    deeplink.on('received', (url) => {
        logger.debug(`Got app link (tockler://open or tockler://login), opening main window. Arrived from  ${url}`);
        const urlParsed = new UrlParse(url, false);

        if (urlParsed.host === 'login') {
            WindowManager.openMainWindow();
            sendToMainWindow('event-login-url', urlParsed.query);
            logger.debug('event-login-url sent', urlParsed.query);
            return;
        }

        WindowManager.openMainWindow();
    });
} else {
    logger.debug('Quiting instance.');
    app.quit();
}
