import { db } from '../drizzle/db';
import { NewTrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { appEmitter } from '../utils/appEmitter';
import { logManager } from '../utils/log-manager';

const logger = logManager.getLogger('watchAndSetStatusTrackItem');

let currentStatusItem: NewTrackItem | null = null;

export function watchAndSetStatusTrackItem() {
    appEmitter.on('state-changed', async (state: State) => {
        logger.debug('State changed', state);

        const now = Date.now();

        // If we have a current item, update its end date and persist
        if (currentStatusItem) {
            currentStatusItem.endDate = now;
            await db.insert(trackItems).values(currentStatusItem).execute();
        }

        // Create new current item
        currentStatusItem = {
            taskName: TrackItemType.StatusTrackItem,
            app: state,
            title: state.toString().toLowerCase(),
            beginDate: now,
            endDate: now,
        };
    });
}

export function watchAndSetStatusTrackItemRemove() {
    appEmitter.removeAllListeners('state-changed');
    currentStatusItem = null;
}
