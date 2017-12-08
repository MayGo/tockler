const { app, BrowserWindow, Menu } = require('electron');
require('electron-debug')({ enabled: true });

let win;

async function installExtensions() {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer');

    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {
        throw e;
      }
    }
  }
}

const getDefaultSize = () => {
  const monWidth = require('electron').screen.getPrimaryDisplay().size.width;
  let size;

  if (monWidth >= 1920) {
    size = { height: 930, width: 1811 };
  } else if (monWidth >= 1600) {
    size = { height: 780, width: 1371 };
  } else if (monWidth >= 1360) {
    size = { height: 700, width: 1151 };
  } else if (monWidth >= 1280) {
    size = { height: 650, width: 1151 };
  }

  return size;
};

const createWindow = async () => {
  await installExtensions();

  const size = getDefaultSize();

  win = new BrowserWindow(size);
  win.setMenu(null);

  win.loadURL('http://localhost:3000/');

  win.on('closed', () => {
    win = null;
  });

  win.webContents.on('did-finish-load', () => {
    win.focus();
  });

  if (process.env.NODE_ENV === 'development') {
    win.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click() {
            win.inspectElement(x, y);
          },
        },
      ]).popup(win);
    });
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
