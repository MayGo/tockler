import { appEmitter } from '../utils/appEmitter';
import {
    ACTIVE_WINDOW_CHECK_INTERVAL,
    areEqualActiveWindow,
    normalizedActiveWindow,
    NormalizedActiveWindow,
} from './watchForActiveWindow.utils';

let interval: NodeJS.Timeout | null = null;

let lastActiveWindow: NormalizedActiveWindow | null = null;

async function checkActiveWindow() {
    const activeWindow = await normalizedActiveWindow();

    const windowChanged = lastActiveWindow && !areEqualActiveWindow(lastActiveWindow, activeWindow);

    if (windowChanged) {
        appEmitter.emit('active-window-changed', activeWindow);
    }

    lastActiveWindow = activeWindow;
}

export async function watchForActiveWindow(backgroundJobInterval: number) {
    const timeInSeconds = backgroundJobInterval || ACTIVE_WINDOW_CHECK_INTERVAL;
    const timeInMs = timeInSeconds * 1000;

    interval = setInterval(() => checkActiveWindow(), timeInMs);
}

export function watchForActiveWindowRemove() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}
