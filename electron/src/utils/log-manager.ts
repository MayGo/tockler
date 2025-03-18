import * as Sentry from '@sentry/electron';
import { app } from 'electron';
import log from 'electron-log/main';
import { config } from './config';

const version = app.getVersion();

const isProd = process.env['NODE_ENV'] === 'production';
if (isProd) {
    Sentry.init({
        dsn: process.env['SENTRY_DSN'],
        environment: process.env['NODE_ENV'],
        release: version,
    });
}

// Initialize electron-log for both main and renderer processes
log.initialize();

// Set reasonable log levels
log.transports.console.level = isProd ? 'warn' : 'debug';
log.transports.file.level = isProd ? 'info' : 'debug';

// Configure file logging based on user preference
let isLoggingEnabled = config.persisted.get('isLoggingEnabled');
if (!isLoggingEnabled) {
    log.transports.file.level = false;
}

const origConsole = log.transports.console.writeFn;

const isError = function (e: any) {
    return e && e.stack && e.message;
};

const cachedErrors: Record<string, boolean> = {};

// Create a wrapped Sentry transport
const sentryTransportConsole = (msgObj: any) => {
    const { level, data } = msgObj.message || msgObj;
    const [message, ...rest] = data || [];

    if (message && !cachedErrors[String(message)]) {
        cachedErrors[String(message)] = true;

        Sentry.withScope((scope) => {
            scope.setExtra('data', rest);
            scope.setExtra('date', msgObj.date?.toLocaleTimeString() || new Date().toLocaleTimeString());
            scope.setLevel(level);
            if (isError(message)) {
                Sentry.captureException(message);
            } else if (level === 'debug') {
                // ignore debug for now
            } else {
                Sentry.captureMessage(String(message));
            }
        });
    }

    origConsole(msgObj);
};

// Override the console transport
log.transports.console.writeFn = isProd ? sentryTransportConsole : origConsole;

export class LogManager {
    logger: any;

    init(_settings: any) {
        console.log('init LogManager');
        // Re-initialize logger to ensure it's properly set up
        log.initialize();
    }

    getLogger(name: string) {
        return log.scope(name);
    }
}

export const logManager = new LogManager();
