import { menubar, Menubar } from 'menubar';
import MenuBuilder from './menu-builder';
import { throttle } from 'lodash';
import { app, ipcMain, BrowserWindow, autoUpdater, dialog, shell } from 'electron';
import config from './config';
import * as os from 'os';
import { logManager } from './log-manager';
import { join } from 'path';

let logger = logManager.getLogger('WindowManager');

const preloadScript = join(__dirname, 'preloadStuff.js');

export const sendToTrayWindow = (key, message = '') => {
    if (WindowManager.menubar.window) {
        WindowManager.menubar.window.webContents.send(key, message);
    } else {
        logger.debug(`Menubar not defined yet, not sending ${key}`);
    }
};

export const sendToMainWindow = (key, message = '') => {
    if (WindowManager.mainWindow) {
        WindowManager.mainWindow.webContents.send(key, message);
    } else {
        logger.debug(`MainWindow not defined yet, not sending ${key}`);
    }
};

export default class WindowManager {
    static mainWindow;
    static menubar;

    static initMenus() {
        const menuBuilder = new MenuBuilder();
        menuBuilder.buildMenu();
    }

    static createMainWindow() {
        logger.debug('Creating main window.');
        const windowSize = config.persisted.get('windowsize') || { width: 1080, height: 720 };

        this.mainWindow = new BrowserWindow({
            width: windowSize.width,
            height: windowSize.height,

            show: false,
            webPreferences: {
                zoomFactor: 1.0,
                preload: preloadScript,
            },
            title: 'GitStart DevTime',
            icon: config.iconBig,
        });
    }

    static setMainWindow(showOnLoad = true) {
        WindowManager.createMainWindow();
        const openMaximized = config.persisted.get('openMaximized') || false;

        if (app.dock && showOnLoad) {
            logger.debug('Show dock window.');
            app.dock.show();
        }

        if (openMaximized && showOnLoad) {
            this.mainWindow.maximize();
        }

        const url = config.isDev ? 'http://127.0.0.1:3000' : `file://${__dirname}/index.html`;

        this.mainWindow.loadURL(url);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
            logger.debug('Main window closed');
        });

        this.mainWindow.on('focus', () => {
            let sendEventName = 'main-window-focus';
            logger.debug('Sending focus event: ' + sendEventName);
            // this.mainWindow.webContents.send(sendEventName, 'ping');
        });

        this.mainWindow.webContents.on('did-finish-load', () => {
            logger.debug('did-finish-load');
            if (showOnLoad) {
                this.mainWindow.show();
                this.mainWindow.focus();
            }
        });

        this.mainWindow.on('close', () => {
            if (this.mainWindow) {
                logger.debug('Closing window');
                this.mainWindow = null;
            }
            if (app.dock) {
                logger.debug('Hide dock window.');
                app.dock.hide();
            }
        });
        this.mainWindow.webContents.on('new-window', (event, url) => {
            logger.info('URL', url);

            if (url.startsWith('file://') || url.startsWith('http://127.0.0.1:3000')) {
                return;
            }

            event.preventDefault();
            // open url in a browser and prevent default
            shell.openExternal(url);
        });

        this.mainWindow.on('resize', throttle(WindowManager.storeWindowSize, 500));
        WindowManager.initMenus();
    }

    public static openMainWindow() {
        if (!WindowManager.mainWindow) {
            WindowManager.setMainWindow();
        }

        if (WindowManager.mainWindow.isMinimized()) {
            WindowManager.mainWindow.restore();
        }

        WindowManager.mainWindow.show();
        logger.debug('Focusing main window');
        WindowManager.mainWindow.focus();
    }

    static initMainWindowEvents() {
        logger.debug('Init main window events.');

        ipcMain.on('toggle-main-window', (ev, name) => {
            if (!this.mainWindow) {
                logger.debug('MainWindow closed, opening');
                WindowManager.setMainWindow();
            }

            logger.debug('Toggling main window');

            if (this.mainWindow.isVisible() && !this.mainWindow.isMinimized()) {
                logger.debug('Hide main window');
                this.mainWindow.hide();
            } else if (this.mainWindow.isMinimized()) {
                logger.debug('Restore main window');
                this.mainWindow.restore();
            } else {
                logger.debug('Show main window');
                this.mainWindow.show();
            }
        });
    }

    static storeWindowSize() {
        try {
            config.persisted.set('windowsize', WindowManager.mainWindow.getBounds());
        } catch (e) {
            logger.error('Error saving', e);
        }
    }

    static setTrayWindow() {
        logger.debug('Creating tray window.');
        /**
         * Docs:
         * https://github.com/maxogden/menubar
         */
        let icon = os.platform() === 'darwin' ? config.icon : config.iconBig;
        const url = config.isDev
            ? 'http://localhost:3000/#/trayApp'
            : `file://${__dirname}/index.html#/trayApp`;

        this.menubar = menubar({
            index: url,
            icon: icon,
            preloadWindow: false,
            showDockIcon: false,

            browserWindow: {
                webPreferences: {
                    zoomFactor: 1.0,

                    preload: preloadScript,
                },
                width: 500,
                height: 600,
            },
        });

        // this.menubar.on('after-create-window', () => {});
        this.menubar.on('after-show', () => {
            this.menubar.window.webContents.send('focus-tray', 'ping');

            if (config.isDev) {
                logger.debug('Open menubar dev tools');
                this.menubar.window.openDevTools({ mode: 'bottom' });
            }
        });
        this.menubar.on('ready', () => {
            console.log('app is ready');
            // your app code here
        });
    }

    static setTrayIconToUpdate() {
        let iconUpdate = os.platform() === 'darwin' ? config.iconUpdate : config.iconUpdateBig;
        WindowManager.menubar.tray.setImage(iconUpdate);

        WindowManager.menubar.tray.on('click', async () => {
            const { response } = await dialog.showMessageBox(WindowManager.menubar.window, {
                type: 'question',
                buttons: ['Update', 'Cancel'],
                defaultId: 0,
                message: `New version is downloaded, do you want to install it now?`,
                title: 'Update available',
            });

            if (response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    }
}

export const windowManager = new WindowManager();
