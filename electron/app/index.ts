// override path, to fix asar.unpacked paths
require('hazardous');

import { backgroundJob } from './background-job';
import { backgroundService } from './background-service';
import { app, ipcMain, powerMonitor } from 'electron';
import { logManager } from './log-manager';
let logger = logManager.getLogger('AppIndex');

import AppManager from './app-manager';

AppManager.init().then(
    () => logger.info('AppManager.init'),
    e => logger.error('Error in AppManager.init', e),
);

import WindowManager from './window-manager';
import { extensionsManager } from './extensions-manager';
import AppUpdater from './app-updater';
import config from './config';

AppUpdater.init();

if (config.isDev) {
    // const reloadFile = path.join(config.client);
    // require('electron-reload')(reloadFile);
}

app.commandLine.appendSwitch('disable-renderer-backgrounding');

/**
 * Emitted when app starts
 */
app.on('ready', async () => {
    if (config.isDev) {
        await extensionsManager.init();
    }

    WindowManager.initMainWindowEvents();

    if (!config.isDev || config.trayEnabledInDev) {
        WindowManager.setTrayWindow();
    }
    backgroundJob.init();

    powerMonitor.on('suspend', function() {
        logger.info('The system is going to sleep');
        backgroundService.onSleep();
    });

    powerMonitor.on('resume', function() {
        logger.info('The system is going to resume');
        backgroundService
            .onResume()
            .then(() => logger.info('Resumed'), e => logger.error('Error in onResume', e));
    });
});

require('electron-context-menu')({});

ipcMain.on('close-app', function() {
    logger.info('Closing app');
    app.quit();
});

app.on('window-all-closed', function() {
    logger.info('window-all-closed');
    // pluginMgr.removeAll();
    // app.quit();
});

/*
activate and makeSingleInstance.
User want's to open main window when reopened app. (But not open main window on application launch)
*/
app.on('activate', function() {
    logger.info('activate');
    WindowManager.openMainWindow();
});

/* Single Instance Check */

let iShouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    logger.info('Make single instance');

    WindowManager.openMainWindow();

    return true;
});

if (iShouldQuit) {
    logger.info('Quiting instance.');
    app.quit();
}
