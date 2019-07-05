const { ipcRenderer, remote, webFrame } = require('electron');

const App = {
    AppSettingService: remote.getGlobal('AppSettingService'),
    SettingsService: remote.getGlobal('SettingsService'),
    TrackItemService: remote.getGlobal('TrackItemService'),
};
document.querySelector('webview').openDevTools();
alert('loaded');
window.App = App;
