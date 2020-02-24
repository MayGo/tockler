import { app, ipcMain } from 'electron';
import { logManager } from './log-manager';
import { stateManager } from './state-manager';
import { initIpcActions } from './API';
import config from './config';
import { connectAndSync } from './models/db';

let logger = logManager.getLogger('AppManager');

export default class AppManager {
    static async init() {
        logger.info('Intializing Tockler');
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
