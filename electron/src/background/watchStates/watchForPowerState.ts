import { powerMonitor } from 'electron';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';

const logger = logManager.getLogger('WatchForPowerState');

export function watchForPowerState() {
    powerMonitor.on('suspend', function () {
        logger.debug('The system is going to sleep');
        appEmitter.emit('system-is-sleeping');
    });

    powerMonitor.on('resume', function () {
        logger.debug('The system is going to resume');
        appEmitter.emit('system-is-resuming');
    });
}

export function watchForPowerStateCleanup() {
    powerMonitor.removeAllListeners('suspend');
    powerMonitor.removeAllListeners('resume');
}
