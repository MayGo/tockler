import { State } from '../../enums/state';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';

const logger = logManager.getLogger('watchAndPropagateState');

let currentState: State = State.Online;

function setCurrentState(state: State) {
    if (currentState === state) {
        return;
    }

    // Cannot go from OFFLINE to IDLE
    if (currentState === State.Offline && state === State.Idle) {
        logger.error('Cannot go from OFFLINE to IDLE');
        return;
    }

    currentState = state;
    appEmitter.emit('state-changed', currentState);
}

export function getCurrentState() {
    return currentState;
}

export function watchAndPropagateState() {
    appEmitter.on('system-is-idling', () => {
        logger.debug('System is idling');
        setCurrentState(State.Idle);
    });

    appEmitter.on('system-is-engaged', () => {
        // logger.debug('System is engaged');
        setCurrentState(State.Online);
    });

    appEmitter.on('system-is-sleeping', () => {
        logger.debug('System is sleeping');
        setCurrentState(State.Offline);
    });

    appEmitter.on('system-is-resuming', () => {
        logger.debug('System is resuming');
        setCurrentState(State.Online);
    });
}

export function watchAndPropagateStateCleanup() {
    appEmitter.removeAllListeners('system-is-idling');
    appEmitter.removeAllListeners('system-is-engaged');
    appEmitter.removeAllListeners('system-is-sleeping');
    appEmitter.removeAllListeners('system-is-resuming');
}
