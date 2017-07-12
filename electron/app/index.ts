import { backgroundJob } from './background-job';
import { backgroundService } from './background-service';
import { app, ipcMain, powerMonitor } from "electron";
import { logManager } from "./log-manager";

import AppManager from "./app-manager";
AppManager.init();

import windowManager from "./window-manager";
import AppUpdater from "./app-updater";
import config from './config';
import * as path from 'path';

AppUpdater.init();

if (config.isDev) {
    const reloadFile = path.join(config.client);
    require('electron-reload')(reloadFile);
}

let AutoLaunch = require('auto-launch');
let appLauncher = new AutoLaunch({
    name: 'Tockler'
});

appLauncher.isEnabled().then((enabled) => {
    if (enabled) {
        console.log('AppLauncher is enabled');
        return;
    }

    console.log('Enabling app launcher');

    return appLauncher.enable();

}).then((err) => {
    console.error("Error with appLauncher:", err);
});

app.commandLine.appendSwitch('disable-renderer-backgrounding');

/**
 * Emitted when app starts
 */
app.on('ready', () => {

    windowManager.setMainWindow();
    windowManager.initMainWindowEvents();

    if (!config.isDev || config.trayEnabledInDev) {
        windowManager.setTrayWindow();
    }

    windowManager.initMenus();
 

    backgroundJob.init();

    powerMonitor.on('suspend', function () {
        console.log('The system is going to sleep');
        backgroundService.onSleep();
    });

    powerMonitor.on('resume', function () {
        console.log('The system is going to resume');
        backgroundService.onResume();
    });
});


require('electron-context-menu')({});

/**
 * Emitted when all windows are closed
 */
app.on('window-all-closed', function () {
    console.log('window-all-closed');
    //pluginMgr.removeAll();
    //app.quit();
});

ipcMain.on('close-app', function () {
    console.log('Closing app');
    //pluginMgr.removeAll();
    app.quit();
});

/**
 * Emitted when no opened windows
 * and dock icon is clicked
 */

app.on('activate', () => {
    console.log("Show menubar.");
    windowManager.menubar.window.show();
});

/* Single Instance Check */

let iShouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    console.log("Make single instance");

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
    //pluginMgr.removeAll();
    app.quit();
}
