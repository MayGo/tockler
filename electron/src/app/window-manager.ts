import { app, BrowserWindow, dialog, ipcMain, Tray } from 'electron';
import positioner from 'electron-traywindow-positioner';
import { autoUpdater } from 'electron-updater';
import { throttle } from 'lodash';
import { menubar } from 'menubar';
import path, { join } from 'path';
import { settingsService } from '../drizzle/queries/settings-service';
import { config, getTrayIcon } from '../utils/config';
import { logManager } from '../utils/log-manager';
import MenuBuilder from './menu-builder';

const logger = logManager.getLogger('WindowManager');

const preloadScript = path.join(app.getAppPath(), 'dist-electron', 'preloadStuff.js');

const devUrl = `http://127.0.0.1:3000`;
// const devUrl = `file://${path.join(__dirname, '..', '..', 'client', 'dist', 'index.html')}`;
const prodUrl = `file://${path.join(__dirname, 'index.html')}`;

const pageUrl = config.isDev ? devUrl : prodUrl;

// Define window bounds interface
interface WindowBounds {
    width: number;
    height: number;
    x?: number;
    y?: number;
}

export const sendToTrayWindow = (key: string, message = '') => {
    if (WindowManager.menubar && WindowManager.menubar.window) {
        WindowManager.menubar.window.webContents.send(key, message);
    } else {
        logger.error('No menubar window or no webcontents.');
    }
};

export const sendToNotificationWindow = async (key: string, message = '') => {
    try {
        // Save running log when receiving new log items (closing it)
        if (key === 'newLogItemAdded' || key === 'newWindowItemAdded') {
            const runningItem = await settingsService.getRunningLogItemAsJson();
            if (runningItem) {
                // Call the methods directly from the service
                await settingsService.updateByName('RUNNING_LOG_ITEM', '');
                // Note: startNewLogItem is not available, so we're removing it
            }
        }

        if (WindowManager.notificationWindow && WindowManager.notificationWindow.webContents) {
            WindowManager.notificationWindow.webContents.send(key, message);
        } else {
            logger.error('No notification window or no webcontents.');
        }
    } catch (error) {
        logger.error('Error sending notification:', error);
    }
};

