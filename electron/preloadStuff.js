'use strict';

const Store = require('electron-store');
const { remote, ipcRenderer } = require('electron');

const App = {
    AppSettingService: remote.getGlobal('AppSettingService'),
    SettingsService: remote.getGlobal('SettingsService'),
    TrackItemService: remote.getGlobal('TrackItemService'),
};
window.Store = Store;
window.App = App;
window.ipcRenderer = ipcRenderer;
