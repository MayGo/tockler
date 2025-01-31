import { menubar } from 'menubar';
import MenuBuilder from './menu-builder';
import { throttle } from 'lodash';
import { app, ipcMain, BrowserWindow, dialog, shell, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import { config, getTrayIcon } from './config';
import { logManager } from './log-manager';
import path, { join } from 'path';
import { settingsService } from './services/settings-service';
import positioner from 'electron-traywindow-positioner';

let logger = logManager.getLogger('WindowManager');

const preloadScript = join(__dirname, 'preloadStuff.js');

const devUrl = `http://127.0.0.1:3000`;
// const devUrl = `file://${path.join(__dirname, '..', '..', 'client', 'dist', 'index.html')}`;
const prodUrl = `file://${path.join(__dirname, 'index.html')}`;

const pageUrl = config.isDev ? devUrl : prodUrl;

export const sendToTrayWindow = (key: string, message = '') => {
    if (WindowManager.menubar.window && !WindowManager.menubar.window.webContents.isDestroyed()) {
        logger.debug('Send to tray window:', key, message);
        WindowManager.menubar.window.webContents.send(key, message);
    } else {
        logger.debug(`Menubar not defined or window destroyed, not sending ${key}`);
    }
};

function openUrlInExternalWindow(event: any, url: string) {
    logger.info('URL', url);

    if (url.startsWith('file://') || url.startsWith('http://127.0.0.1:3000')) {
        return;
    }

    event.preventDefault();
    // open url in a browser and prevent default
    shell.openExternal(url);
}

export const sendToNotificationWindow = async (key: string, message = '') => {
    if (WindowManager.notificationWindow) {
        if (key === 'notifyUser') {
            if (WindowManager.tray) {
                positioner.position(WindowManager.notificationWindow, WindowManager.tray.getBounds());
            } else {
                logger.error('Tray not defined yet, not sending notifyUser');
            }
            WindowManager.notificationWindow.showInactive();
            const workSettings = await settingsService.fetchWorkSettings();
            const { notificationDuration } = workSettings;

            setTimeout(() => {
                if (WindowManager.notificationWindow) {
                    WindowManager.notificationWindow.hide();
                } else {
                    logger.error('NotificationWindow not created');
                }
            }, notificationDuration * 1000);
        }

        logger.debug('Send to notification window:', key, message);
        WindowManager.notificationWindow.webContents.send(key, message);
    } else {
        logger.debug(`NotificationBar not defined yet, not sending ${key}`);
    }
};

export const sendToMainWindow = (key: string, message = '') => {
    if (WindowManager.mainWindow) {
        WindowManager.mainWindow.webContents.send(key, message);
    } else {
        logger.debug(`MainWindow not defined yet, not sending ${key}`);
    }
};

export default class WindowManager {
    static mainWindow: BrowserWindow | null = null;
    static menubar: any;
    static notificationWindow: BrowserWindow | null = null;
    static tray: Tray | null = null;

    static initMenus() {
        const menuBuilder = new MenuBuilder();
        menuBuilder.buildMenu();
    }

    static createMainWindow() {
        logger.debug('Creating main window.');
        logger.debug('Preload script path:', preloadScript);
        const windowSize = config.persisted.get('windowsize') || { width: 1080, height: 720 };

        this.mainWindow = new BrowserWindow({
            width: windowSize.width,
            height: windowSize.height,
            show: true,
            webPreferences: {
                zoomFactor: 1.0,
                contextIsolation: true,
                preload: preloadScript,
                sandbox: false,
            },
            title: 'Tockler',
            icon: config.iconWindow,
        });

        this.mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
            logger.error('Failed to load:', errorCode, errorDescription);
        });
    }

    static setMainWindow(showOnLoad = true) {
        WindowManager.createMainWindow();
        const openMaximized = config.persisted.get('openMaximized') || false;

        if (app.dock && showOnLoad) {
            logger.debug('Show dock window.');
            app.dock.show();
        }

        if (!this.mainWindow) {
            logger.error('MainWindow not created');
            return;
        }

        if (openMaximized && showOnLoad) {
            this.mainWindow.maximize();
        }

        this.mainWindow.loadURL(pageUrl);

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
                if (this.mainWindow) {
                    this.mainWindow.show();
                    this.mainWindow.focus();
                } else {
                    logger.error('MainWindow not created');
                }
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
        //   this.mainWindow.webContents.on('new-window', openUrlInExternalWindow);

        this.mainWindow.on('resize', throttle(WindowManager.storeWindowSize, 500));
        WindowManager.initMenus();
    }

    public static openMainWindow() {
        if (!WindowManager.mainWindow) {
            WindowManager.setMainWindow();
        }

        if (!WindowManager.mainWindow) {
            logger.error('MainWindow not created');
            return;
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

        ipcMain.on('toggle-main-window', () => {
            if (!this.mainWindow) {
                logger.debug('MainWindow closed, opening');
                WindowManager.setMainWindow();
            }

            if (!this.mainWindow) {
                logger.error('MainWindow not created');
                return;
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
            if (!this.mainWindow) {
                logger.error('MainWindow not created');
                return;
            }

            config.persisted.set('windowsize', this.mainWindow.getBounds());
        } catch (e) {
            logger.error('Error saving', e);
        }
    }

    static setTrayWindow() {
        logger.debug('Creating tray window.');

        this.tray = new Tray(config.iconTray);
        /**
         * Docs:
         * https://github.com/maxogden/menubar
         */

        this.menubar = menubar({
            index: pageUrl + '#/trayApp',
            tray: this.tray,
            //  preloadWindow: false, in MAS build shows white tray only
            preloadWindow: true,
            showDockIcon: false,

            browserWindow: {
                webPreferences: {
                    zoomFactor: 1.0,
                    contextIsolation: true,
                    preload: preloadScript,
                    sandbox: false,
                },
                width: 500,
                height: 600,
            },
        });
        // to prevent white flash
        // this.menubar.app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');

        this.menubar.on('after-create-window', () => {
            // https://github.com/maxogden/menubar/issues/306
            logger.debug('Hiding dock, as a fix.');
            this.menubar.app?.dock?.hide();
        });

        this.menubar.on('after-show', () => {
            this.menubar.window.webContents.send('focus-tray', 'ping');

            if (config.isDev) {
                logger.debug('Open menubar dev tools');
                this.menubar.window.openDevTools({ mode: 'bottom' });
            }
        });

        this.menubar.on('ready', () => {
            logger.debug('Menubar is ready');
            if (this.menubar.window) {
                this.menubar.window.webContents.on(
                    'did-fail-load',
                    (_event: any, errorCode: any, errorDescription: any) => {
                        logger.error('Menubar failed to load:', errorCode, errorDescription);
                    },
                );

                this.menubar.window.webContents.on('new-window', openUrlInExternalWindow);
            }
        });
    }

    static setNotificationWindow() {
        logger.debug('Creating notification window.');

        this.notificationWindow = new BrowserWindow({
            focusable: false,
            alwaysOnTop: true,
            hasShadow: false,
            //transparent: true,
            frame: false,
            show: false,
            //backgroundColor: '#00000000',

            opacity: 0.7,
            webPreferences: {
                zoomFactor: 1.0,
                contextIsolation: true,
                preload: preloadScript,
                sandbox: false,
            },
            width: 70,
            height: 27,
        });
        this.notificationWindow.loadURL(pageUrl + '#/notificationApp');

        this.menubar.on('ready', () => {
            this.menubar.tray.on('click', () => {
                if (this.notificationWindow) {
                    this.notificationWindow.hide();
                } else {
                    logger.error('NotificationWindow not created');
                }
            });
        });
    }

    static setTrayIconToUpdate() {
        WindowManager.menubar.tray.setImage(config.iconTrayUpdate);

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

    static toggleTrayIcon() {
        const iconTray = getTrayIcon();
        WindowManager.menubar.tray.setImage(iconTray);
    }
}

export const windowManager = new WindowManager();
