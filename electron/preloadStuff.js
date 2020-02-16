'use strict';

const Store = require('electron-store');
const electron = require('electron');
const log = require('electron-log');
const Sentry = require('@sentry/electron');

const version = electron.remote.app.getVersion();

Sentry.init({
    dsn: 'https://8b5e35e414d146afac47bbf66d904746@sentry.io/2004797',
    environment: process.env.NODE_ENV || 'local',
    release: version,
});

const origConsole = log.transports.console;

const isError = function(e) {
    return e && e.stack && e.message;
};

const sentryTransportConsole = msgObj => {
    const { level, data, date } = msgObj;
    const [message, ...rest] = data;

    Sentry.withScope(scope => {
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

    origConsole(msgObj);
};

log.transports.console = sentryTransportConsole;

window.Sentry = Sentry;
window.version = version;
window.Store = Store;
window.logger = log;
window.ipcRenderer = electron.ipcRenderer;
