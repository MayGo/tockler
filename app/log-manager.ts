import * as path from 'path';
import * as bunyan from 'bunyan';

export default class LogManager {
    static logger;

    constructor() {
    }

    static init(settings) {
        if (!LogManager.logger) {

            var outputPath = path.join(settings.userDir, 'stdout.json');
            // Create logger
            LogManager.logger = bunyan.createLogger({
                name: 'tockler',
                streams: [
                    {
                        level: 'info',
                        stream: process.stdout            // log INFO and above to stdout
                    },
                    {
                        level: 'debug',
                        type: 'rotating-file',
                        period: '1h',
                        count: 50,        // keep 3 back copies
                        path: outputPath
                    }
                ]
            });

            LogManager.logger.info('Saving logs in directory:' + settings.userDir);

        }
    }
    static getLogger(name) {
        return LogManager.logger.child({ logger_name: name });
    };
}