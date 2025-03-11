'use strict';
import { ErrorEvent } from '@sentry/core';
import * as Sentry from '@sentry/electron';
import { contextBridge, ipcRenderer, shell } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';

const config = new Store();

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version,
        beforeSend(event: ErrorEvent) {
            // Check if it is an exception, if so, show the report dialog
            if (event.exception) {
                Sentry.showReportDialog();
            }
            return event;
        },
    });
}

const origConsole = log.transports.console;

const isError = function (e: unknown): boolean {
    return Boolean(e && typeof e === 'object' && 'stack' in e && 'message' in e);
};

interface CachedErrors {
    [key: string]: boolean;
}

const cachedErrors: CachedErrors = {};

interface MessageObject {
    level: Sentry.SeverityLevel;
    data: unknown[];
    date: Date;
}

const sentryTransportConsole = (msgObj: MessageObject) => {
    const { level, data } = msgObj;
    const [message, ...rest] = data;

    if (typeof message === 'string' && !cachedErrors[message]) {
        cachedErrors[message] = true;

        Sentry.withScope((scope: Sentry.Scope) => {
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

    origConsole(msgObj as log.LogMessage);
};

log.transports.console = sentryTransportConsole as log.ConsoleTransport;

const isProd = false;
log.transports.console.level = isProd ? 'warn' : 'debug';

const IS_LOGGING_ENABLED = 'isLoggingEnabled';
let isLoggingEnabled = config.get(IS_LOGGING_ENABLED);

if (isLoggingEnabled) {
    log.transports.file.level = 'debug';
} else {
    log.transports.file.level = false;
}

interface Listeners {
    [key: string]: (...args: unknown[]) => void;
}

const listeners: Listeners = {};

contextBridge.exposeInMainWorld('electronBridge', {
    configGet: (key: string) => {
        return config.get(key);
    },
    configSet: (key: string, value: unknown) => {
        return config.set(key, value);
    },
    logger: log,
    platform: process.platform,
    isMas: process.mas === true,
    appVersion: () => ipcRenderer.invoke('get-app-version'),

    openUrlInExternalWindow: (url: string) => {
        log.info('URL', url);

        if (url.startsWith('file://') || url.startsWith('http://127.0.0.1:3000')) {
            return;
        }

        // open url in a browser and prevent default
        shell.openExternal(url);
    },

    invokeIpc: async (actionName: string, payload: unknown) => {
        return await ipcRenderer.invoke(actionName, payload);
    },
    sendIpc: (key: string, ...args: unknown[]) => {
        log.debug('Send message with key: ' + key, args);
        ipcRenderer.send(key, ...args);
    },
    onIpc: (key: string, fn: (...args: unknown[]) => void) => {
        const saferFn = (_event: unknown, ...args: unknown[]) => fn(...args);
        // Deliberately strip event as it includes `sender`
        log.debug('Add listener with key: ' + key);
        ipcRenderer.on(key, saferFn);
        listeners[key] = saferFn;
    },
    removeListenerIpc: (key: string) => {
        log.debug('Remove listener with key: ' + key);
        const fn = listeners[key];
        ipcRenderer.removeListener(key, fn);
        delete listeners[key];
    },
});

declare global {
    interface Window {
        Sentry: typeof Sentry;
    }
}

window.Sentry = Sentry;
