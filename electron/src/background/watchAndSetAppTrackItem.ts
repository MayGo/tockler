import { appSettingService } from '../drizzle/queries/app-setting-service';
import { insertTrackItem } from '../drizzle/queries/trackItem.db';
import { NewTrackItem, TrackItem } from '../drizzle/schema';
import { State } from '../enums/state';
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
        await insertTrackItem(currentAppItem);
    }

    currentAppItem = {
        taskName: TrackItemType.AppTrackItem,
        app: activeWindow.app,
        title: activeWindow.title,
        beginDate: now,
        endDate: now,
    };
}

export async function getOngoingAppTrackItem() {
    const color = await appSettingService.getAppColor(currentAppItem?.app || '');
    return { ...currentAppItem, endDate: Date.now(), id: 0, color } as TrackItem;
}

const saveOngoingTrackItem = async () => {
    if (currentAppItem) {
        await insertTrackItem(currentAppItem);
    }
};

function addStateListener() {
    logger.info('Add active-window-listener');
    appEmitter.on('active-window-changed', (activeWindow) => {
        setAppTrackItem(activeWindow);
    });
}

async function removeStateListener() {
    logger.info('Remove active-window-listener');
    appEmitter.removeAllListeners('active-window-changed');
    await saveOngoingTrackItem();
    currentAppItem = null;
}

export function watchAndSetAppTrackItem() {
    addStateListener();
    appEmitter.on('state-changed', async (state: State) => {
        logger.debug('State changed: active-window-listener', state);

        if (state === State.Online) {
            addStateListener();
        } else {
            await removeStateListener();
        }
    });
}

export async function watchAndSetAppTrackItemRemove() {
    await removeStateListener();
}
