import * as menubar from 'menubar';

import MenuBuilder from './menu-builder';
import { throttle } from 'lodash';
import { app, ipcMain, BrowserWindow, globalShortcut } from 'electron';
import config from './config';
import * as os from 'os';
import { logManager } from './log-manager';

let logger = logManager.getLogger('WindowManager');

export default class WindowManager {
    static mainWindow;
    static menubar;

    static initMenus() {
        const menuBuilder = new MenuBuilder(this);
        menuBuilder.buildMenu();
    }

    static setMainWindow() {
        logger.info('Creating main window.');
        const windowSize = config.persisted.get('windowsize') || { width: 1080, height: 720 };
        const openMaximized = config.persisted.get('openMaximized') || false;

        this.mainWindow = new BrowserWindow({
            width: windowSize.width,
            height: windowSize.height,
            show: false,
            webPreferences: {
                zoomFactor: 1.0,
                blinkFeatures: 'OverlayScrollbars',
            },
            title: 'Tockler',
            icon: config.iconBig,
        });

        if (app.dock) {
            logger.info('Show dock window.');
            app.dock.show();
        }

        if (openMaximized) {
            this.mainWindow.maximize();
        }

        const url = config.isDev
            ? 'http://localhost:3000'
            : 'file://' + config.client + '/index.html';
        this.mainWindow.loadURL(url);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
            console.log('Main window closed');
        });

        this.mainWindow.on('focus', () => {
            let sendEventName = 'main-window-focus';
            console.log('Sending focus event: ' + sendEventName);
            // this.mainWindow.webContents.send(sendEventName, 'ping');
        });

        this.mainWindow.webContents.on('did-finish-load', () => {
            console.log('did-finish-load');
            this.mainWindow.show();
            this.mainWindow.focus();
        });

        globalShortcut.register('Escape', function() {
            console.log('Escape is pressed');

            if (this.mainWindow) {
                this.mainWindow.setFullScreen(false);
            }
        });

        this.mainWindow.on('close', () => {
            // Unregister all shortcuts.
            globalShortcut.unregisterAll();

            if (this.mainWindow) {
                console.log('Closing window');
                this.mainWindow = null;
            }
            if (app.dock) {
                logger.info('Hide dock window.');
                app.dock.hide();
            }
        });
        this.mainWindow.on('resize', throttle(WindowManager.storeWindowSize, 500));
        WindowManager.initMenus();
    }

    static initMainWindowEvents() {
        logger.info('Init main window events.');

        ipcMain.on('toggle-main-window', (ev, name) => {
            if (!this.mainWindow) {
                console.log('MainWindow closed, opening');
                WindowManager.setMainWindow();
            }

            console.log('Toggling main window');
            if (this.mainWindow.isVisible()) {
                console.log('Show main window');
                this.mainWindow.show();
            } else if (this.mainWindow.isMinimized()) {
                console.log('Restore main window');
                this.mainWindow.restore();
            } else {
                console.log('Hide main window');
                this.mainWindow.hide();
            }
        });
    }

    static storeWindowSize() {
        try {
            config.persisted.set('windowsize', WindowManager.mainWindow.getBounds());
        } catch (e) {
            console.error('Error saving', e);
        }
    }

    static setTrayWindow() {
        logger.info('Creating tray window.');
        /**
         * Docs:
         * https://github.com/maxogden/menubar
         */
        let icon = os.platform() === 'darwin' ? config.icon : config.iconBig;
        const url = config.isDev
            ? 'http://localhost:3000/#/trayApp'
            : 'file://' + config.client + '/index.html?/#/trayApp';

        this.menubar = menubar({
            index: url,
            icon: icon,
            preloadWindow: false,
            showDockIcon: false,
            width: 450,
            height: 500,
        });

        // this.menubar.on('after-create-window', () => {});
        this.menubar.on('after-show', () => {
            console.log('Show tray');
            this.menubar.window.webContents.send('focus-tray', 'ping');

            if (config.isDev) {
                console.log('Open menubar dev tools');
                this.menubar.window.openDevTools();
            }
        });
    }
}

export const windowManager = new WindowManager();
