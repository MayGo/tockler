if (require('electron-squirrel-startup')) {
    return;
}

const path = require('path');
const reloadFile = path.join(__dirname, 'tools', 'reload.electron');
require('electron-reload')(reloadFile);


var app = require('electron').app;
var notifier = require('node-notifier');
var LogManager = require("./app/log-manager.js")
LogManager.init({userDir: app.getPath('userData')})


var backgroundService = require('./app/background.service');

const InitialDatagenerator = require('./app/initialDataGenerator');
InitialDatagenerator.generate();

var ipcMain = require('electron').ipcMain;

var config = require('./app/config');

require("electron").crashReporter.start(config.crashOpts);


var AutoLaunch = require('auto-launch');
var appLauncher = new AutoLaunch({
    name: 'Tockler'
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


var windowManager = require('./app/window-manager');

/**
 * Emitted when app starts
 */
app.on('ready',  () =>{
    windowManager.setMainWindow();
    //windowManager.setTrayWindow();

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

app.on('activate-with-no-open-windows',  () =>{
    windowManager.menubar.window.show();
});

/* Single Instance Check */

var iShouldQuit = app.makeSingleInstance( (commandLine, workingDirectory) =>{
    console.log("Make single instance");
    console.log(windowManager)
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
    return;
}

