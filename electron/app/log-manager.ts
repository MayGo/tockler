import { app } from 'electron';
import * as path from 'path';
import * as electronLog from 'electron-log';

electronLog.transports.console.level = 'info';
electronLog.transports.file.level = 'debug';

export class LogManager {
    logger;

    init(settings) {
        console.log('init LogManager');
    }

    getLogger(name) {
        return electronLog;
    }
}

export const logManager = new LogManager();
