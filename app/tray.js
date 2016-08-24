var menubar = require('menubar')
var path = require('path')
var config = require('./config')

/**
 * Docs:
 * https://github.com/maxogden/menubar
 */
var mb = menubar({
    dir: path.join(config.pluginsPath, 'tray'),
    icon: path.join(config.root, 'app/shared/img/icon/timetracker_icon.png'),
    preloadWindow: true,
    width: 400,
    height: 500
});

mb.on('after-create-window', function () {
    if (config.isDev) {
        mb.window.openDevTools();
    }
});
mb.on('after-show', function () {
    console.log('Show tray');
    mb.window.webContents.send('focus-tray', 'ping');
})

module.exports = mb
