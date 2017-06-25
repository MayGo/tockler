
import { app } from "electron";

import * as path from 'path';

const isDevelopment = require('electron-is-dev');

var root = path.join(__dirname, '..');
var userDir = app.getPath('userData');

export default {

    // root directory
    root: root,
    userDir: userDir,

    icon: path.join(root, 'shared/img/icon/tockler_icon.png'),

    // plugins directory
    pluginsPath: root,

    // a flag to whether the app is running in development mode
    isDev: isDevelopment,

    // enable tray icon for dev mode

    trayEnabledInDev: false,

    // name of the main window
    mainAppName: 'main-window',

    databaseConfig: {
        database: 'bdgt',
        username: 'username',
        password: 'password',
        outputPath: path.join(userDir, 'tracker.db')
    }


}
