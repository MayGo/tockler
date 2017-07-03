
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
var logger = logManager.getLogger('AppTrackItemJob');

import * as moment from 'moment';
import * as activeWin from 'active-win';
import { TrackItemInstance } from "../models/interfaces/track-item-interface";
import BackgroundUtils from "../background-utils";
import { backgroundService } from "../background-service";
import { TrackItemType } from "../enums/track-item-type";

import { taskAnalyser } from '../task-analyser';
let shouldSplitLogItemFromDate = null;

export class AppTrackItemJob {

    lastUpdatedItem: TrackItemInstance;
    async run() {
        try {
            this.checkIfIsInCorrectState();
            let result = await activeWin();
            let updatedItem: TrackItemInstance = await this.saveActiveWindow(result);

            if (!BackgroundUtils.isSameItems(updatedItem, this.lastUpdatedItem)) {
                logger.debug("App and title changed. Analysing title");
                taskAnalyser.analyseAndNotify(updatedItem);
            }

            this.lastUpdatedItem = updatedItem;
        } catch (error) {
            logger.info(error.message);
        }
    }

    checkIfIsInCorrectState(): void {
        if (stateManager.isSystemSleeping()) {
            throw new Error('System is sleeping.');
        }

        if (stateManager.isSystemIdling()) {
            stateManager.resetAppTrackItem(); // TODO: Check if this is needed
            throw new Error('App is idling.');
        }
    }

    async saveActiveWindow(result): Promise<TrackItemInstance> {

        let rawItem: any = { taskName: TrackItemType.AppTrackItem };

        rawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
        rawItem.endDate = new Date();
        rawItem.app = result.app || 'NATIVE';
        rawItem.title = result.title.replace(/\n$/, "").replace(/^\s/, "") || 'NO_TITLE';

        logger.debug("Active window (parsed):", rawItem);

        let savedItem = await backgroundService.createOrUpdate(rawItem);
        return savedItem;
    }
}

export const appTrackItemJob = new AppTrackItemJob();
