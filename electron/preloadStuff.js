'use strict';
import { contextBridge, ipcRenderer } from 'electron';
import Store from 'electron-store';

import log, { transports, debug } from 'electron-log';
import Sentry, { init, showReportDialog, withScope, captureException, captureMessage } from '@sentry/electron';

const config = new Store();

if (process.env.NODE_ENV === 'production') {
    init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: version,
        beforeSend(event) {
            // Check if it is an exception, if so, show the report dialog
            if (event.exception) {
                showReportDialog();
            }
            return event;
        },
    });
}

const origConsole = transports.console;

const isError = function (e) {
    return e && e.stack && e.message;
};

const cachedErrors = {};

const sentryTransportConsole = (msgObj) => {
    const { level, data, date } = msgObj;
    const [message, ...rest] = data;

    if (!cachedErrors[message]) {
        cachedErrors[message] = true;

        withScope((scope) => {
            scope.setExtra('data', rest);
            scope.setExtra('date', msgObj.date.toLocaleTimeString());
            scope.setLevel(level);
            if (isError(message)) {
                captureException(message);
            } else if (level === 'debug') {
                // ignore debug for now
            } else {
                captureMessage(message);
            }
        });
    }

    origConsole(msgObj);
};

transports.console = sentryTransportConsole;

const isProd = false;
transports.console.level = isProd ? 'warn' : 'debug';

const IS_LOGGING_ENABLED = 'isLoggingEnabled';
let isLoggingEnabled = config.get(IS_LOGGING_ENABLED);

if (isLoggingEnabled) {
    transports.file.level = 'debug';
} else {
    transports.file.level = false;
}

const listeners = {};

contextBridge.exposeInMainWorld('electronBridge', {
    configGet: (key) => {
        return config.get(key);
    },
    configSet: (key, value) => {
        return config.set(key, value);
    },
    logger: log,
    platform: process.platform,
    isMas: process.mas === true,

    invokeIpc: async (actionName, payload) => {
        return await ipcRenderer.invoke(actionName, payload);
    },
    sendIpc: (key, ...args) => {
        debug('Send message with key: ' + key, args);
        ipcRenderer.send(key, ...args);
    },
    onIpc: (key, fn) => {
        const saferFn = (event, ...args) => fn(...args);
        // Deliberately strip event as it includes `sender`
        debug('Add listener with key: ' + key);
        ipcRenderer.on(key, saferFn);
        listeners[key] = saferFn;
    },
    removeListenerIpc: (key) => {
        debug('Remove listener with key: ' + key);
        const fn = listeners[key];
        ipcRenderer.removeListener(key, fn);
        delete listeners[key];
    },
});

window.Sentry = Sentry;
