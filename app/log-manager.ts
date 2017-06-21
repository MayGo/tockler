import { app } from "electron";
import * as path from 'path';
import * as bunyan from 'bunyan';

export class LogManager {
    logger;

    constructor() {
        this.init({ userDir: app.getPath('userData') });
    }

    init(settings) {
        if (!this.logger) {

            var outputPath = path.join(settings.userDir, 'stdout.json');
            // Create logger
            this.logger = bunyan.createLogger({
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

            this.logger.info('Saving logs in directory:' + settings.userDir);

        }
    }
    getLogger(name) {
        //console.log("Getting logger for: " + name);
        return this.logger.child({ logger_name: name });
    };
}

export const logManager = new LogManager();