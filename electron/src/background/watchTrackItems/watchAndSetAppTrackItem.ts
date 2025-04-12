import { dbClient } from '../../drizzle/dbClient';
import { NewTrackItem, TrackItem } from '../../drizzle/schema';
import { State } from '../../enums/state';
import { TrackItemType } from '../../enums/track-item-type';

import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import { startActiveWindowWatcher } from './watchForActiveWindow';
import { NormalizedActiveWindow } from './watchForActiveWindow.utils';

const logger = logManager.getLogger('watchAndSetAppTrackItem');

let currentAppItem: NewTrackItem | null = null;

async function setAppTrackItem(activeWindow: NormalizedActiveWindow) {
    logger.debug('App changed', activeWindow);

    const now = Date.now();

    // If we have a current item, update its end date and persist
    if (currentAppItem) {
        currentAppItem.endDate = now;
        await dbClient.insertTrackItemInternal(currentAppItem);
    }

    currentAppItem = {
        taskName: TrackItemType.AppTrackItem,
        app: activeWindow.app,
        title: activeWindow.title,
        url: activeWindow.url,
        beginDate: now,
        endDate: now,
    };
}

export async function getOngoingAppTrackItem() {
    if (!currentAppItem) {
        return null;
    }

    const color = await dbClient.getAppColor(currentAppItem?.app || '');
    return { ...currentAppItem, endDate: Date.now(), id: 0, color } as TrackItem;
}

const saveOngoingTrackItem = async () => {
    logger.debug('Save ongoing track item');
    if (currentAppItem) {
        currentAppItem.endDate = Date.now();
        await dbClient.insertTrackItemInternal(currentAppItem);
        currentAppItem = null;
    } else {
        logger.debug('No ongoing track item to save');
    }
};

// This is only exported for testing purposes
export function addActiveWindowWatch() {
    logger.info('Add active-window-listener');
    appEmitter.on('active-window-changed', (activeWindow) => {
        setAppTrackItem(activeWindow);
    });
}

async function removeActiveWindowWatch() {
    logger.info('Remove active-window-listener');
    appEmitter.removeAllListeners('active-window-changed');
    await saveOngoingTrackItem();
}

let removeActiveWindowWatcher: () => void;

export function watchAndSetAppTrackItem(backgroundJobInterval: number) {
    logger.debug('Watch and set app track item.........');
    addActiveWindowWatch();

    removeActiveWindowWatcher = startActiveWindowWatcher(backgroundJobInterval);

    appEmitter.on('state-changed', async (state: State) => {
        logger.debug('State changed: active-window-listener', state);

        if (state === State.Online) {
            logger.debug('Start active window watcher');
            if (removeActiveWindowWatcher) {
                logger.warn('ERROR:Stopping previous active window watcher. Should not happen.');
                removeActiveWindowWatcher(); // stop previous watcher, it should be stopped already, but just in case
            }
            removeActiveWindowWatcher = startActiveWindowWatcher(backgroundJobInterval);
        } else {
            removeActiveWindowWatcher?.();
            await saveOngoingTrackItem();
        }
    });
}

export async function watchAndSetAppTrackItemCleanup() {
    await removeActiveWindowWatch();
    removeActiveWindowWatcher?.();
}
