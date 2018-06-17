import { backgroundJob } from './background-job';
import { backgroundService } from './background-service';
import { app, ipcMain, powerMonitor } from 'electron';
import { logManager } from './log-manager';

import AppManager from './app-manager';

AppManager.init().then(
    () => console.info('AppManager.init'),
    e => console.error('Error in AppManager.init', e),
);

import windowManager from './window-manager';
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

    windowManager.initMainWindowEvents();

    if (!config.isDev || config.trayEnabledInDev) {
        windowManager.setTrayWindow();
    }
    backgroundJob.init();

    powerMonitor.on('suspend', function() {
        console.log('The system is going to sleep');
        backgroundService.onSleep();
    });

    powerMonitor.on('resume', function() {
        console.log('The system is going to resume');
        backgroundService
            .onResume()
            .then(() => console.info('Resumed'), e => console.error('Error in onResume', e));
    });
});

require('electron-context-menu')({});

ipcMain.on('close-app', function() {
    console.log('Closing app');
    app.quit();
});

app.on('window-all-closed', function() {
    console.log('window-all-closed');
    // pluginMgr.removeAll();
    // app.quit();
});

/* Single Instance Check */

let iShouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    console.log('Make single instance');

    if (windowManager && windowManager.mainWindow) {
        if (windowManager.mainWindow.isMinimized()) {
            windowManager.mainWindow.restore();
        }

        windowManager.mainWindow.show();
        windowManager.mainWindow.focus();

        console.log('Focusing main window');
    }

    return true;
});

if (iShouldQuit && !config.isDev) {
    console.log('Quiting instance.');
    app.quit();
}
