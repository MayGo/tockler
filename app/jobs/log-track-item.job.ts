
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import TaskAnalyser from '../task-analyser';
var logger = logManager.getLogger('LogTrackItemJob');

import * as moment from 'moment';
import { TrackItemType } from "../track-item-type.enum";
import { backgroundService } from '../background.service';
import BackgroundUtils from "../background.utils";
import { TrackItemInstance } from "../models/interfaces/track-item-interface";
import { trackItemService } from "../services/track-item-service";
import { settingsService } from "../services/settings-service";

export class LogTrackItemJob {

    onlineItemWhenLastSplit: TrackItemInstance = null;

    run() {
        try {
            this.checkIfIsInCorrectState();
            this.updateRunningLogItem();
        } catch (error) {
            logger.error(error.message);
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
        this.onlineItemWhenLastSplit = stateManager.getCurrentStatusTrackItem();

        let logItemMarkedAsRunning = stateManager.getLogTrackItemMarkedAsRunning();
        if (!logItemMarkedAsRunning) {
            logger.debug("RUNNING_LOG_ITEM not found.");
            return null;
        }

        let rawItem: any = BackgroundUtils.getRawTrackItem(logItemMarkedAsRunning);
        rawItem.endDate = Date.now();

        let shouldTrySplitting = oldOnlineItem != this.onlineItemWhenLastSplit;

        if (shouldTrySplitting) {
            let splitEndDate: Date = await this.getTaskSplitDate();
            if (splitEndDate) {
                logger.info("Splitting LogItem, new item has endDate: ", splitEndDate);

                if (logItemMarkedAsRunning.beginDate > splitEndDate) {
                    logger.error("BeginDate is after endDate. Not saving RUNNING_LOG_ITEM");
                    return;
                }

                stateManager.endRunningTrackItem({ endDate: splitEndDate, taskName: TrackItemType.LogTrackItem });

                rawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
            }
        }

        let savedItem = await backgroundService.createOrUpdate(rawItem);
        // at midnight track item is split and new items ID should be RUNNING_LOG_ITEM
        if (savedItem.id !== logItemMarkedAsRunning.id) {
            logger.info('RUNNING_LOG_ITEM changed.');
            stateManager.setLogTrackItemMarkedAsRunning(savedItem);
        }
        return savedItem;


    }

    async getTaskSplitDate() {
        let onlineItems = await trackItemService.findLastOnlineItem();
        if (onlineItems && onlineItems.length > 0) {
            let settings = await settingsService.fetchWorkSettings();

            let onlineItem: any = onlineItems[0];
            var minutesAfterToSplit = settings.splitTaskAfterIdlingForMinutes || 3;
            var minutesFromNow = moment().diff(onlineItem.endDate, 'minutes');

            console.log(`Minutes from now:  ${minutesFromNow}, minutesAfterToSplit: ${minutesAfterToSplit}`);

            if (minutesFromNow >= minutesAfterToSplit) {
                let endDate = moment(onlineItem.endDate).add(minutesAfterToSplit, 'minutes').toDate();
                return endDate;
            }
        }

        return null;
    }
}

export const logTrackItemJob = new LogTrackItemJob();
