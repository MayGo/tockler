import { checkIdleState, IDLE_STATE_CHECK_INTERVAL } from './watchForIdleState.utils';

let interval: NodeJS.Timeout | null = null;

export function watchForIdleState(idleAfterSeconds: number) {
    interval = setInterval(() => checkIdleState(idleAfterSeconds), IDLE_STATE_CHECK_INTERVAL);
}

export function watchForIdleStateRemove() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}
