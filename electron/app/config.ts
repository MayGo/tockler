import { app } from 'electron';
import * as path from 'path';
import * as os from 'os';

const Config = require('electron-store');
const isDevelopment = require('electron-is-dev');

let root = path.join(__dirname, '..');
let client = isDevelopment ? path.join(root, '..', 'client', 'build') : path.join(root, 'dist');
// Load real data even when in development

let useRealDataInDev = false;
let userDir =
    isDevelopment && useRealDataInDev
        ? `/Users/${os.userInfo().username}/Library/Application Support/Tockler`
        : app.getPath('userData');

console.debug('User dir is:' + userDir);

const isWin = os.platform() === 'win32';

export default {
    // root directory
    root: root,
    client: client,
    userDir: userDir,

    iconTray: path.join(
        root,
        isWin
            ? 'shared/img/icon/win/tockler_icon_big.ico'
            : 'shared/img/icon/mac/tockler_icon_trayTemplate.png',
    ),
    iconTrayUpdate: path.join(
        root,
        isWin
            ? 'shared/img/icon/win/tockler_icon_big_update.ico'
            : 'shared/img/icon/mac/tockler_icon_tray_updateTemplate.png',
    ),
    iconNotification: path.join(
        root,
        isWin
            ? 'shared/img/icon/win/tockler_icon_big.ico'
            : 'shared/img/icon/mac/tockler_icon_big.png',
    ),
    iconWindow: path.join(
        root,
        isWin
            ? 'shared/img/icon/win/tockler_icon_big.ico'
            : 'shared/img/icon/mac/tockler_icon_big.png',
    ),

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
