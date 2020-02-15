import * as log from 'electron-log';
import * as Sentry from '@sentry/electron';

const version = '1.0.0';

Sentry.init({
    dsn: 'https://8b5e35e414d146afac47bbf66d904746@sentry.io/2004797',
    environment: process.env.NODE_ENV || 'local',
    release: version,
});

log.transports.console.level = 'info';
log.transports.file.level = 'debug';

const origConsole = (log.transports as any).console;

export class LogManager {
    logger;

    init(settings) {
        console.log('init LogManager');
    }

    getLogger(name) {
        const logObj = log.create(name);
        (logObj as any).transports.console = msgObj => {
            const { level, data, date } = msgObj;
            const [message, ...rest] = data;

            Sentry.withScope(scope => {
                scope.setExtra('data', rest);
                scope.setExtra('date', msgObj.date.toLocaleTimeString());
                scope.setLevel(level);
                if (level === 'debug') {
                    // ignore debug for now
                } else {
                    Sentry.captureMessage(message);
                }
            });

            origConsole(msgObj);
        };

        return logObj;
    }
}

export const logManager = new LogManager();
