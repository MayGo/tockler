
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import TaskAnalyser from '../task-analyser';
var logger = logManager.getLogger('LogTrackItemJob');

import * as moment from 'moment';
import { TrackItemType } from "../track-item-type.enum";
import { backgroundService } from '../background.service';
import BackgroundUtils from "../background.utils";
import { TrackItemInstance } from "../models/interfaces/track-item-interface";

let shouldSplitLogItemFromDate = null;



export class LogTrackItemJob {

    onlineItemWhenLastSplit: TrackItemInstance = null;

    run() {
        try {
            this.checkIfIsInCorrectState();
            this.updateRunningLogItem();
        } catch (error) {
            logger.error(error);
        }
    }

    checkIfIsInCorrectState(): void {
        // saveRunningLogItem can be run before app comes back ONLINE and running log item have to be split.
        if (!stateManager.isSystemOnline()) {
            throw new Error('Not online');
        }

        if (stateManager.isSystemSleeping()) {
            throw new Error('Computer is sleeping');
        }

    }

    async updateRunningLogItem() {

        let oldOnlineItem = this.onlineItemWhenLastSplit;
        this.onlineItemWhenLastSplit = stateManager.getRunningTrackItem(TrackItemType.StatusTrackItem);

        let logItemMarkedAsRunning = stateManager.getLogTrackItemMarkedAsRunning();
        if (!logItemMarkedAsRunning) {
            logger.debug("RUNNING_LOG_ITEM not found.");
            return null;
        }

        let splitEndDate: Date = await TaskAnalyser.getTaskSplitDate();

        let shouldSplit = oldOnlineItem != this.onlineItemWhenLastSplit;

        if (splitEndDate && shouldSplit) {
     
            logger.info("Splitting LogItem, new item has endDate: ", splitEndDate);

            if (logItemMarkedAsRunning.beginDate > splitEndDate) {
                logger.error("BeginDate is after endDate. Not saving RUNNING_LOG_ITEM");
                return;
            }

            stateManager.endRunningTrackItem({ endDate: splitEndDate, taskName: TrackItemType.LogTrackItem });

            let newRawItem = BackgroundUtils.getRawTrackItem(logItemMarkedAsRunning);

            newRawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
            newRawItem.endDate = Date.now();
            let newSavedItem = await backgroundService.createOrUpdate(newRawItem);

            stateManager.setLogTrackItemMarkedAsRunning(newSavedItem);
            return newSavedItem;
        } else {
            let rawItem: any = BackgroundUtils.getRawTrackItem(logItemMarkedAsRunning);

            rawItem.endDate = Date.now();
            let savedItem = await backgroundService.createOrUpdate(rawItem);
            // at midnight track item is split and new items ID should be RUNNING_LOG_ITEM
            if (savedItem.id !== logItemMarkedAsRunning.id) {
                logger.info('RUNNING_LOG_ITEM changed at midnight.');
                stateManager.setLogTrackItemMarkedAsRunning(savedItem);
            }
            return savedItem;
        }

    }
}

export const logTrackItemJob = new LogTrackItemJob();
