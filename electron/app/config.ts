import { app } from 'electron';
import * as path from 'path';

const Config = require('electron-store');

let root = path.join(__dirname, '..');
const isDevelopment = true;
// Load real data even when in development
let userDir = app.getPath('userData');

// console.log('User dir is:' + userDir);

export default {
    // root directory
    root: root,

    userDir: userDir,

    // plugins directory
    pluginsPath: root,

    // a flag to whether the app is running in development mode
    isDev: isDevelopment,
    isTest: (<any>global).__TEST__, // process.env.NODE_ENV === 'test',

    // enable tray icon for dev mode

    trayEnabledInDev: true,

    // name of the main window
    mainAppName: 'main-window',

    databaseConfig: {
        database: 'bdgt',
        username: 'username',
        password: 'password',
        outputPath: path.join(userDir, 'tracker.db'),
    },
    persisted: new Config(),
};
