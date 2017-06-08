var config = require('./config');
const path = require('path');

if (config.isDev) {
    const reloadFile = path.join(config.root, 'dist');
    require('electron-reload')(reloadFile)
}

var app = require('electron').app;
var notifier = require('node-notifier');
var LogManager = require("./log-manager.js")
LogManager.init({ userDir: app.getPath('userData') })

var backgroundService = require('./background.service');

const InitialDatagenerator = require('./initialDataGenerator');
InitialDatagenerator.generate();

var ipcMain = require('electron').ipcMain;

var AutoLaunch = require('auto-launch');
var appLauncher = new AutoLaunch({
    name: 'Tockler'
});

appLauncher.isEnabled().then(function (enabled) {
    if (enabled) {
        return;
    }

    console.log('Enabling app launcher');

    return appLauncher.enable();

}).then(function (err) {

});

app.commandLine.appendSwitch('disable-renderer-backgrounding');

var windowManager = require('./window-manager');

/**
 * Emitted when app starts
 */
app.on('ready', () => {
    windowManager.setMainWindow();
    windowManager.initMainWindowEvents();

    if (!config.isDev || config.trayEnabledInDev) {
        windowManager.setTrayWindow();
    }

    backgroundService.init();

    global.BackgroundService = backgroundService;

    require('electron').powerMonitor.on('suspend', function () {
        console.log('The system is going to sleep');
        backgroundService.onSleep();
    });

    require('electron').powerMonitor.on('resume', function () {
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

app.on('activate-with-no-open-windows', () => {
    windowManager.menubar.window.show();
});

/* Single Instance Check */

var iShouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
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
