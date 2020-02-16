'use strict';

const Store = require('electron-store');
const { app, ipcRenderer } = require('electron');
const Sentry = require('@sentry/electron');

const version = app.getVersion();

Sentry.init({
    dsn: 'https://8b5e35e414d146afac47bbf66d904746@sentry.io/2004797',
    environment: process.env.NODE_ENV || 'local',
    release: version,
});

window.Sentry = Sentry;
window.version = version;
window.Store = Store;
window.ipcRenderer = ipcRenderer;
