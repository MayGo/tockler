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

    private isSleeping = false;

    lastTrackItems: TrackItems = {
        StatusTrackItem: null,
        AppTrackItem: null,
        LogTrackItem: null
    };

    constructor() {
    }

    setRunningTrackItem(item: TrackItemInstance) {
        this.lastTrackItems[item.taskName] = item;
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

    resetLogTrackItem() {
        this.resetRunningTrackItem(TrackItemType.LogTrackItem);
    }

    resetAppTrackItem() {
        this.resetRunningTrackItem(TrackItemType.AppTrackItem);
    }

    isSystemIdling() {
        let item = this.getRunningTrackItem(TrackItemType.StatusTrackItem);
        return item !== null && item.app === State.Idle;
    }

    isSystemOffline() {
        let item = this.getRunningTrackItem(TrackItemType.StatusTrackItem);
        return item !== null && item.app === State.Offline;
    }

    isSystemOnline() {
        let item = this.getRunningTrackItem(TrackItemType.StatusTrackItem);
        return item !== null && item.app === State.Online;
    }

    isSystemSleeping() {
        return this.isSleeping;
    }

    setSystemToSleep() {
        this.isSleeping = true;
        logger.info("System is going to sleep state.");
        this.resetAppTrackItem();
    }

    setAwakeFromSleep() {
        this.isSleeping = false;
        logger.info("System is awakeing from sleep state.");
    }



    async endRunningTrackItem(rawItem: TrackItemAttributes) {
        let runningItem = this.getRunningTrackItem(rawItem.taskName);

        if (runningItem) {
            runningItem.endDate = rawItem.beginDate;
            logger.info("Ending trackItem:", runningItem.toJSON());
            await trackItemService.updateItem(runningItem, runningItem.id);
            this.resetRunningTrackItem(rawItem.taskName);
        }

        return runningItem;
    }

    async createNewRunningTrackItem(rawItem: TrackItemAttributes) {
        this.endRunningTrackItem(rawItem);

        let item = await trackItemService.createTrackItem(rawItem);
        logger.debug("Created track item to DB and set running item:", item.toJSON());

        this.setRunningTrackItem(item);
        return item;
    }

    async updateRunningTrackItemEndDate(type: TrackItemType) {
        let runningItem = this.getRunningTrackItem(type);
        runningItem.endDate = new Date();
        await trackItemService.updateItem(runningItem, runningItem.id);
        logger.info("Saved track item(endDate change) to DB:", runningItem.toJSON());
        return runningItem;
    }

}

export const stateManager = new StateManager();