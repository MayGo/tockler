import activeWin from 'active-win';
import { taskAnalyser, TrackItemRaw } from '../app/task-analyser';
import { TrackItemType } from '../enums/track-item-type';
import { logManager } from '../utils/log-manager';
import { backgroundService } from './background-service';
import BackgroundUtils from './background-utils';
import { stateManager } from './state-manager';

import activeWindow from 'active-win';
import { TrackItem } from '../drizzle/schema';

const logger = logManager.getLogger('AppTrackItemJob');

const errorWindowItem: activeWindow.Result = {
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

let lastUpdatedItem: TrackItem | null = null;
let errorDialogIsOpen = false;

export async function appTrackItemJobRun() {
    if (errorDialogIsOpen) {
        logger.debug('Not running appTrackItemJob. Error dialog is open.');
        return false;
    }

    try {
        if (checkIfIsInCorrectState()) {
            let activeWindow = await activeWin();
            let updatedItem: TrackItem = await saveActiveWindow(activeWindow ?? errorWindowItem);

            if (lastUpdatedItem && updatedItem) {
                if (
                    !BackgroundUtils.isSameItems(
                        BackgroundUtils.getRawTrackItem(updatedItem),
                        BackgroundUtils.getRawTrackItem(lastUpdatedItem),
                    )
                ) {
                    logger.debug('App and title changed. Analysing title');
                    taskAnalyser.analyseAndNotify(BackgroundUtils.getRawTrackItem(updatedItem)).then(
                        () => logger.debug('Analysing has run.'),
                        (e) => logger.error('Error in Analysing', e),
                    );
                }
            }

            lastUpdatedItem = updatedItem;
        } else {
            logger.debug('App not in correct state');
            return false;
        }

        return true;
    } catch (error: any) {
        logger.error(`Error in AppTrackItemJob: ${error.toString()}`, error);
        let updatedItem: TrackItem = await saveActiveWindow({ ...errorWindowItem, title: error.toString() });
        lastUpdatedItem = updatedItem;
    }

    return false;
}

function checkIfIsInCorrectState() {
    if (stateManager.isSystemSleeping()) {
        stateManager.resetAppTrackItem();
        logger.debug('System is sleeping.');
        return false;
    }

    if (stateManager.isSystemIdling()) {
        stateManager.resetAppTrackItem();
        logger.debug('App is idling.');
        return false;
    }
    return true;
}

async function saveActiveWindow(result: activeWindow.Result): Promise<TrackItem> {
    let rawItem: Partial<TrackItemRaw> = { taskName: TrackItemType.AppTrackItem };

    rawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
    rawItem.endDate = Date.now();

    if (result.owner && result.owner.name) {
        rawItem.app = result.owner.name;
    } else {
        rawItem.app = 'NATIVE';
    }

    if (!result.title) {
        rawItem.title = 'NO_TITLE';
    } else {
        rawItem.title = result.title.replace(/\n$/, '').replace(/^\s/, '');
    }

    let savedItem = await backgroundService.createOrUpdate(rawItem);
    return savedItem as TrackItem;
}
