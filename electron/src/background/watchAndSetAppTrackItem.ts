import { db } from '../drizzle/db';
import { NewTrackItem, trackItems } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { appEmitter } from '../utils/appEmitter';
import { logManager } from '../utils/log-manager';
import { NormalizedActiveWindow } from './watchForActiveWindow.utils';

const logger = logManager.getLogger('watchAndSetStatusTrackItem');

let currentAppItem: NewTrackItem | null = null;

async function setAppTrackItem(activeWindow: NormalizedActiveWindow) {
    logger.debug('App changed', activeWindow);

    const now = Date.now();

    // If we have a current item, update its end date and persist
    if (currentAppItem) {
        currentAppItem.endDate = now;
        await db.insert(trackItems).values(currentAppItem).execute();
    }

    currentAppItem = {
        taskName: TrackItemType.AppTrackItem,
        app: activeWindow.app,
        title: activeWindow.title,
        beginDate: now,
        endDate: now,
    };
}

export function watchAndSetAppTrackItem() {
    appEmitter.on('active-window-changed', (activeWindow) => {
        setAppTrackItem(activeWindow);
    });
}

export function watchAndSetAppTrackItemRemove() {
    appEmitter.removeAllListeners('active-window-changed');
    currentAppItem = null;
}
