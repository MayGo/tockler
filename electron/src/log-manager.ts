import * as log from 'electron-log';
import * as Sentry from '@sentry/electron/main';
import { app } from 'electron';
// import { initializeConfig } from './config.js';

const version = app.getVersion();

const isProd = process.env['NODE_ENV'] === 'production';
if (isProd) {
    Sentry.init({
        dsn: process.env['SENTRY_DSN'],
        environment: process.env['NODE_ENV'],
        release: version,
    });
}

const origConsole = (log.transports as any).console;

const isError = function (e: any) {
    return e && e.stack && e.message;
};

const cachedErrors: Record<string, boolean> = {};

const sentryTransportConsole = (msgObj: any) => {
    const { level, data } = msgObj;
    const [message, ...rest] = data;

    if (!cachedErrors[message]) {
        cachedErrors[message] = true;

        const scope = Sentry.getCurrentScope();
        scope.setExtra('data', rest);
        scope.setExtra('date', msgObj.date.toLocaleTimeString());
        scope.setLevel(level);
        if (isError(message)) {
            Sentry.captureException(message);
        } else if (level === 'debug') {
            // ignore debug for now
        } else {
            Sentry.captureMessage(message);
        }
    }

    origConsole(msgObj);
};

(log as any).transports.console = sentryTransportConsole;

export class LogManager {
    logger: any;

    init(_settings: any) {
        console.log('init LogManager');
    }

    getLogger(name: string) {
        // const config = await initializeConfig();
        let isLoggingEnabled = false; //config.persisted.get('isLoggingEnabled');
        const logObj = log.create({ logId: name });
        if (isProd) {
            (logObj as any).transports.console = sentryTransportConsole;
        }
        // log.transports.console.level = isProd ? 'warn' : 'debug';

        if (isLoggingEnabled) {
            logObj.transports.file.level = 'debug';
        } else {
            logObj.transports.file.level = false;
        }

        return logObj;
    }
}

export const logManager = new LogManager();
