import { app, ipcMain } from 'electron';
import { sequelize } from './Database';
import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { initIpcActions } from './API';
import config from './config';

let logger = logManager.getLogger('AppManager');

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export default class AppManager {
    static async init() {
        logger.info('Intializing Tockler');
        initIpcActions();
        await AppManager.syncDb();

        AppManager.initAppEvents();
        AppManager.setOpenAtLogin();

        await stateManager.restoreState();
    }

    static async syncDb() {
        // await sequelize.sync({ logging: log => logger.debug(log), alter: true });
        logger.debug('Database syncing....');
        await sequelize.sync({ logging: log => logger.debug(log) });
        logger.debug('Database synced.');
    }

    static initAppEvents() {
        logger.debug('Init app events.');

        ipcMain.on('openAtLoginChanged', (ev, name) => {
            AppManager.setOpenAtLogin();
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
}
