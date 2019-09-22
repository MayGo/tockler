import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { app, ipcMain } from 'electron';

import { sequelize } from './Database';

import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { settingsService } from './services/settings-service';
import { initIpcActions } from './API';
import config from './config';

let logger = logManager.getLogger('AppManager');

export default class AppManager {
    static async init() {
        await AppManager.syncDb();
        AppManager.initGlobalClasses();
        initIpcActions();
        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();

        await stateManager.restoreState();
    }

    static async syncDb() {
        await sequelize.sync({ logging: log => logger.info(log), alter: true });
        logger.info('Database synced.');
    }

    static initAppEvents() {
        logger.info('Init app events.');

        ipcMain.on('openAtLoginChanged', (ev, name) => {
            AppManager.setOpenAtLogin();
        });
    }

    static setOpenAtLogin() {
        const openAtLogin = config.persisted.get('openAtLogin');

        logger.info('Setting openAtLogin to:', openAtLogin);
        app.setLoginItemSettings({
            openAtLogin: typeof openAtLogin !== 'undefined' ? openAtLogin : true,
            openAsHidden: true,
            args: ['--process-start-args', `"--hidden"`],
        });
    }

    static initGlobalClasses() {
        // Share configs between multiple windows
        (<any>global).shared = config;

        (<any>global).SettingsService = settingsService;
        (<any>global).AppSettingService = appSettingService;
        (<any>global).TrackItemService = trackItemService;
    }
}
