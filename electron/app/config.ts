import { app } from 'electron';
import * as path from 'path';

const Config = require('electron-store');
const isDevelopment = require('electron-is-dev');

let root = path.join(__dirname, '..');
let client = isDevelopment ? path.join(root, '..', 'client', 'build') : path.join(root, 'dist');
let userDir = app.getPath('userData');
// Set manually for debugging
//let userDir = '/Users/USERNAME/Library/Application Support/Tockler';

// console.log('User dir is:' + userDir);

export default {
    // root directory
    root: root,
    client: client,
    userDir: userDir,

    icon: path.join(root, 'shared/img/icon/tockler_icon.png'),
    iconBig: path.join(root, 'shared/img/icon/tockler_icon_big_w_bg.png'),

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
