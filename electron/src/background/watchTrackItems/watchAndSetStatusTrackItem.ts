import { dbClient } from '../../drizzle/dbClient';
import { NewTrackItem, TrackItem } from '../../drizzle/schema';
import { State } from '../../enums/state';
import { TrackItemType } from '../../enums/track-item-type';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';

const logger = logManager.getLogger('watchAndSetStatusTrackItem');

let currentStatusItem: NewTrackItem | null = null;

function makeStatusItem(state: State) {
    const now = Date.now();

    return {
        taskName: TrackItemType.StatusTrackItem,
        app: state,
        title: state.toString().toLowerCase(),
        beginDate: now,
        endDate: now,
    };
}

export function watchAndSetStatusTrackItem() {
    currentStatusItem = makeStatusItem(State.Online);
    appEmitter.on('state-changed', async (state: State) => {
        logger.debug('State changed', state);

        const now = Date.now();

        // If we have a current item, update its end date and persist
        if (currentStatusItem) {
            currentStatusItem.endDate = now;
            await dbClient.insertTrackItemInternal(currentStatusItem);
        }

        // Create new current item
        currentStatusItem = makeStatusItem(state);
    });
}

export async function getOngoingStatusTrackItem() {
    if (!currentStatusItem) {
        return null;
    }

    const color = await dbClient.getAppColor(currentStatusItem?.app || '');
    return { ...currentStatusItem, endDate: Date.now(), color } as TrackItem;
}

const saveOngoingTrackItem = async () => {
    if (currentStatusItem) {
        currentStatusItem.endDate = Date.now();
        await dbClient.insertTrackItemInternal(currentStatusItem);
        currentStatusItem = null;
    }
};

export async function watchAndSetStatusTrackItemCleanup() {
    appEmitter.removeAllListeners('state-changed');
    await saveOngoingTrackItem();
}
