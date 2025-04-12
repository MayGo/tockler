import { app, ipcMain, nativeTheme } from 'electron';
import { initIpcActions } from '../API';
import { dbClient } from '../drizzle/dbClient';
import { config } from '../utils/config';
import { logManager } from '../utils/log-manager';
import WindowManager, { sendToMainWindow, sendToTrayWindow } from './window-manager';

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
        logger.info('Initializing Tockler');
        initIpcActions();

        await dbClient.initDb();

        // Database is initialized automatically when importing dbManager
        logger.debug('Database initialized.');

        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();
    }

    static async destroy() {
        logger.info('Closing db connection');
        await dbClient.closeDb();
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
    }
}
