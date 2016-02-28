var fs = require('fs')
var path = require('path')

var dataFiles = {
  app: '../data/app.json'
}

var appData = require(dataFiles.app) || {}

exports.write = function (data, cb) {
  fs.writeFile(path.join(__dirname, dataFiles.app), JSON.stringify(data, null, 2), function (err) {
    if (err) {
      console.error(err)
      return cb && cb(err)
    }

    cb && cb(null, appData)
  })
}

exports.read = function () {
  return dataFiles
}