import { app, autoUpdater, BrowserWindow, dialog, ipcMain, Menu, nativeImage, Tray, WebPreferences } from 'electron';
import positioner from 'electron-traywindow-positioner';
import { throttle } from 'lodash';
import { menubar } from 'menubar';
import * as path from 'path';
import { dbClient } from '../drizzle/dbClient';
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

const getNativeTrayIcon = (path: string) => {
    try {
        return nativeImage.createFromPath(path);
    } catch (err) {
        logger.error('Error creating tray toggle icon with color:', err);
    }

    return undefined;
};

export const sendToTrayWindow = (key: string, message = '') => {
    if (WindowManager.menubar && WindowManager.menubar.window) {
        WindowManager.menubar.window.webContents.send(key, message);
    } else {
        logger.error('No menubar window or no webcontents.');
    }
};

export const sendToNotificationWindow = async (key: string, durationMs: number) => {
    try {
        if (WindowManager.notificationWindow && WindowManager.notificationWindow.webContents) {
            // Save running log when receiving new log items (closing it)
            if (key === 'notifyUser') {
                if (WindowManager.tray) {
                    positioner.position(WindowManager.notificationWindow, WindowManager.tray.getBounds());
                } else {
                    logger.error('Tray not defined yet, not sending notifyUser');
                }
            }

            WindowManager.notificationWindow.showInactive();
            const workSettings = await dbClient.fetchWorkSettings();
            const { notificationDuration } = workSettings;

            setTimeout(() => {
                if (WindowManager.notificationWindow) {
                    WindowManager.notificationWindow.hide();
                } else {
                    logger.error('NotificationWindow not created');
                }
            }, notificationDuration * 1000);

            logger.debug('Send to notification window:', key, durationMs);
            WindowManager.notificationWindow.webContents.send(key, { durationMs });
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

const commonWebPreferences: WebPreferences = {
    zoomFactor: 1.0,
    contextIsolation: true,
    preload: preloadScript,
    sandbox: false,
    backgroundThrottling: false,
    nodeIntegration: false,
    v8CacheOptions: 'code',
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
            webPreferences: commonWebPreferences,
            backgroundColor: '#ffffff',
            title: 'Tockler',
            icon: config.iconWindow,
        });

        this.mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
            logger.error('Failed to load:', errorCode, errorDescription);
        });

        // Updated console-message handler for Electron 35
        // Using any type to avoid TypeScript errors with the event object
        this.mainWindow.webContents.on('console-message' as any, (event: any) => {
            logger.debug(`Console: ${event.message} (${event.sourceId}:${event.lineNumber})`);
        });

        this.mainWindow.loadURL(pageUrl).catch((err) => {
            logger.error('Could not load url in main window:', err);
        });

        this.mainWindow.on('minimize', () => {
            logger.debug('MainWindow minimize');
        });

        this.mainWindow.on('restore', () => {
            logger.debug('MainWindow restore');
        });

        // Clear history using the new API
        this.mainWindow.webContents.clearHistory();

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

        this.mainWindow.on('close', () => {
            logger.debug('MainWindow close');

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

        this.mainWindow.on('closed', () => {
            logger.debug('MainWindow closed');
            this.mainWindow = null;
        });

        this.mainWindow.on('focus', () => {
            logger.debug('MainWindow focus');
            let sendEventName = 'main-window-focus';

            if (this.mainWindow && this.mainWindow.isMaximized()) {
                sendEventName = 'main-window-focus-maximized';
            }
            if (this.mainWindow && this.mainWindow.webContents) {
                this.mainWindow.webContents.send(sendEventName, 'ping');
            }
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

        // Also save on other events that might change window state
        // Reduce throttle time but increase minimum time between updates
        this.mainWindow.on('resize', throttle(WindowManager.storeWindowSize, 1000));
        this.mainWindow.on('move', throttle(WindowManager.storeWindowSize, 1000));

        this.mainWindow.on('hide', () => {
            logger.debug('MainWindow hide');
        });

        this.mainWindow.on('show', () => {
            logger.debug('MainWindow show');
        });

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

    static async positionTrayWindow() {
        // Improve tray window positioning for macOS if "auto-hide" is enabled
        if (process.platform === 'darwin') {
            // Get work settings to check if auto-hide menu bar positioning is enabled
            if (!config.persisted.get('macAutoHideMenuBarEnabled')) {
                return;
            }

            // One-time immediate positioning to prevent initial flicker
            const trayBounds = this.tray?.getBounds();
            if (trayBounds && this.menubar.window) {
                const windowBounds = this.menubar.window.getBounds();
                this.menubar.window.setPosition(windowBounds.x, Math.max(trayBounds.y + trayBounds.height, 0), true);
            }

            // Set interval to keep window correctly positioned
            // This handles both auto-hide menu bar and regular menu bar
            const positionIntervalId = setInterval(() => {
                const trayBounds = this.tray?.getBounds();
                if (trayBounds && this.menubar.window) {
                    const windowBounds = this.menubar.window.getBounds();

                    // Only reposition if needed (avoid unnecessary updates)
                    const targetY = Math.max(trayBounds.y + trayBounds.height, 0);
                    if (Math.abs(windowBounds.y - targetY) > 2) {
                        this.menubar.window.setPosition(windowBounds.x, targetY, true);
                    }
                }
            }, 150);

            // Clear interval when window is hidden
            this.menubar.on('after-hide', () => {
                clearInterval(positionIntervalId);
            });
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
            preloadWindow: false,
            showDockIcon: false,

            browserWindow: {
                webPreferences: commonWebPreferences,
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
            WindowManager.positionTrayWindow();
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

            const trayIconWithColor = getNativeTrayIcon(config.iconTray);

            if (this.tray && trayIconWithColor) {
                this.tray.setToolTip('Tockler');
                this.tray.setImage(trayIconWithColor);
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
            webPreferences: commonWebPreferences,
            width: 80,
            height: 30,
        });
        this.notificationWindow.loadURL(pageUrl + '#/notificationApp').catch((err) => {
            logger.error('Could not load url in notification window:', err);
        });

        // Updated console-message handler for Electron 35
        // Using any type to avoid TypeScript errors with the event object
        this.notificationWindow.webContents.on('console-message' as any, (event: any) => {
            logger.debug(`Notification console: ${event.message} (${event.sourceId}:${event.lineNumber})`);
        });

        this.notificationWindow.setResizable(false);
        this.notificationWindow.on('closed', () => {
            this.notificationWindow = null;
        });
    }

    static setTrayIconToUpdate() {
        // Tray icon: Setting all tray icon sources
        logger.debug('Setting tray icon to download update icon');
        try {
            const trayIconWithColor = getNativeTrayIcon(config.iconTrayUpdate);

            if (this.tray && trayIconWithColor) {
                this.tray.setImage(trayIconWithColor);
            }
        } catch (e) {
            logger.error('Error setting tray icon to update:', e);
        }

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
        try {
            const trayIconWithColor = getNativeTrayIcon(getTrayIcon());

            if (this.tray && trayIconWithColor) {
                this.tray.setImage(trayIconWithColor);
            }
        } catch (e) {
            logger.error('Error toggling tray icon:', e);
        }
    }
}

export const windowManager = new WindowManager();
