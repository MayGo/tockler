(function () {
    'use strict';
    var logger;
    var path = require('path');
    var bunyan = require('bunyan');

    function LogManager() {

    }

    /*
     Initiates LogManager with received settings
     */
    LogManager.init = function init(settings) {

        if (!logger) {

            var outputPath = path.join(settings.userDir, 'stdout.json');
            // Create logger
            logger = bunyan.createLogger({
                name: 'tockler',
                streams: [
                    {
                        level: 'info',
                        stream: process.stdout            // log INFO and above to stdout
                    },
                    {
                        level: 'debug',
                        type: 'rotating-file',
                        period: '1d',   // daily rotation
                        count: 3,        // keep 3 back copies
                        path: outputPath
                    }
                ]
            });

            logger.info('Saving logs in directory:' + settings.userDir);

        }
    };

    /*
     Returns a new instance of LogManager
     */
    LogManager.getLogger = function getInstance(name) {
        return logger.child({logger_name: name});
    };

    module.exports = LogManager;
}());