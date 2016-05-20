var config = require('../config')

// Report crashes to our server.
require("electron").crashReporter.start(config.crashOpts)
