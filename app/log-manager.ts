import { app } from "electron";
import * as path from 'path';
import * as electronLog from 'electron-log';

electronLog.transports.console.level = 'debug';

export class LogManager {
    logger;

    constructor() {
    }

    init(settings) {
       
    }
    getLogger(name) {
        return electronLog;
    };
}

export const logManager = new LogManager();