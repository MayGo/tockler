import { State } from './enums/state';
import { TrackItemType } from './enums/track-item-type';
import { ipcMain } from 'electron';
import BackgroundUtils from './background-utils';
import { trackItemService } from './services/track-item-service';
import { logManager } from './log-manager';
import { settingsService } from './services/settings-service';
import { appEmitter } from './app-event-emitter';
import { sendToTrayWindow } from './window-manager';
import { TrackItem } from './models/TrackItem';

let logger = logManager.getLogger('StateManager');

interface TrackItems {
    StatusTrackItem: TrackItem;
    AppTrackItem: TrackItem;
    LogTrackItem: TrackItem;
}

export class StateManager {
    private isSleeping = false;

    private logTrackItemMarkedAsRunning: TrackItem = null;

    lastTrackItems: TrackItems = {
        StatusTrackItem: null,
        AppTrackItem: null,
        LogTrackItem: null,
    };

    constructor() {
        this.initIpc();
    }

    initIpc() {
        ipcMain.on('start-new-log-item', this.startNewLogItem.bind(this));

        ipcMain.on('end-running-log-item', event => {
            logger.info('end-running-log-item');
            this.stopRunningLogTrackItem().then(
                () => logger.info('end-running-log-item'),
                e => logger.error('end-running-log-item', e),
            );
        });

        appEmitter.on('start-new-log-item', rawItem => {
            logger.info('start-new-log-item event');
            this.startNewLogItem(null, rawItem).then(
                () => logger.info('start-new-log-item'),
                e => logger.error('start-new-log-item', e),
            );
        });
    }

    async startNewLogItem(event, rawItem) {
        logger.info('start-new-log-item', rawItem);
        const item: TrackItem = await this.createNewRunningTrackItem(rawItem);
        logger.info('log-item-started', item.toJSON());
        await this.setLogTrackItemMarkedAsRunning(item);
        // event.sender.send('log-item-started', item.toJSON());
        sendToTrayWindow('log-item-started', JSON.stringify(item.toJSON()));
    }

    async restoreState() {
        logger.info('Restoring state.');
        let logItem = await trackItemService.findRunningLogItem();
        if (logItem) {
            this.logTrackItemMarkedAsRunning = logItem;
            this.setCurrentTrackItem(logItem);
        } else {
            logger.info('No runnin log item');
        }

        if (this.logTrackItemMarkedAsRunning) {
            logger.info('Restored running LogTrackItem:', logItem.toJSON());
        }

        return logItem;
    }

    getLogTrackItemMarkedAsRunning() {
        return this.logTrackItemMarkedAsRunning;
    }

    async setLogTrackItemMarkedAsRunning(item: TrackItem) {
        await settingsService.saveRunningLogItemReference(item.id);
        this.setCurrentTrackItem(item);
        logger.info('Mark new LogTrackItem as running:', item.toJSON());
        this.logTrackItemMarkedAsRunning = item;
    }

    async stopRunningLogTrackItem() {
        let item = await this.updateRunningTrackItemEndDate(TrackItemType.LogTrackItem);
        this.resetLogTrackItem();
        this.logTrackItemMarkedAsRunning = null;
        await settingsService.saveRunningLogItemReference(null);
    }

    setCurrentTrackItem(item: TrackItem) {
        this.lastTrackItems[item.taskName] = item;
    }

    getCurrentTrackItem(type: TrackItemType): TrackItem {
        return this.lastTrackItems[type];
    }

    getCurrentStatusTrackItem() {
        return this.getCurrentTrackItem(TrackItemType.StatusTrackItem);
    }

    hasSameRunningTrackItem(rawItem): boolean {
        return BackgroundUtils.isSameItems(rawItem, this.getCurrentTrackItem(rawItem.taskName));
    }

    resetCurrentTrackItem(type: TrackItemType) {
        logger.debug(`Resetting current track item of type: ${type}`);
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
        logger.info('System is going to sleep state.');
        this.resetAppTrackItem();
    }

    setAwakeFromSleep() {
        this.isSleeping = false;
        logger.info('System is awakeing from sleep state.');
    }

    async endRunningTrackItem(rawItem) {
        let runningItem = this.getCurrentTrackItem(rawItem.taskName);

        if (runningItem) {
            runningItem.endDate = rawItem.beginDate;
            logger.info('Ending trackItem:', runningItem.toJSON());
            this.resetCurrentTrackItem(rawItem.taskName);
            await trackItemService.updateTrackItem(runningItem, runningItem.id);
        }

        return runningItem;
    }

    async createNewRunningTrackItem(rawItem) {
        await this.endRunningTrackItem(rawItem);

        let item = await trackItemService.createTrackItem(rawItem);
        // logger.debug('Created track item to DB and set running item:', item.toJSON());

        this.setCurrentTrackItem(item);
        return item;
    }

    async updateRunningTrackItemEndDate(type: TrackItemType) {
        let runningItem = this.getCurrentTrackItem(type);
        runningItem.endDate = new Date();
        await trackItemService.updateTrackItem(runningItem, runningItem.id);
        // logger.debug('Saved track item(endDate change) to DB:', runningItem.toJSON());
        return runningItem;
    }
}

export const stateManager = new StateManager();
