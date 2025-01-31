import { app, Menu, shell, MenuItemConstructorOptions } from 'electron';
import { config } from './config';
import WindowManager from './window-manager';
import AppUpdater from './app-updater';

const macOS = process.platform === 'darwin';

export default class MenuBuilder {
    buildMenu() {
        if (config.isDev) {
            this.setupDevelopmentEnvironment();
        }

        const template: any = [
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'pasteandmatchstyle' },
                    { role: 'delete' },
                    { role: 'selectall' },
                ],
            },
            {
                label: 'View',
                submenu: [
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' },
                    {
                        label: 'Exit fullscreen',
                        accelerator: 'Escape',
                        click() {
                            if (WindowManager.mainWindow) {
                                WindowManager.mainWindow.setFullScreen(false);
                            }
                        },
                    },
                ],
            },
            {
                role: 'window',
                submenu: [{ role: 'minimize' }, { role: 'close' }],
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click() {
                            shell.openExternal('https://github.com/MayGo/tockler');
                        },
                    },
                    {
                        label: 'Search Issues',
                        click() {
                            shell.openExternal('https://github.com/MayGo/tockler/issues');
                        },
                    },
                ],
            },
        ];

        if (config.isDev) {
            // View menu
            template[1].submenu.unshift(
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
            );
        }

        const PREFERENCES_ITEM = {
            label: 'Preferences',
            accelerator: macOS ? 'Command+,' : 'Control+',
            click() {
                if (WindowManager.mainWindow) {
                    WindowManager.mainWindow.webContents.send('side:preferences');
                }
            },
        };

        const CHECK_UPDATES_ITEM = {
            label: 'Check for Updates...',
            click() {
                AppUpdater.checkForUpdatesManual();
            },
        };

        if (process.platform === 'darwin') {
            // Edit menu
            template[0].submenu.push(
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
                },
            );

            // Window menu
            template[2].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
            ];
            const about = {
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    PREFERENCES_ITEM,
                    { type: 'separator' },
                    CHECK_UPDATES_ITEM,
                    { type: 'separator' },
                    { role: 'services', submenu: [] },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' },
                ],
            };
            template.unshift(about);
        } else {
            // Window menu
            template[2].submenu = [
                PREFERENCES_ITEM,
                { type: 'separator' },
                CHECK_UPDATES_ITEM,
                { type: 'separator' },
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
            ];
        }

        const menu = Menu.buildFromTemplate(template as MenuItemConstructorOptions[]);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment() {
        if (!WindowManager.mainWindow) {
            console.error('No main window found, cannot setup development environment');
            return;
        }

        // WindowManager.mainWindow.openDevTools();

        // WindowManager.mainWindow.webContents.on('context-menu', (e, props) => {
        //     const { x, y } = props;
        //     const menu = Menu.buildFromTemplate([
        //         {
        //             label: 'Inspect element',
        //             click: () => {
        //                 WindowManager.mainWindow.inspectElement(x, y);
        //             },
        //         },
        //     ]);
        //     menu.popup(WindowManager.mainWindow);
        // });
    }
}
