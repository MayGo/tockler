import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { app } from 'electron';

import { sequelize } from './Database';

import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { settingsService } from './services/settings-service';
import config from './config';

let logger = logManager.getLogger('AppManager');

export default class AppManager {
    static async init() {
        await AppManager.syncDb();
        AppManager.initGlobalClasses();
        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();

        await stateManager.restoreState();
    }

    static async syncDb() {
        await sequelize.sync();
        logger.info('Database synced.');
    }

    static initAppEvents() {
        logger.info('Init app events.');
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
