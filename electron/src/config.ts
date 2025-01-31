import { app } from 'electron';
import * as path from 'path';
import * as os from 'os';

import Store from 'electron-store';
import isDevelopment from 'electron-is-dev';

let root = path.join(__dirname, '..');

let useRealDataInDev = false;
let userDir =
    isDevelopment && useRealDataInDev
        ? `/Users/${os.userInfo().username}/Library/Application Support/Tockler`
        : app.getPath('userData');

console.debug('User dir is:' + userDir);

const isWin = os.platform() === 'win32';

interface StoreType {
    usePurpleTrayIcon: boolean;
    openAtLogin: boolean;
    isLoggingEnabled: boolean;
    isAutoUpdateEnabled: boolean;
    windowsize: { width: number; height: number };
    openMaximized: boolean;
}

const persisted = new Store<StoreType>();

export const getIcon = (winFileName: string, macFileName: string) => {
    return path.join(root, isWin ? `shared/img/icon/win/${winFileName}` : `shared/img/icon/mac/${macFileName}`);
};

export const getTrayIcon = () => {
    const usePurpleTrayIcon = persisted.get('usePurpleTrayIcon');
    return getIcon(
        'tockler_icon_big.ico',
        usePurpleTrayIcon ? 'tockler_icon_tray.png' : 'tockler_icon_trayTemplate.png',
    );
};

export const config = {
    iconTray: getTrayIcon(),
    iconTrayUpdate: getIcon('tockler_icon_big_update.ico', 'tockler_icon_tray_updateTemplate.png'),
    iconNotification: getIcon('tockler_icon_big.ico', 'tockler_icon_big.png'),
    iconWindow: getIcon('tockler_icon_big.ico', 'tockler_icon_big.png'),

    // a flag to whether the app is running in development mode
    isDev: isDevelopment,

    // enable tray icon for dev mode
    trayEnabledInDev: true,

    databaseConfig: {
        database: 'bdgt',
        username: 'username',
        password: 'password',
        outputPath: path.join(userDir, 'tracker.db'),
    },
    persisted,
};
