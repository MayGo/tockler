import { app } from 'electron';
import * as path from 'path';
import * as os from 'os';

interface StoreType {
    usePurpleTrayIcon: boolean;
    openAtLogin: boolean;
    isLoggingEnabled: boolean;
    isAutoUpdateEnabled: boolean;
    windowsize: { width: number; height: number };
    openMaximized: boolean;
}

const loadStore = async () => {
    const { default: Store } = await import('electron-store');
    return new Store<StoreType>();
};

const loadIsDevelopment = async () => {
    const { default: isDevelopment } = await import('electron-is-dev');
    return isDevelopment;
};

const root = path.join(__dirname, '..');

export const initializeConfig = async () => {
    const isDevelopment = await loadIsDevelopment();
    const client = isDevelopment ? path.join(root, '..', 'client', 'build') : path.join(root, 'dist');
    const useRealDataInDev = false;
    const userDir =
        isDevelopment && useRealDataInDev
            ? `/Users/${os.userInfo().username}/Library/Application Support/Tockler`
            : app.getPath('userData');

    console.debug('User dir is:' + userDir);

    const isWin = os.platform() === 'win32';

    const persisted = await loadStore();

    const getIcon = (winFileName: string, macFileName: string) => {
        return path.join(root, isWin ? `shared/img/icon/win/${winFileName}` : `shared/img/icon/mac/${macFileName}`);
    };

    const getTrayIcon = () => {
        const usePurpleTrayIcon = persisted.get('usePurpleTrayIcon');
        return getIcon(
            'tockler_icon_big.ico',
            usePurpleTrayIcon ? 'tockler_icon_tray.png' : 'tockler_icon_trayTemplate.png',
        );
    };

    return {
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
        isTest: (global as any).__TEST__, // process.env.NODE_ENV === 'test',

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
};
