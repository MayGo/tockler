'use strict';

const Store = require('electron-store');
const electron = require('electron');
const log = require('electron-log');
const Sentry = require('@sentry/electron');

const version = electron.remote.app.getVersion();

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: version,
        beforeSend(event) {
            // Check if it is an exception, if so, show the report dialog
            if (event.exception) {
                Sentry.showReportDialog();
            }
            return event;
        },
    });
}

const origConsole = log.transports.console;

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

log.transports.console = sentryTransportConsole;

window.Sentry = Sentry;
window.version = version;
window.Store = Store;
window.logger = log;
window.ipcRenderer = electron.ipcRenderer;
