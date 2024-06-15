import { app } from 'electron';
import * as path from 'path';
import * as os from 'os';
import Store from 'electron-store';
import isDevelopment from 'electron-is-dev';

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

interface ConfigStore {
    windowsize: {
        width: number;
        height: number;
    };
    usePurpleTrayIcon: boolean;
    isNativeThemeEnabled: boolean;
    openAtLogin: boolean;
    isLoggingEnabled: boolean;
    openMaximized: boolean;
}

const schema: Store.Schema<ConfigStore> = {
    usePurpleTrayIcon: {
        type: 'boolean',
    },
    windowsize: {
        type: 'object',
        properties: {
            width: {
                type: 'number',
            },
            height: {
                type: 'number',
            },
        },
    },
    isNativeThemeEnabled: {
        type: 'boolean',
    },
    openAtLogin: {
        type: 'boolean',
    },
    isLoggingEnabled: {
        type: 'boolean',
    },
    openMaximized: {
        type: 'boolean',
    },
};

const persisted = new Store<ConfigStore>({ schema });

export const getIcon = (winFileName, macFileName) => {
    return path.join(root, isWin ? `shared/img/icon/win/${winFileName}` : `shared/img/icon/mac/${macFileName}`);
};

export const getTrayIcon = () => {
    const usePurpleTrayIcon = persisted.get('usePurpleTrayIcon');
    return getIcon(
        'tockler_icon_big.ico',
        usePurpleTrayIcon ? 'tockler_icon_tray.png' : 'tockler_icon_trayTemplate.png',
    );
};

export default {
    // root directory
    root: root,
    client: client,
    userDir: userDir,

    iconTray: getTrayIcon(),
    iconTrayUpdate: getIcon('tockler_icon_big_update.ico', 'tockler_icon_tray_updateTemplate.png'),
    iconNotification: getIcon('tockler_icon_big.ico', 'tockler_icon_big.png'),
    iconWindow: getIcon('tockler_icon_big.ico', 'tockler_icon_big.png'),

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
    persisted,
};
