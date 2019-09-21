'use strict';

const { remote, ipcRenderer } = require('electron');

const App = {
    AppSettingService: remote.getGlobal('AppSettingService'),
    SettingsService: remote.getGlobal('SettingsService'),
    TrackItemService: remote.getGlobal('TrackItemService'),
};

window.App = App;
window.ipcRenderer = ipcRenderer;
