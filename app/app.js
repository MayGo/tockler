var app = require('app')
var notifier = require('node-notifier')

var mb = require('./tray')
var pluginMgr = require('./plugin-manager')
var backgroundService = require('./background.service')
var ipcMain = require('electron').ipcMain;
require('./lib/crash-handler')


app.commandLine.appendSwitch('disable-renderer-backgrounding');
/**
 * Emitted when app starts
 */
app.on('ready', function () {

    pluginMgr.init();
    backgroundService.init();

    global.BackgroundService = backgroundService;

    require('power-monitor').on('suspend', function () {
        console.log('The system is going to sleep');
        backgroundService.onSleep();
    });
    require('power-monitor').on('resume', function () {
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

