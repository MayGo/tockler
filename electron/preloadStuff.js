'use strict';

const Store = require('electron-store');
const { app, remote, ipcRenderer } = require('electron');

window.Store = Store;
window.ipcRenderer = ipcRenderer;
