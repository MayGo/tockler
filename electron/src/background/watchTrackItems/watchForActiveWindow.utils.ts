import activeWin from 'active-win';
import { logManager } from '../../utils/log-manager';

const logger = logManager.getLogger('checkActiveWindow');

export const ACTIVE_WINDOW_CHECK_INTERVAL = 3;

const errorWindowItem: activeWin.Result = {
    platform: 'macos',
    title: 'Active Window undefined',
    owner: {
        name: 'PERMISSION_ERROR',
        processId: 0,
        path: '',
        bundleId: '',
    },
    id: 0,
    bounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
    memoryUsage: 0,
};

export interface NormalizedActiveWindow {
    app: string;
    title: string;
    url?: string;
}

const DEFAULT_TITLE = 'NO_TITLE';
const DEFAULT_APP = 'NATIVE';

export function normalizeActiveWindow(activeWindow: activeWin.Result) {
    let item: NormalizedActiveWindow = {
        app: DEFAULT_APP,
        title: DEFAULT_TITLE,
    };

    if (activeWindow.owner && activeWindow.owner.name) {
        item.app = activeWindow.owner.name;
    }

    if (activeWindow.title) {
        item.title = activeWindow.title.replace(/\n$/, '').replace(/^\s/, '');
    }

    if (activeWindow.platform === 'macos' && activeWindow.url) {
        item.url = activeWindow.url;
    }

    return item;
}

async function getActiveWindow() {
    try {
        let activeWindow = await activeWin();
        if (!activeWindow) {
            logger.debug('No active window found');
            activeWindow = errorWindowItem;
        }
        return activeWindow;
    } catch (error: any) {
        logger.error('Error checking active window', error);
        return errorWindowItem;
    }
}

export async function normalizedActiveWindow() {
    const activeWindow = await getActiveWindow();
    return normalizeActiveWindow(activeWindow);
}

export function areEqualActiveWindow(item1: NormalizedActiveWindow, item2: NormalizedActiveWindow) {
    if (item1.title === item2.title && item1.app === item2.app) {
        return true;
    }

    return false;
}
