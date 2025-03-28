import { app, ipcMain, nativeTheme } from 'electron';
import { initIpcActions } from '../API';
import { config } from '../utils/config';

import { connectAndSync, db } from '../drizzle/db';
import { logManager } from '../utils/log-manager';
import WindowManager, { sendToMainWindow, sendToNotificationWindow, sendToTrayWindow } from './window-manager';

let logger = logManager.getLogger('AppManager');

const IS_NATIVE_THEME_ENABLED = 'isNativeThemeEnabled';
const NATIVE_THEME_CONFIG_CHANGED = 'nativeThemeChanged';

const USE_PURPLE_TRAY_ICON_CHANGED = 'usePurpleTrayIconChanged';
const THEME_CONFIG_KEY = 'selectedTheme';

const theThemeHasChanged = () => {
    AppManager.saveThemeAndNotify(AppManager.getNativeTheme());
};
export default class AppManager {
    static async init() {
        logger.info('Intializing Tockler');
        initIpcActions();

        logger.debug('Database syncing....');

        await connectAndSync();

        logger.debug('Database synced.');

        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();
    }

    static async destroy() {
        if (db) {
            db.$client.close();
            logger.info('Closed db connection');
        }
    }

    static initAppEvents() {
        logger.debug('Init app events.');

        ipcMain.on('openAtLoginChanged', () => {
            AppManager.setOpenAtLogin();
        });

        const checkNativeThemeState = () => {
            if (config.persisted.get(IS_NATIVE_THEME_ENABLED)) {
                AppManager.setToggleNativeThemeListeners(true);
                AppManager.saveThemeAndNotify(AppManager.getNativeTheme());
            } else {
                AppManager.setToggleNativeThemeListeners(false);
            }
        };

        ipcMain.on(NATIVE_THEME_CONFIG_CHANGED, () => {
            checkNativeThemeState();
        });
        ipcMain.on(USE_PURPLE_TRAY_ICON_CHANGED, () => {
            WindowManager.toggleTrayIcon();
        });

        checkNativeThemeState();
    }

    static setOpenAtLogin() {
        let openAtLogin = config.persisted.get('openAtLogin');

        const firstTime = typeof openAtLogin === 'undefined';
        if (firstTime) {
            config.persisted.set('openAtLogin', true);
            openAtLogin = true;
        }

        logger.debug('Setting openAtLogin to:', openAtLogin);
        app.setLoginItemSettings({
            openAtLogin: openAtLogin,
            openAsHidden: true,
            args: ['--process-start-args', `"--hidden"`],
        });
    }

    static setToggleNativeThemeListeners(enable: boolean) {
        nativeTheme.removeListener('updated', theThemeHasChanged);

        if (enable) {
            nativeTheme.addListener('updated', theThemeHasChanged);
        }
    }

    static getNativeTheme() {
        return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    }

    static saveActiveTheme(theme: string) {
        config.persisted.set(THEME_CONFIG_KEY, theme);
    }

    static saveThemeAndNotify(theme: string) {
        logger.info('Theme changed', theme);
        AppManager.saveActiveTheme(theme);

        sendToMainWindow('activeThemeChanged', theme);
        sendToTrayWindow('activeThemeChanged', theme);
        sendToNotificationWindow('activeThemeChanged', theme);
    }
}
