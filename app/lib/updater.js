var _ = require('lodash')
var spawn = require('child_process').spawn
var request = require('request')

/**
 * @TODO Working on progress
 */
var Updater = {
  url: null,
  basePath: null,

  // optional
  app: null,

  init: function (url, basePath, app) {
    var self = Object.create(this)

    if (!url || !basePath)
      throw '[Updater] Missing required arguments.'

    self.url = url
    self.basePath = basePath
    self.app = app

    return self
  },

  check: function (cb) {
    var self = this

    var url = self.url
    if (self.app) {
      var version = self.app.getVersion()
      var appname = self.app.getName()
      url += '?version=' + version + '&appname=' + appname
    }

    console.log('[Updater] connecting ' + url)
    request(url, function(err, response, body) {
      switch (response.statusCode) {
        case 200:
          var json
          try {
            json = JSON.parse(body)
          } catch (e) {
            cb('unable to parse response')
          }
          cb(null, json)
          break
        case 204:
          cb(null)
          break
        default:
          console.error('[Updater] Error raised when querying update.')
          cb('connect error, response code: ' + response.statusCode)
      }
    })
  },

  update: function (resp, cb) {
    console.log('...')

    cb()
  },

  rerun: function() {
    var self = this
    console.log('process.execPath:', process.execPath)
    console.log('self.basePath:', self.basePath)
    require('child_process').exec(process.execPath + ' ' + self.basePath)

    setTimeout(function() {
      self.app.quit()
    }, 1000)
  },

  restart: function () {
    var rerun = spawn('node', ['rerun.js'])

    rerun.stdout.on('data', function (data) {
      console.log('stdout: ' + data)
    })

    rerun.stderr.on('data', function (data) {
      console.log('stderr: ' + data)
    })

    rerun.on('close', function (code) {
      console.log('child process exited with code ' + code)
    })
  }
}

module.exports = Updater
