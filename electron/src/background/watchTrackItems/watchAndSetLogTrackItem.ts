import { ipcMain } from 'electron';
import { TrackItemRaw } from '../../app/task-analyser';
import { settingsService } from '../../drizzle/queries/settings-service';
import { insertTrackItem } from '../../drizzle/queries/trackItem.db';
import { NewTrackItem, TrackItem } from '../../drizzle/schema';
import { State } from '../../enums/state';
import { TrackItemType } from '../../enums/track-item-type';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';

const logger = logManager.getLogger('watchAndSetStatusTrackItem');

let currentLogItem: NewTrackItem | null = null;

let lastState: State = State.Online;

const offlineStates = [State.Idle, State.Offline];

async function cutLogTrackItem(state: State) {
    const now = Date.now();
    console.warn(`State changed to ${state}=>${now}`);

    if (!currentLogItem) {
        logger.debug('No log item to cut');
        lastState = state;
        return;
    }

    // we dont want to trigger new cut when state changes from Idle to Offline

    if (lastState === State.Online && offlineStates.includes(state)) {
        // When state changes from Online to Idle or Offline, insert the current log item and create a new one if needed
        const itemToInsert = {
            ...currentLogItem,
            endDate: now,
        };

        await insertTrackItem(itemToInsert);
    } else if (state === State.Online) {
        currentLogItem.beginDate = now;
    }

    lastState = state;
}

async function stopRunningLogTrackItem(endDate: number) {
    logger.debug('stopRunningLogTrackItem');

    if (!currentLogItem) {
        logger.debug('No log item to stop');
        return;
    }

    await settingsService.saveRunningLogItemReference(null);

    // Insert the item with the updated endDate rather than updating it
    const itemToInsert = {
        ...currentLogItem,
        endDate,
    };

    await insertTrackItem(itemToInsert);
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
        beginDate: now,
        endDate: now,
    };

    currentLogItem = newLogItem;

    await settingsService.saveRunningLogItemReference(currentLogItem);
}

export async function getOngoingLogTrackItem() {
    if (!currentLogItem) {
        return null;
    }

    return { ...currentLogItem, endDate: Date.now() } as TrackItem;
}

export async function watchAndSetLogTrackItem() {
    const runningLogItem = await settingsService.getRunningLogItemAsJson();

    if (runningLogItem) {
        currentLogItem = { ...runningLogItem, beginDate: Date.now() };
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
        currentLogItem.endDate = Date.now();
        await insertTrackItem(currentLogItem);
        currentLogItem = null;
    }
};

export async function watchAndSetLogTrackItemCleanup() {
    appEmitter.removeAllListeners('state-changed');
    await saveOngoingTrackItem();
    currentLogItem = null;
}
