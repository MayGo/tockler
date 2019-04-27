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
        const menuBuilder = new MenuBuilder();
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
            logger.info('Main window closed');
        });

        this.mainWindow.on('focus', () => {
            let sendEventName = 'main-window-focus';
            logger.info('Sending focus event: ' + sendEventName);
            // this.mainWindow.webContents.send(sendEventName, 'ping');
        });

        this.mainWindow.webContents.on('did-finish-load', () => {
            logger.info('did-finish-load');
            this.mainWindow.show();
            this.mainWindow.focus();
        });

        globalShortcut.register('Escape', () => {
            logger.info('Escape is pressed');

            if (this.mainWindow) {
                this.mainWindow.setFullScreen(false);
            }
        });

        this.mainWindow.on('close', () => {
            // Unregister all shortcuts.
            globalShortcut.unregisterAll();

            if (this.mainWindow) {
                logger.info('Closing window');
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

    public static openMainWindow() {
        if (!WindowManager.mainWindow) {
            WindowManager.setMainWindow();
        }

        if (WindowManager.mainWindow.isMinimized()) {
            WindowManager.mainWindow.restore();
        }

        WindowManager.mainWindow.show();
        logger.info('Focusing main window');
        WindowManager.mainWindow.focus();
    }

    static initMainWindowEvents() {
        logger.info('Init main window events.');

        ipcMain.on('toggle-main-window', (ev, name) => {
            if (!this.mainWindow) {
                logger.info('MainWindow closed, opening');
                WindowManager.setMainWindow();
            }

            logger.info('Toggling main window');
            if (this.mainWindow.isVisible()) {
                logger.info('Show main window');
                this.mainWindow.show();
            } else if (this.mainWindow.isMinimized()) {
                logger.info('Restore main window');
                this.mainWindow.restore();
            } else {
                logger.info('Hide main window');
                this.mainWindow.hide();
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
            width: 500,
            height: 600,
        });

        // this.menubar.on('after-create-window', () => {});
        this.menubar.on('after-show', () => {
            logger.info('Show tray');
            this.menubar.window.webContents.send('focus-tray', 'ping');

            if (config.isDev) {
                logger.info('Open menubar dev tools');
                this.menubar.window.openDevTools();
            }
        });
    }
}

export const windowManager = new WindowManager();
