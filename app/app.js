if (require('electron-squirrel-startup')) {
    return;
}

var app = require('electron').app
var notifier = require('node-notifier')


var pluginMgr = require('./plugin-manager')
var backgroundService = require('./background.service')
var ipcMain = require('electron').ipcMain;

var config = require('./config')
require("electron").crashReporter.start(config.crashOpts)

var AutoLaunch = require('auto-launch');
var mb = require('./tray')

var appLauncher = new AutoLaunch({
    name: 'Backer Timetracker'
});

appLauncher.isEnabled().then(function (enabled) {
    if (enabled) {
        return;
    }
    console.log('Enabling app launcher');
    return appLauncher.enable()
}).then(function (err) {

});


app.commandLine.appendSwitch('disable-renderer-backgrounding');
/**
 * Emitted when app starts
 */
app.on('ready', function () {

    pluginMgr.init();
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

    // Docs:
    // https://github.com/mikaelbr/node-notifier
    /*notifier.notify({
     'title': 'Welcome!',
     'message': 'Happy building apps.'
     })*/
});


require('electron-context-menu')({

});


/**
 * Emitted when all windows are closed
 */
app.on('window-all-closed', function () {
    pluginMgr.removeAll();
    app.quit();
});

ipcMain.on('close-app', function () {
    console.log('Closing app');
    pluginMgr.removeAll();
    app.quit();
});


/**
 * Emitted when no opened windows
 * and dock icon is clicked
 */
app.on('activate-with-no-open-windows', function () {
    mb.window.show();
});

/* Single Instance Check */
var iShouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    if (pluginMgr.windows && pluginMgr.windows['main-window']) {
        if (pluginMgr.windows['main-window'].isMinimized()) {
            pluginMgr.windows['main-window'].restore();
        }
        pluginMgr.windows['main-window'].show();
        pluginMgr.windows['main-window'].focus();
        console.log('Focusing main window');
    }
    return true;
});
if (iShouldQuit && !config.isDev) {
    console.log('Quiting instance.');
    pluginMgr.removeAll();
    app.quit();
    return;
}

