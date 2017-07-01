import { TrackItemInstance, TrackItemAttributes } from './models/interfaces/track-item-interface';
import { State } from './state.enum';
import { TrackItemType } from './track-item-type.enum';

import { app, ipcMain } from "electron";
import * as path from 'path';
import BackgroundUtils from "./background.utils";
import { trackItemService } from "./services/track-item-service";

import { logManager } from "./log-manager";
import { settingsService } from "./services/settings-service";
var logger = logManager.getLogger('StateManager');

interface TrackItems {
    StatusTrackItem: TrackItemInstance;
    AppTrackItem: TrackItemInstance;
    LogTrackItem: TrackItemInstance;
}

export class StateManager {

    private isSleeping = false;

    private logTrackItemMarkedAsRunning: TrackItemInstance = null;

    lastTrackItems: TrackItems = {
        StatusTrackItem: null,
        AppTrackItem: null,
        LogTrackItem: null
    };

    constructor() {
        this.initIpc();
    }

    initIpc() {
        ipcMain.on('start-new-log-item', (event, rawItem: TrackItemAttributes) => {
            logger.info('start-new-log-item', rawItem);
            this.createNewRunningTrackItem(rawItem)
                .then((item: TrackItemInstance) => {
                    logger.info('log-item-started', item.toJSON());
                    this.setLogTrackItemMarkedAsRunning(item);
                    event.sender.send('log-item-started', item.toJSON());
                });
        });

        ipcMain.on('end-running-log-item', (event) => {
            logger.info('end-running-log-item');
            this.stopRunningLogTrackItem();
        });
    }

    async restoreState() {
        logger.info("Restoring state.");
        let logItem = await trackItemService.findRunningLogItem();
        this.logTrackItemMarkedAsRunning = logItem;
        this.setCurrentTrackItem(logItem);

        if (this.logTrackItemMarkedAsRunning) {
            logger.info("Restored running LogTrackItem:", logItem.toJSON());
        }

        return logItem;
    }

    getLogTrackItemMarkedAsRunning() {
        return this.logTrackItemMarkedAsRunning;
    }

    setLogTrackItemMarkedAsRunning(item: TrackItemInstance) {
        settingsService.saveRunningLogItemReference(item.id);
        logger.info("Mark new LogTrackItem as running:", item.toJSON());
        this.logTrackItemMarkedAsRunning = item;
    }

    async stopRunningLogTrackItem() {
        let item = await this.updateRunningTrackItemEndDate(TrackItemType.LogTrackItem);
        this.resetLogTrackItem();
        settingsService.saveRunningLogItemReference(null);
    }


    setCurrentTrackItem(item: TrackItemInstance) {
        this.lastTrackItems[item.taskName] = item;
    }

    getCurrentTrackItem(type: TrackItemType): TrackItemInstance {
        return this.lastTrackItems[type];
    }

    hasSameRunningTrackItem(rawItem: TrackItemAttributes): boolean {
        return BackgroundUtils.isSameItems(rawItem, this.getCurrentTrackItem(rawItem.taskName));
    }

    resetCurrentTrackItem(type: TrackItemType) {
        this.lastTrackItems[type] = null;
    }

    resetStatusTrackItem() {
        this.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
    }

    resetLogTrackItem() {
        this.resetCurrentTrackItem(TrackItemType.LogTrackItem);
    }

    resetAppTrackItem() {
        this.resetCurrentTrackItem(TrackItemType.AppTrackItem);
    }

    isSystemIdling() {
        let item = this.getCurrentTrackItem(TrackItemType.StatusTrackItem);
        return item !== null && item.app === State.Idle;
    }

    isSystemOffline() {
        let item = this.getCurrentTrackItem(TrackItemType.StatusTrackItem);
        return item !== null && item.app === State.Offline;
    }

    isSystemOnline() {
        let item = this.getCurrentTrackItem(TrackItemType.StatusTrackItem);
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
        let runningItem = this.getCurrentTrackItem(rawItem.taskName);

        if (runningItem) {
            runningItem.endDate = rawItem.beginDate;
            logger.info("Ending trackItem:", runningItem.toJSON());
            await trackItemService.updateItem(runningItem, runningItem.id);
            this.resetCurrentTrackItem(rawItem.taskName);
        }

        return runningItem;
    }

    async createNewRunningTrackItem(rawItem: TrackItemAttributes) {
        this.endRunningTrackItem(rawItem);

        let item = await trackItemService.createTrackItem(rawItem);
        logger.debug("Created track item to DB and set running item:", item.toJSON());

        this.setCurrentTrackItem(item);
        return item;
    }

    async updateRunningTrackItemEndDate(type: TrackItemType) {
        let runningItem = this.getCurrentTrackItem(type);
        runningItem.endDate = new Date();
        await trackItemService.updateItem(runningItem, runningItem.id);
        logger.info("Saved track item(endDate change) to DB:", runningItem.toJSON());
        return runningItem;
    }

}

export const stateManager = new StateManager();