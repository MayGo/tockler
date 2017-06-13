var path = require('path');

const isDevelopment = require('electron-is-dev');

var root = path.join(__dirname, '..')

var config = {

    // root directory
    root: root,

    icon: path.join(root, 'app/shared/img/icon/tockler_icon.png'),

    // plugins directory
    pluginsPath: root,

    // a flag to whether the app is running in development mode
    isDev: isDevelopment,

    // enable tray icon for dev mode

    trayEnabledInDev: false,

    // name of the main window
    mainAppName: 'main-window'
}


/**
 * Please refer to
 * `https://github.com/atom/electron/blob/master/docs/api/crash-reporter.md`
 * for crash reporter configuration.
 */
config.crashOpts = {
    productName: 'YourName',
    companyName: 'YourCompany',
    submitURL: 'https://your-domain.com/url-to-submit',
    autoSubmit: false
}

config.db = {
    path: process.cwd() + "/data"
}

// Share configs between multiple windows
global.shared = config

module.exports = config
