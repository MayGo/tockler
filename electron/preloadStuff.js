'use strict';

const Store = require('electron-store');
const { app, remote, ipcRenderer } = require('electron');
const Sentry = require('@sentry/electron');

const version = '1.0.0';

Sentry.init({
    dsn: 'https://8b5e35e414d146afac47bbf66d904746@sentry.io/2004797',
    environment: process.env.NODE_ENV || 'local',
    release: version,
});

window.Sentry = Sentry;
window.Store = Store;
window.ipcRenderer = ipcRenderer;
