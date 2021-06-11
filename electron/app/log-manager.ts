import * as log from 'electron-log';
import * as Sentry from '@sentry/electron';
import { app } from 'electron';
import config from './config';

const version = app.getVersion();

const isProd = process.env.NODE_ENV === 'production';
// if (isProd) {
//     Sentry.init({
//         dsn: process.env.SENTRY_DSN,
//         environment: process.env.NODE_ENV,
//         release: version,
//     });
// }
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: version,
});

const origConsole = (log.transports as any).console;

const isError = function (e) {
    return e && e.stack && e.message;
};

const cachedErrors = {};

const sentryTransportConsole = (msgObj) => {
    const { level, data, date } = msgObj;
    const [message, ...rest] = data;

    if (!cachedErrors[message]) {
        cachedErrors[message] = true;

        Sentry.withScope((scope) => {
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
        });
    }

    origConsole(msgObj);
};

(log as any).transports.console = sentryTransportConsole;

let isLoggingEnabled = config.persisted.get('isLoggingEnabled');

export class LogManager {
    logger;

    init(settings) {
        console.log('init LogManager');
    }

    getLogger(name) {
        const logObj = log.create(name);

        log.transports.console.level = isProd ? 'warn' : 'debug';
        (logObj as any).transports.console = sentryTransportConsole;

        if (isLoggingEnabled) {
            logObj.transports.file.level = 'debug';
        } else {
            logObj.transports.file.level = false;
        }

        return logObj;
    }
}

export const logManager = new LogManager();
