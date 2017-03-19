const electron = require('electron');
const config = require('./config');
const path = require('path');
const menubar = require('menubar');

const BrowserWindow = electron.BrowserWindow;

let WindowManager = {};

WindowManager.setMainWindow = function () {
    this.mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        show: true,
        title: 'Tockler',
        icon: path.join(config.root, 'app/shared/img/icon/timetracker_icon.ico')
    });
    this.mainWindow.maximize();
    this.mainWindow.loadURL('file://' + config.root + '/index.html');

    this.mainWindow.on('closed', () => {
        this.mainWindow = null;
        console.log('Main window closed');
    });

    this.mainWindow.on('focus', () => {
        var sendEventName = 'mainWindow-focus';
        console.log("Sending focus event: " + sendEventName);
        this.mainWindow.webContents.send(sendEventName, 'ping');
    });

    this.mainWindow.on('close', () => {
        if (this.mainWindow) {
            console.log("Closing window");
            console.log(this.mainWindow);
            this.mainWindow = null;
        }
    });

    if (config.isDev) {
        this.mainWindow.openDevTools();
    }

};

WindowManager.setTrayWindow = function () {
    /**
     * Docs:
     * https://github.com/maxogden/menubar
     */
    this.menubar = menubar({
        index: 'file://' + config.root + '/index-menubar.html',
        icon: path.join(config.root, 'app/shared/img/icon/timetracker_icon.png'),
        preloadWindow: true,
        width: 400,
        height: 500
    });

    this.menubar.on('after-create-window', ()=> {
        if (config.isDev) {
            this.menubar.window.openDevTools();
        }
    });
    this.menubar.on('after-show', ()=> {
        console.log('Show tray');
        this.menubar.window.webContents.send('focus-tray', 'ping');
    })

};

module.exports = WindowManager;