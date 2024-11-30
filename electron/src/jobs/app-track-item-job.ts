import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import BackgroundUtils from '../background-utils';
import activeWin from 'active-win';
import { backgroundService } from '../background-service';
import { TrackItemType } from '../enums/track-item-type';
import { taskAnalyser, TrackItemRaw } from '../task-analyser';
import { TrackItem } from '../models/TrackItem';
import activeWindow from 'active-win';

let logger = logManager.getLogger('AppTrackItemJob');

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

export class AppTrackItemJob {
    lastUpdatedItem: TrackItem | null = null;
    errorDialogIsOpen = false;

    async run() {
        if (this.errorDialogIsOpen) {
            logger.debug('Not running appTrackItemJob. Error dialog is open.');
            return false;
        }

        try {
            if (this.checkIfIsInCorrectState()) {
                let activeWindow = await activeWin();
                let updatedItem: TrackItem = await this.saveActiveWindow(activeWindow ?? errorWindowItem);

                if (!BackgroundUtils.isSameItems(updatedItem as TrackItemRaw, this.lastUpdatedItem as TrackItemRaw)) {
                    logger.debug('App and title changed. Analysing title');
                    taskAnalyser.analyseAndNotify(updatedItem as TrackItemRaw).then(
                        () => logger.debug('Analysing has run.'),
                        (e) => logger.error('Error in Analysing', e),
                    );
                }

                this.lastUpdatedItem = updatedItem;
            } else {
                logger.debug('App not in correct state');
                return false;
            }

            return true;
        } catch (error: any) {
            logger.error(`Error in AppTrackItemJob: ${error.toString()}`, error);
            let updatedItem: TrackItem = await this.saveActiveWindow({ ...errorWindowItem, title: error.toString() });
            this.lastUpdatedItem = updatedItem;
        }

        return false;
    }

    checkIfIsInCorrectState() {
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

    async saveActiveWindow(result: activeWindow.Result): Promise<TrackItem> {
        let rawItem: any = { taskName: TrackItemType.AppTrackItem };

        rawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
        rawItem.endDate = new Date();

        // logger.debug('rawitem has no app', result);
        if (result.owner && result.owner.name) {
            rawItem.app = result.owner.name;
        } else {
            rawItem.app = 'NATIVE';
        }

        if (!result.title) {
            // logger.error('rawitem has no title', result);
            rawItem.title = 'NO_TITLE';
        } else {
            rawItem.title = result.title.replace(/\n$/, '').replace(/^\s/, '');
        }

        // logger.debug('Active window (parsed):', rawItem);

        let savedItem = await backgroundService.createOrUpdate(rawItem);
        return savedItem as TrackItem;
    }
}

export const appTrackItemJob = new AppTrackItemJob();