export const sendToMainWindow = (key: string, message = '') => {
    if (WindowManager.mainWindow && WindowManager.mainWindow.webContents) {
        WindowManager.mainWindow.webContents.send(key, message);
    } else {
        logger.error('No main window or no webcontents.');
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
        Menu.setApplicationMenu(null);
    }

    static createMainWindow() {
        logger.debug('Creating main window.');
        logger.debug('Preload script path:', preloadScript);

        const hasWindowSize = config.persisted.has('windowsize');
        const windowSize = (config.persisted.get('windowsize') as WindowBounds) || { width: 1080, height: 720 };
        const wasMaximizedOrFullScreen = (config.persisted.get('wasMaximizedOrFullScreen') as boolean) || false;

        logger.debug('Restoring window size:', windowSize);
        logger.debug('Previous window was maximized or full screen:', wasMaximizedOrFullScreen);

        // Ensure window is created with valid dimensions
        // Check if we have a reasonable window size (sometimes can be corrupted)
        if (windowSize.width < 100 || windowSize.height < 100) {
            logger.debug('Window size is too small, using default size');
            windowSize.width = 1080;
            windowSize.height = 720;
        }

        // Check if the saved position is on a visible screen
        let isPositionValid = false;
        if (windowSize.x !== undefined && windowSize.y !== undefined) {
            try {
                const { screen } = require('electron');
                const displays = screen.getAllDisplays();
                for (const display of displays) {
                    // Check if the window is at least partially visible on this display
                    const { x, y, width, height } = display.bounds;
                    if (
                        windowSize.x < x + width &&
                        windowSize.x + windowSize.width > x &&
                        windowSize.y < y + height &&
                        windowSize.y + windowSize.height > y
                    ) {
                        isPositionValid = true;
                        break;
                    }
                }
            } catch (e) {
                logger.error('Error checking display bounds', e);
                isPositionValid = false;
            }
        }

        // Create window with saved dimensions
        this.mainWindow = new BrowserWindow({
            width: windowSize.width,
            height: windowSize.height,
            // Only set x & y if they are defined in saved configuration and valid
            ...(windowSize.x !== undefined && windowSize.y !== undefined && isPositionValid
                ? { x: windowSize.x, y: windowSize.y }
                : {}),
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

        // Return information about window state for setMainWindow to use
        return { hasWindowSize, wasMaximizedOrFullScreen };
    }

    static setMainWindow(showOnLoad = true) {
        const { hasWindowSize, wasMaximizedOrFullScreen } = WindowManager.createMainWindow();

        // Determine if window should be maximized based on previous state
        // If it's a first run (no window size) or the window was previously maximized
        const shouldMaximize = !hasWindowSize || wasMaximizedOrFullScreen;

        if (app.dock && showOnLoad) {
            logger.debug('Show dock window.');
            app.dock.show();
        }

        if (!this.mainWindow) {
            logger.error('MainWindow not created');
            return;
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
                    if (shouldMaximize) {
                        // Set a small delay to ensure the window is visible before maximizing
                        setTimeout(() => {
                            if (this.mainWindow) {
                                if (!hasWindowSize) {
                                    logger.debug('Opening window maximized (no saved size)');
                                } else {
                                    logger.debug('Restoring maximized state');
                                }

                                this.mainWindow.maximize();
                                // Never use full screen mode, only maximize
                            }
                        }, 200);
                    }
                    this.mainWindow.focus();
                } else {
                    logger.error('MainWindow not created');
                }
            }
        });

        // Add more events to ensure window size is saved
        this.mainWindow.on('maximize', () => {
            logger.debug('Window maximized');
            // Save current state before maximizing
            this.storeWindowSize();
        });

        this.mainWindow.on('unmaximize', () => {
            logger.debug('Window unmaximized');
            // Save the restored size
            this.storeWindowSize();
        });

        this.mainWindow.on('enter-full-screen', () => {
            logger.debug('Window entered full screen');
            // Save current state before going full screen
            this.storeWindowSize();
        });

        this.mainWindow.on('leave-full-screen', () => {
            logger.debug('Window left full screen');
            // When leaving full screen, check if we should maximize
            const wasMaximized = config.persisted.get('wasMaximizedOrFullScreen') as boolean;
            if (wasMaximized && this.mainWindow) {
                setTimeout(() => {
                    if (this.mainWindow) {
                        logger.debug('Restoring maximized state after leaving full screen');
                        this.mainWindow.maximize();
                    }
                }, 200);
            }
            // Save the restored size
            this.storeWindowSize();
        });

        // Always save window size right before closing
        this.mainWindow.on('close', () => {
            if (this.mainWindow) {
                logger.debug('Window closing, saving final size');
                // Always try to save the window size - storeWindowSize will now handle different states
                WindowManager.storeWindowSize();

                logger.debug('Closing window');
                this.mainWindow = null;
            }
            if (app.dock) {
                logger.debug('Hide dock window.');
                app.dock.hide();
            }
        });

        // Also save on other events that might change window state
        // Reduce throttle time to be more responsive
        this.mainWindow.on('resize', throttle(WindowManager.storeWindowSize, 300));
        this.mainWindow.on('move', throttle(WindowManager.storeWindowSize, 300));

        WindowManager.initMenus();
    }

    public static openMainWindow() {
        if (!WindowManager.mainWindow) {
            WindowManager.setMainWindow();
            return; // setMainWindow will handle maximizing if needed
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

            // Get the complete window bounds including position and size
            const bounds = this.mainWindow.getBounds() as WindowBounds;

            // Always store the current bounds regardless of window state
            logger.debug('Saving window bounds:', bounds);
            config.persisted.set('windowsize', bounds);

            // Also save the maximized state
            const isMaximized = this.mainWindow.isMaximized();
            logger.debug(`Window state - maximized: ${isMaximized}`);

            // Store a flag indicating if the window was maximized
            config.persisted.set('wasMaximizedOrFullScreen', isMaximized);

            // Verify the config was actually saved
            const savedBounds = config.persisted.get('windowsize');
            logger.debug('Verified saved bounds:', savedBounds);
        } catch (e) {
            logger.error('Error saving window bounds', e);
        }
    }

    static setTrayWindow() {
        logger.debug('Creating tray window.');

        this.tray = new Tray(config.iconTray);
        /**
         * Docs:
         * https://github.com/maxogden/menubar
         */

        // Use the menubar function to create a menubar instance
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
            }

            let trayIconWithColor;
            try {
                trayIconWithColor = nativeImage.createFromPath(config.iconTray);
            } catch (err) {
                logger.error('Error creating tray icon with color:', err);
            }

            try {
                this.tray!.setToolTip('Tockler');
                if (trayIconWithColor) {
                    this.tray!.setImage(trayIconWithColor);
                }
            } catch (e) {
                logger.error('Error setting tooltip or image:', e);
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
        // Tray icon: Setting all tray icon sources
        logger.debug('Setting tray icon to download update icon');
        try {
            let trayIconWithColor;
            try {
                trayIconWithColor = nativeImage.createFromPath(config.iconTrayUpdate);
            } catch (err) {
                logger.error('Error creating tray update icon with color:', err);
            }

            if (this.tray && trayIconWithColor) {
                this.tray.setImage(trayIconWithColor);
            }
        } catch (e) {
            logger.error('Error setting tray icon to update:', e);
        }
    }

    static toggleTrayIcon() {
        try {
            let trayIconWithColor;
            try {
                trayIconWithColor = nativeImage.createFromPath(config.iconTray);
            } catch (err) {
                logger.error('Error creating tray toggle icon with color:', err);
            }

            if (this.tray && trayIconWithColor) {
                this.tray.setImage(trayIconWithColor);
            }
        } catch (e) {
            logger.error('Error toggling tray icon:', e);
        }
    }
}

export const windowManager = new WindowManager();
