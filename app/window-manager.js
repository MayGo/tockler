const electron = require('electron');
const config = require('./config');
const path = require('path');
const menubar = require('menubar');

const ipcMain = require("electron").ipcMain;

const BrowserWindow = electron.BrowserWindow;

let WindowManager = {};

WindowManager.setMainWindow = function () {
    this.mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        show: true,
        title: 'Tockler',
        icon: config.icon
    });

    this.mainWindow.maximize();
    this.mainWindow.loadURL('file://' + config.root + '/dist/index.html');

    this.mainWindow.on('closed', () => {
        this.mainWindow = null;
        console.log('Main window closed');
    });

    this.mainWindow.on('focus', () => {
        var sendEventName = 'main-window-focus';
        console.log("Sending focus event: " + sendEventName);
        this.mainWindow.webContents.send(sendEventName, 'ping');
    });


    this.mainWindow.on('close', () => {
        if (this.mainWindow) {
            console.log("Closing window");
            this.mainWindow = null;
        }
    });

    if (config.isDev) {
        this.mainWindow.openDevTools();
    }



};

WindowManager.initMainWindowEvents = function () {
    console.log("Init main window events.")
    ipcMain.on('toggle-main-window', (ev, name) => {
        if (!this.mainWindow) {
            console.log("MainWindow closed, opening");
            WindowManager.setMainWindow();
        }

        console.log("Toggling main window");
        if (this.mainWindow.isVisible()) {
            console.log("Show main window");
            this.mainWindow.show()
        } else if (this.mainWindow.isMinimized()) {
            console.log("Restore main window");
            this.mainWindow.restore();
        } else {
            console.log("Hide main window");
            this.mainWindow.hide()
        }

    })
}

WindowManager.setTrayWindow = function () {
    /**
     * Docs:
     * https://github.com/maxogden/menubar
     */
    this.menubar = menubar({
        index: 'file://' + config.root + '/dist/index.html',
        icon: config.icon,
        preloadWindow: true,
        width: 400,
        height: 500
    });

    this.menubar.on('after-create-window', () => {

    });
    this.menubar.on('after-show', () => {
        console.log('Show tray');
        this.menubar.window.webContents.send('focus-tray', 'ping');

        if (config.isDev) {
            console.log('Open menubar dev tools');
            this.menubar.window.openDevTools();
        }
    })

};

module.exports = WindowManager;