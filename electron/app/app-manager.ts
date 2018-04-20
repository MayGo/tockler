import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import config from './config';
import { sequelize } from './models/index';

import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { settingsService } from './services/settings-service';
let logger = logManager.getLogger('AppManager');

export default class AppManager {
    static async init() {
        AppManager.syncDb();
        AppManager.initGlobalClasses();

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

    static initGlobalClasses() {
        // Share configs between multiple windows
        (<any>global).shared = config;

        (<any>global).SettingsService = settingsService;
        (<any>global).AppSettingService = appSettingService;
        (<any>global).TrackItemService = trackItemService;
    }
}
