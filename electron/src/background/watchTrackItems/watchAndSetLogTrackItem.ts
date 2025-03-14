import { ipcMain } from 'electron';
import { TrackItemRaw } from '../../app/task-analyser';
import { settingsService } from '../../drizzle/queries/settings-service';
import { insertNewLogTrackItem, insertTrackItem, updateTrackItem } from '../../drizzle/queries/trackItem.db';
import { NewTrackItem, TrackItem } from '../../drizzle/schema';
import { State } from '../../enums/state';
import { TrackItemType } from '../../enums/track-item-type';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import { NEW_ITEM_END_DATE_OFFSET } from './watchAndSetLogTrackItem.utils';

const logger = logManager.getLogger('watchAndSetStatusTrackItem');

let currentLogItem: TrackItem | null = null;

async function cutLogTrackItem(state: State) {
    const now = Date.now();
    console.warn(`State changed to ${state}=>${now}`);

    if (!currentLogItem) {
        logger.debug('No log item to cut');
        return;
    }

    // End current log item
    if (state !== State.Online) {
        await updateTrackItem(currentLogItem.id, currentLogItem.app, { endDate: now });
    }

    // For Online state, create a new log item
    if (state === State.Online) {
        // Create new log item with same properties but new begin/end dates
        const newLogItem: NewTrackItem = {
            taskName: TrackItemType.LogTrackItem,
            app: currentLogItem.app,
            title: currentLogItem.title,
            color: currentLogItem.color,
            url: currentLogItem.url,
            beginDate: now,
            endDate: now + NEW_ITEM_END_DATE_OFFSET,
        };

        const id = await insertTrackItem(newLogItem);

        console.warn('New log item created for Online state', id);

        // Update currentLogItem reference to the new item
        currentLogItem = {
            ...(newLogItem as TrackItem),
            id,
        };
    } else {
        // For Idle or Offline states, just update the endDate in the currentLogItem
        // but don't clear the reference - keep it until explicitly stopped
        currentLogItem.endDate = now;

        console.warn('Updated current log item for Idle/Offline state', currentLogItem);
    }
}

async function stopRunningLogTrackItem(endDate: number) {
    logger.debug('stopRunningLogTrackItem');

    if (!currentLogItem || !currentLogItem.id) {
        logger.debug('No log item to stop');
        return;
    }

    await updateTrackItem(currentLogItem.id, currentLogItem.app, { endDate });

    currentLogItem = null;
}

async function createNewRunningLogTrackItem(rawItem: TrackItemRaw) {
    logger.debug('createNewRunningLogTrackItem', rawItem);

    const now = Date.now();

    await stopRunningLogTrackItem(now);

    const newLogItem: NewTrackItem = {
        taskName: TrackItemType.LogTrackItem,
        app: rawItem.app || 'unknown',
        title: rawItem.title || 'unknown',
        color: rawItem.color,
        url: rawItem.url,
        beginDate: now,
        endDate: now,
    };

    const id = await insertNewLogTrackItem(newLogItem);

    logger.debug('New log item created:', id);

    currentLogItem = {
        ...(newLogItem as TrackItem),
        id,
    };

    await settingsService.saveRunningLogItemReference(Number(id));
}

export async function getOngoingLogTrackItem() {
    return { ...currentLogItem, endDate: Date.now() } as TrackItem;
}

export async function watchAndSetLogTrackItem() {
    const runningLogItem = await settingsService.getRunningLogItemAsJson();

    if (runningLogItem) {
        currentLogItem = runningLogItem;
    }

    appEmitter.on('state-changed', async (state) => {
        await cutLogTrackItem(state);
    });

    ipcMain.on('start-new-log-item', async (_, rawItem) => {
        await createNewRunningLogTrackItem(rawItem);
    });

    ipcMain.on('end-running-log-item', async (_event) => {
        await stopRunningLogTrackItem(Date.now());
    });

    appEmitter.on('start-new-log-item2', async (rawItem) => {
        logger.debug('start-new-log-item2 event');
        await createNewRunningLogTrackItem(rawItem);
    });
}

const saveOngoingTrackItem = async () => {
    if (currentLogItem) {
        await updateTrackItem(currentLogItem.id, currentLogItem.app, { endDate: Date.now() });
    }
};

export async function watchAndSetLogTrackItemRemove() {
    appEmitter.removeAllListeners('state-changed');
    await saveOngoingTrackItem();
    currentLogItem = null;
}
