var config = require('../config')

// Report crashes to our server.
require('crash-reporter').start(config.crashOpts)
