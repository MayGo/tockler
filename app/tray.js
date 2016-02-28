var menubar = require('menubar')
var path = require('path')
var config = require('./config')

/**
 * Docs:
 * https://github.com/maxogden/menubar
 */
  var mb = menubar({
  dir: path.join(config.pluginsPath, 'tray'),
  icon: path.join(config.root, 'shared/img/icon/timetracker_icon.png'),
  preloadWindow: true,
  width: 300,
  height: 400,
  showDock: true
})

mb.on('after-create-window', function () {
  //mb.window.openDevTools();
});
mb.on('ready', function () {})

module.exports = mb
