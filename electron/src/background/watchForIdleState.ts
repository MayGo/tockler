import { logManager } from '../utils/log-manager';
import { checkIdleState, IDLE_STATE_CHECK_INTERVAL } from './watchForIdleState.utils';

const logger = logManager.getLogger('IdleStateWatcher');

let interval: NodeJS.Timeout | null = null;

export function watchForIdleState(idleAfterSeconds: number) {
    logger.debug('Watching for idle state');
    interval = setInterval(() => checkIdleState(idleAfterSeconds), IDLE_STATE_CHECK_INTERVAL);
}

export function watchForIdleStateRemove() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}
