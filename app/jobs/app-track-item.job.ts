
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import TaskAnalyser from '../task-analyser';
var logger = logManager.getLogger('AppTrackItemJob');

import * as moment from 'moment';
import { TrackItemType } from "../track-item-type.enum";
import { backgroundService } from '../background.service';
import BackgroundUtils from "../background.utils";

import * as activeWin from 'active-win';

let shouldSplitLogItemFromDate = null;

export class AppTrackItemJob {

    run() {
        try {
            this.checkIfIsInCorrectState();
            this.saveForegroundWindowTitle();
        } catch (error) {
            logger.error(error);
        }
    }

    checkIfIsInCorrectState(): void {

    }

    saveForegroundWindowTitle() {

        activeWin().then(result => {

            /*
            {
                title: 'npm install',
                id: 54,
                app: 'Terminal',
                pid: 368
            }
            */
            let active: any = {};
            // logger.info(result);

            active.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
            active.endDate = new Date();
            active.app = result.app;
            active.title = result.title.replace(/\n$/, "").replace(/^\s/, "");

            logger.debug("Foreground window (parsed):", active);

            this.saveActiveWindow(active);
        });
    }

    saveActiveWindow(newAppTrackItem) {
        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveActiveWindow');
            return 'SLEEPING'; //TODO: throw exception
        }

        if (stateManager.isSystemIdling()) {
            logger.debug('Not saving, app is idling', newAppTrackItem);
            stateManager.resetAppTrackItem();
            return 'IDLING'; //TODO: throw exception
        }

        if (!newAppTrackItem.title && !newAppTrackItem.app) {
            // Lock screen have no title, maybe something
            newAppTrackItem.app = 'NATIVE';
            newAppTrackItem.taskName = 'AppTrackItem';
            newAppTrackItem.title = 'NO_TITLE';
        } else {
            newAppTrackItem.taskName = 'AppTrackItem';
        }

        backgroundService.createOrUpdate(newAppTrackItem);
    }

}

export const appTrackItemJob = new AppTrackItemJob();
