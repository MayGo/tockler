// override path, to fix asar.unpacked paths
require('hazardous');

import { backgroundJob } from './background-job';
import { backgroundService } from './background-service';
import { app, powerMonitor } from 'electron';
import { logManager } from './log-manager';
let logger = logManager.getLogger('AppIndex');

import AppManager from './app-manager';

/* Single Instance Check */

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    logger.info('Quiting instance.');
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        logger.info('Make single instance');
    });

    app.commandLine.appendSwitch('disable-renderer-backgrounding');

    app.on('window-all-closed', function() {
        logger.info('window-all-closed');
        // pluginMgr.removeAll();
        // app.quit();
    });

    app.on('ready', async () => {
        await AppManager.init();
        backgroundJob.init();

        powerMonitor.on('suspend', function() {
            logger.info('The system is going to sleep');
            backgroundService.onSleep();
        });

        powerMonitor.on('resume', function() {
            logger.info('The system is going to resume');
            backgroundService
                .onResume()
                .then(() => logger.info('Resumed'), e => logger.error('Error in onResume', e));
        });
    });
}
