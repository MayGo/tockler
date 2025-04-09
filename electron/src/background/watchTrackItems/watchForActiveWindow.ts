import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import {
    ACTIVE_WINDOW_CHECK_INTERVAL,
    areEqualActiveWindow,
    normalizedActiveWindow,
    NormalizedActiveWindow,
} from './watchForActiveWindow.utils';

const logger = logManager.getLogger('watchForActiveWindow');

let interval: NodeJS.Timeout | null = null;

let lastActiveWindow: NormalizedActiveWindow | null = null;

async function checkActiveWindow() {
    const activeWindow = await normalizedActiveWindow();

    const windowChanged = lastActiveWindow && !areEqualActiveWindow(lastActiveWindow, activeWindow);

    if (!lastActiveWindow || windowChanged) {
        appEmitter.emit('active-window-changed', activeWindow);
    }

    lastActiveWindow = activeWindow;
}

async function watchForActiveWindow(backgroundJobInterval: number) {
    logger.debug('Add checkActiveWindow interval');
    const timeInSeconds = backgroundJobInterval || ACTIVE_WINDOW_CHECK_INTERVAL;
    const timeInMs = timeInSeconds * 1000;

    // check active window immediately
    checkActiveWindow();
    // and then check every backgroundJobInterval (3 seconds)
    interval = setInterval(() => checkActiveWindow(), timeInMs);
}

function watchForActiveWindowRemove() {
    if (interval) {
        logger.debug('Remove checkActiveWindow interval');
        clearInterval(interval);
        interval = null;
    }
    lastActiveWindow = null;
}

export function startActiveWindowWatcher(backgroundJobInterval: number) {
    logger.warn('Start active window watcher');
    watchForActiveWindow(backgroundJobInterval);
    return watchForActiveWindowRemove;
}
