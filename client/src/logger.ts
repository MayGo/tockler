import { getIsLoggingEnabled } from './services/settings.api';

export const Logger: any = (window as any).logger;

const isProd = process.env.NODE_ENV === 'production';
Logger.transports.console.level = isProd ? 'warn' : 'debug';

let isLoggingEnabled = getIsLoggingEnabled();

if (isLoggingEnabled) {
    Logger.transports.file.level = 'debug';
} else {
    Logger.transports.file.level = false;
}
