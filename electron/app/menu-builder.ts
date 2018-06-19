import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron';

import config from './config';
import WindowManager from './window-manager';

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

        if (process.platform === 'darwin') {
            const about = {
                label: app.getName(),
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    {
                        label: 'Preferences',
                        accelerator: macOS ? 'Command+,' : 'Control+',
                        click() {
                            WindowManager.mainWindow.webContents.send('side:preferences');
                        },
                    },
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

            // Edit menu
            template[1].submenu.push(
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
                },
            );

            // Window menu
            template[3].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
            ];
        }
        const menu = Menu.buildFromTemplate(template as MenuItemConstructorOptions[]);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment() {
        WindowManager.mainWindow.openDevTools();

        WindowManager.mainWindow.webContents.on('context-menu', (e, props) => {
            const { x, y } = props;
            const menu = Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        WindowManager.mainWindow.inspectElement(x, y);
                    },
                },
            ]);
            menu.popup(WindowManager.mainWindow);
        });
    }
}
