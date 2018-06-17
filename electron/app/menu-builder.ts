import { app, Menu, shell, BrowserWindow } from 'electron';

import config from './config';
import WindowManager from './window-manager';

export default class MenuBuilder {
    windowManager;

    constructor(windowManager) {
        this.windowManager = windowManager;
    }

    buildMenu() {
        if (config.isDev) {
            this.setupDevelopmentEnvironment();
        }

        let template;

        if (process.platform === 'darwin') {
            template = this.buildDarwinTemplate();
        } else {
            template = this.buildDefaultTemplate();
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment() {
        this.windowManager.mainWindow.openDevTools();
        this.windowManager.mainWindow.webContents.on('context-menu', (e, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.windowManager.mainWindow.inspectElement(x, y);
                    },
                },
            ]).popup(this.windowManager.mainWindow);
        });
    }

    buildDarwinTemplate() {
        const subMenuAbout = {
            label: 'Electron',
            submenu: [
                { label: 'About Tockler', selector: 'orderFrontStandardAboutPanel:' },
                { type: 'separator' },
                {
                    label: 'Preferences',
                    accelerator: 'Command+,',
                    click() {
                        WindowManager.mainWindow.webContents.send('side:preferences');
                    },
                },
                { label: 'Services', submenu: [] },
                { type: 'separator' },
                { label: 'Hide Tockler', accelerator: 'Command+H', selector: 'hide:' },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:',
                },
                { label: 'Show All', selector: 'unhideAllApplications:' },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        };
        const subMenuEdit = {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
                {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    selector: 'selectAll:',
                },
            ],
        };
        const subMenuViewDev = {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'Command+R',
                    click: () => {
                        this.windowManager.mainWindow.webContents.reload();
                    },
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: 'Ctrl+Command+F',
                    click: () => {
                        this.windowManager.mainWindow.setFullScreen(
                            !this.windowManager.mainWindow.isFullScreen(),
                        );
                    },
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Alt+Command+I',
                    click: () => {
                        this.windowManager.mainWindow.toggleDevTools();
                    },
                },
            ],
        };
        const subMenuViewProd = {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Full Screen',
                    accelerator: 'Ctrl+Command+F',
                    click: () => {
                        this.windowManager.mainWindow.setFullScreen(
                            !this.windowManager.mainWindow.isFullScreen(),
                        );
                    },
                },
            ],
        };
        const subMenuWindow = {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:',
                },
                { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
                { type: 'separator' },
                { label: 'Bring All to Front', selector: 'arrangeInFront:' },
            ],
        };
        const subMenuHelp = {
            label: 'Help',
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
        };

        const subMenuView = config.isDev ? subMenuViewDev : subMenuViewProd;

        return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
    }

    buildDefaultTemplate() {
        const templateDefault = [
            {
                label: '&File',
                submenu: [
                    {
                        label: '&Open',
                        accelerator: 'Ctrl+O',
                    },
                    {
                        label: '&Close',
                        accelerator: 'Ctrl+W',
                        click: () => {
                            this.windowManager.mainWindow.close();
                        },
                    },
                ],
            },
            {
                label: '&View',
                submenu: true // config.isDev
                    ? [
                          {
                              label: '&Reload',
                              accelerator: 'Ctrl+R',
                              click: () => {
                                  this.windowManager.mainWindow.webContents.reload();
                              },
                          },
                          {
                              label: 'Toggle &Full Screen',
                              accelerator: 'F11',
                              click: () => {
                                  this.windowManager.mainWindow.setFullScreen(
                                      !this.windowManager.mainWindow.isFullScreen(),
                                  );
                              },
                          },
                          {
                              label: 'Toggle &Developer Tools',
                              accelerator: 'Alt+Ctrl+I',
                              click: () => {
                                  this.windowManager.mainWindow.toggleDevTools();
                              },
                          },
                      ]
                    : [
                          {
                              label: 'Toggle &Full Screen',
                              accelerator: 'F11',
                              click: () => {
                                  this.windowManager.mainWindow.setFullScreen(
                                      !this.windowManager.mainWindow.isFullScreen(),
                                  );
                              },
                          },
                      ],
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Learn More',
                        click() {
                            shell.openExternal('http://electron.atom.io');
                        },
                    },
                    {
                        label: 'Documentation',
                        click() {
                            shell.openExternal(
                                'https://github.com/atom/electron/tree/master/docs#readme',
                            );
                        },
                    },
                    {
                        label: 'Community Discussions',
                        click() {
                            shell.openExternal('https://discuss.atom.io/c/electron');
                        },
                    },
                    {
                        label: 'Search Issues',
                        click() {
                            shell.openExternal('https://github.com/atom/electron/issues');
                        },
                    },
                ],
            },
        ];

        return templateDefault;
    }
}
