//require('events').EventEmitter.defaultMaxListeners = 30;

import { app, ipcMain } from 'electron';
import contextMenu from 'electron-context-menu';
import AppManager from './app/app-manager';
import AppUpdater from './app/app-updater';
import WindowManager from './app/window-manager';
import { cleanupBackgroundJob, initBackgroundJob } from './background/initBackgroundJob';
import { config } from './utils/config';
import { logManager } from './utils/log-manager';
let logger = logManager.getLogger('AppIndex');

// Log app version
logger.info(`Tockler version: ${app.getVersion()}`);

app.setAppUserModelId('ee.trimatech.tockler');

/* Single Instance Check */

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        logger.debug('Make single instance');
        WindowManager.openMainWindow();
    });

    AppUpdater.init();

    // Enable GPU acceleration for smoother UI rendering and animations
    app.commandLine.appendSwitch('enable-hardware-acceleration');
    // Allow using potentially problematic GPUs that could still provide better performance
    app.commandLine.appendSwitch('ignore-gpu-blacklist');
    // Optimize memory usage by eliminating buffer copying between processes
    app.commandLine.appendSwitch('enable-zero-copy');
    // Ensure fresh data by bypassing HTTP caching
    app.commandLine.appendSwitch('disable-http-cache', 'true');

    // Maintain consistent performance by preventing renderer process throttling
    app.commandLine.appendSwitch('disable-renderer-backgrounding');
    // Ensure accurate time tracking by preventing timer delays in background
    app.commandLine.appendSwitch('disable-background-timer-throttling');
    // Maintain UI responsiveness even when window is not visible
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

    // Improve rendering speed by using GPU for rasterization
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    // Optimize memory usage by eliminating buffer copying (critical for performance)
    app.commandLine.appendSwitch('enable-zero-copy');
    // Enhance graphics performance by using native GPU memory management
    app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');

    contextMenu();

    ipcMain.on('close-app', () => {
        logger.info('Closing Tockler');
        app.quit();
    });

    app.on('will-quit', async () => {
        logger.debug('will-quit');
        // Clean up any resources here that need to be terminated
        await cleanupBackgroundJob();
        await AppManager.destroy();
    });

    app.on('window-all-closed', () => {
        logger.debug('window-all-closed');
        app.quit();
    });

    // Handle get-app-version IPC event
    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    // User wants to open main window when reopened app. (But not open main window on application launch)
    app.on('activate', () => {
        logger.debug('Activate event');
        if (app.isReady()) {
            WindowManager.openMainWindow();
        } else {
            logger.debug('App is not ready in activate event');
        }
    });

    app.on('ready', async () => {
        try {
            // if (config.isDev) {
            //     await initExtensions();
            // }

            WindowManager.initMainWindowEvents();

            if (!config.isDev || config.trayEnabledInDev) {
                WindowManager.setTrayWindow();
            }

            WindowManager.setNotificationWindow();

            await AppManager.init();

            await initBackgroundJob();
        } catch (error) {
            logger.error(
                `App errored in ready event: ${error instanceof Error ? error.toString() : String(error)}`,
                error,
            );
        }
    });
} else {
    logger.debug('Quiting instance.');
    app.quit();
}
