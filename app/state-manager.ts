import { TrackItemInstance, TrackItemAttributes } from './models/interfaces/track-item-interface';
import { State } from './state.enum';
import { TrackItemType } from './track-item-type.enum';

import { app } from 'electron';
import * as path from 'path';
import BackgroundUtils from "./background.utils";
import { trackItemService } from "./services/track-item-service";

import { logManager } from "./log-manager";
var logger = logManager.getLogger('StateManager');

interface TrackItems {
    StatusTrackItem: TrackItemInstance;
    AppTrackItem: TrackItemInstance;
    LogTrackItem: TrackItemInstance;
}

export class StateManager {

    lastTrackItems: TrackItems = {
        StatusTrackItem: null,
        AppTrackItem: null,
        LogTrackItem: null
    };

    constructor() {
    }

    setRunningTrackItem(item: TrackItemInstance) {
        this.lastTrackItems[item.taskName] = item;
        console.log(item.taskName);
        console.log(this.lastTrackItems[item.taskName]);
    }

    getRunningTrackItem(type: TrackItemType): TrackItemInstance {
        
        return this.lastTrackItems[type];
    }

    hasSameRunningTrackItem(rawItem: TrackItemAttributes): boolean {
        return BackgroundUtils.isSameItems(rawItem, this.getRunningTrackItem(rawItem.taskName));
    }

    resetRunningTrackItem(type: TrackItemType) {
        this.lastTrackItems[type] = null;
    }

    resetStatusTrackItem() {
        this.resetRunningTrackItem(TrackItemType.StatusTrackItem);
    }

    async endRunningTrackItem(rawItem: TrackItemAttributes) {
        let runningItem = this.getRunningTrackItem(rawItem.taskName);

        if (runningItem) {
            runningItem.endDate = runningItem.beginDate;
            logger.debug("Saving old trackItem:", runningItem);
            await trackItemService.updateItem(runningItem);
            this.resetRunningTrackItem(rawItem.taskName);
        }

        return true;
    }

    async createNewRunningTrackItem(rawItem: TrackItemAttributes) {
        this.endRunningTrackItem(rawItem);

        let item = await trackItemService.createItem(rawItem);
        logger.debug("Created track item to DB and set running item:", item);

        this.setRunningTrackItem(item);
        return item;
    }



    async updateRunningTrackItemEndDate(type: TrackItemType) {
        let runningItem = this.getRunningTrackItem(type);
        runningItem.endDate = new Date();
        await trackItemService.updateItem(runningItem);
        logger.debug("Saved track item(endDate change) to DB:", runningItem);
        return runningItem;
    }

}

export const stateManager = new StateManager();