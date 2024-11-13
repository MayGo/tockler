import { app, shell, BrowserWindow, ipcMain, powerMonitor } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

import { initBackgroundJob } from './initBackgroundJob';
import { backgroundService } from './background-service';
import { logManager } from './log-manager';
import AppManager from './app-manager';
import WindowManager from './window-manager';
import { extensionsManager } from './extensions-manager';
import AppUpdater from './app-updater';
import config from './config';

const logger = logManager.getLogger('AppIndex');

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
        },
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
}

/* Single Instance Check */
const isMas = false; // process.mas === true;
const gotTheLock = app.requestSingleInstanceLock();

console.info('....gotTheLock', gotTheLock, isMas);

if (gotTheLock || isMas) {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(async () => {
        // Set app user model id for windows

        app.setAppUserModelId(process.execPath);
        // electronApp.setAppUserModelId('io.tockler');

        app.on('second-instance', () => {
            // Someone tried to run a second instance, we should focus our window.
            logger.debug('Make single instance');
            WindowManager.openMainWindow();
        });

        AppUpdater.init();

        app.commandLine.appendSwitch('disable-renderer-backgrounding');

        // require('electron-context-menu')({})

        ipcMain.on('close-app', function () {
            logger.info('Closing Tockler');
            app.quit();
        });

        app.on('will-quit', async () => {
            logger.debug('will-quit');
            await AppManager.destroy();
        });
        app.on('window-all-closed', function () {
            logger.debug('window-all-closed');
            // app.quit();
        });

        // Default open or close DevTools by F12 in development
        // and ignore CommandOrControl + R in production.
        // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window);
        });

        // IPC test
        ipcMain.on('ping', () => console.log('pong'));

        createWindow();

        app.on('activate', function () {
            logger.debug('Activate event');
            if (app.isReady()) {
                WindowManager.openMainWindow();
            } else {
                logger.debug('App is not ready in activate event');
            }
        });

        try {
            if (config.isDev) {
                await extensionsManager.init();
            }

            WindowManager.initMainWindowEvents();

            if (!config.isDev || config.trayEnabledInDev) {
                WindowManager.setTrayWindow();
            }

            WindowManager.setNotificationWindow();

            await AppManager.init();

            await initBackgroundJob();

            powerMonitor.on('suspend', function () {
                logger.debug('The system is going to sleep');
                backgroundService.onSleep();
            });

            powerMonitor.on('resume', function () {
                logger.debug('The system is going to resume');
                backgroundService.onResume().then(
                    () => logger.debug('Resumed'),
                    (e) => logger.error('Error in onResume', e),
                );
            });
        } catch (error) {
            logger.error(`App errored in ready event.`, error);
        }
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    // In this file you can include the rest of your app"s specific main process
    // code. You can also put them in separate files and require them here.
} else {
    logger.debug('Quiting instance.');
    app.quit();
}
