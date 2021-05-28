import { app, ipcMain, nativeTheme } from 'electron';
import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { initIpcActions } from './API';
import config from './config';
import { connectAndSync } from './models/db';
import { sendToTrayWindow, sendToMainWindow } from './window-manager';

let logger = logManager.getLogger('AppManager');

export default class AppManager {
    static async init() {
        logger.info('Intializing GitStart DevTime');
        initIpcActions();

        logger.debug('Database syncing....');
        await connectAndSync();
        logger.debug('Database synced.');

        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();

        await stateManager.restoreState();
    }

    static initAppEvents() {
        logger.debug('Init app events.');

        ipcMain.on('openAtLoginChanged', (ev, name) => {
            AppManager.setOpenAtLogin();
        });

        nativeTheme.on('updated', function theThemeHasChanged() {
            const themeName = nativeTheme.shouldUseDarkColors ? 'dark' : 'default';
            AppManager.saveTheme(themeName);
        });
    }

    static setOpenAtLogin() {
        const openAtLogin = config.persisted.get('openAtLogin');

        logger.debug('Setting openAtLogin to:', openAtLogin);
        app.setLoginItemSettings({
            openAtLogin: typeof openAtLogin !== 'undefined' ? openAtLogin : true,
            openAsHidden: true,
            args: ['--process-start-args', `"--hidden"`],
        });
    }

    static saveTheme(theme) {
        logger.info('Theme changed', theme);
        config.persisted.set('activeThemeName', theme);
        sendToMainWindow('activeThemeChanged', theme);
        sendToTrayWindow('activeThemeChanged', theme);
    }
}
