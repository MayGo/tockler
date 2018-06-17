import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { app, ipcMain } from 'electron';

import { sequelize } from './models/index';

import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { settingsService } from './services/settings-service';
import config from './config';

let logger = logManager.getLogger('AppManager');

export default class AppManager {
    static async init() {
        AppManager.syncDb();
        AppManager.initGlobalClasses();
        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();

        await stateManager.restoreState();
    }

    static syncDb() {
        sequelize
            .sync()
            .then(() => {
                logger.info('Database synced.');
            })
            .catch((error: Error) => {
                logger.error(error.message);
            });
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
