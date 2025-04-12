import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import { checkIdleState, IDLE_STATE_CHECK_INTERVAL } from './watchForIdleState.utils';

const logger = logManager.getLogger('IdleStateWatcher');

let interval: NodeJS.Timeout | null = null;

function addIdleStateWatch(idleAfterSeconds: number) {
    removeIdleStateWatch();
    logger.debug('Add idle state check interval');
    interval = setInterval(() => checkIdleState(idleAfterSeconds), IDLE_STATE_CHECK_INTERVAL);
}

function removeIdleStateWatch() {
    if (interval) {
        logger.debug('Remove idle state check interval');
        clearInterval(interval);
        interval = null;
    }
}

function startIdleStateWatcher(idleAfterSeconds: number) {
    addIdleStateWatch(idleAfterSeconds);
    return removeIdleStateWatch;
}

let removeIdleStateWatcher: () => void;

export function watchForIdleState(idleAfterSeconds: number) {
    logger.debug('Watching for idle state');

    removeIdleStateWatcher = startIdleStateWatcher(idleAfterSeconds);

    appEmitter.on('system-is-resuming', async () => {
        logger.debug('State changed: system-is-resuming');

        if (removeIdleStateWatcher) {
            logger.warn('ERROR:Stopping previous idle state watcher. Should not happen.');
            removeIdleStateWatcher(); // stop previous watcher, it should be stopped already, but just in case
        }

        removeIdleStateWatcher = startIdleStateWatcher(idleAfterSeconds);
    });

    appEmitter.on('system-is-sleeping', async () => {
        logger.debug('State changed: system-is-sleeping');

        removeIdleStateWatcher?.();
    });
}

export function watchForIdleStateCleanup() {
    logger.debug('Removing idle state watcher');
    removeIdleStateWatcher?.();
}
