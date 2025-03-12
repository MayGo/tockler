import { powerMonitor } from 'electron';
import { State } from '../enums/state';
import { appEmitter } from '../utils/appEmitter';
import { logManager } from '../utils/log-manager';

const logger = logManager.getLogger('IdleStateWatcher');

const checkIdleState = async (idleAfterSeconds: number) => {
    try {
        const seconds = powerMonitor.getSystemIdleTime();
        const state: State = seconds > idleAfterSeconds ? State.Idle : State.Online;

        if (state === State.Idle) {
            appEmitter.emit('system-is-idling');
        } else {
            appEmitter.emit('system-is-engaged');
        }
    } catch (error: any) {
        logger.error(`Error checking idle state: ${error.toString()}`, error);
    }
};

let interval: NodeJS.Timeout | null = null;

const IDLE_STATE_CHECK_INTERVAL = 5000;

export function startIdleStateWatcher(idleAfterSeconds: number) {
    interval = setInterval(() => checkIdleState(idleAfterSeconds), IDLE_STATE_CHECK_INTERVAL);
}

export function stopIdleStateWatcher() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}
