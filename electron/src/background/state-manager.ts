import { ipcMain } from 'electron';
import { TrackItemRaw } from '../app/task-analyser';
import { sendToTrayWindow } from '../app/window-manager';
import { settingsService } from '../drizzle/queries/settings-service';
import { trackItemService } from '../drizzle/queries/track-item-service';
import { TrackItem } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { appEmitter } from '../utils/appEmitter';
import { logManager } from '../utils/log-manager';
import { backgroundService } from './background-service';
import BackgroundUtils from './background-utils';

let logger = logManager.getLogger('StateManager');

interface TrackItems {
    StatusTrackItem: TrackItem | null;
    AppTrackItem: TrackItem | null;
    LogTrackItem: TrackItem | null;
}

function toPlainObject(item: any) {
    if (!item) return null;
    return { ...item };
}

export class StateManager {
    private isSleeping = false;

    private logTrackItemMarkedAsRunning: TrackItem | null = null;

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

        ipcMain.on('end-running-log-item', (_event) => {
            logger.debug('end-running-log-item');
            this.stopRunningLogTrackItem().then(
                () => logger.debug('end-running-log-item'),
                (e) => logger.error('end-running-log-item', e),
            );
        });

        appEmitter.on('start-new-log-item2', (rawItem) => {
            logger.debug('start-new-log-item2 event');
            this.startNewLogItem(null, rawItem).then(
                () => logger.debug('start-new-log-item'),
                (e) => logger.error('start-new-log-item', e),
            );
        });
    }

    async startNewLogItem(_event: any, rawItem: TrackItemRaw) {
        logger.debug('start-new-log-item', rawItem);
        const item: TrackItem = await this.createNewRunningTrackItem(rawItem);
        logger.debug('log-item-started', toPlainObject(item));
        await this.setLogTrackItemMarkedAsRunning(item);

        sendToTrayWindow('log-item-started', JSON.stringify(toPlainObject(item)));
    }

    async restoreState() {
        logger.debug('Restoring state.');
        let logItem = await trackItemService.findRunningLogItem();
        if (logItem) {
            this.logTrackItemMarkedAsRunning = logItem;
            this.setCurrentTrackItem(logItem);

            logger.debug('Restored running LogTrackItem:', toPlainObject(logItem));

            return logItem;
        } else {
            logger.debug('No runnin log item');
        }
        return null;
    }

    getLogTrackItemMarkedAsRunning() {
        return this.logTrackItemMarkedAsRunning;
    }

    async setLogTrackItemMarkedAsRunning(item: TrackItem) {
        await settingsService.saveRunningLogItemReference(item.id);
        this.setCurrentTrackItem(item);
        logger.debug('Mark new LogTrackItem as running:', toPlainObject(item));
        this.logTrackItemMarkedAsRunning = item;
    }

    async stopRunningLogTrackItem() {
        await this.updateRunningTrackItemEndDate(TrackItemType.LogTrackItem);
        this.resetLogTrackItem();
        this.logTrackItemMarkedAsRunning = null;
        await settingsService.saveRunningLogItemReference(null);
    }

    setCurrentTrackItem(item: TrackItem) {
        this.lastTrackItems[item.taskName as TrackItemType] = item;
    }

    getCurrentTrackItem(type: TrackItemType): TrackItem | null {
        return this.lastTrackItems[type];
    }

    getCurrentStatusTrackItem() {
        return this.getCurrentTrackItem(TrackItemType.StatusTrackItem);
    }

    hasSameRunningTrackItem(rawItem: TrackItemRaw): boolean {
        if (!rawItem || !rawItem.taskName) {
            return false;
        }

        let currentItem = this.getCurrentTrackItem(rawItem.taskName);
        if (!currentItem) {
            return false;
        }

        return BackgroundUtils.isSameItems(rawItem, BackgroundUtils.getRawTrackItem(currentItem));
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
        logger.debug('System is going to sleep state.');
        this.resetAppTrackItem();
    }

    async setAwakeFromSleep() {
        this.isSleeping = false;
        logger.debug('System is awakening from sleep state.');
        await this.createOnlineTrackItem();
    }

    async createOnlineTrackItem() {
        let rawItem: TrackItemRaw = {
            taskName: TrackItemType.StatusTrackItem,
            app: State.Online,
            title: State.Online.toString().toLowerCase(),
            beginDate: Date.now(),
            endDate: Date.now(),
        };
        await backgroundService.createOrUpdate(rawItem);
    }

    async endRunningTrackItem(rawItem: TrackItemRaw) {
        if (!rawItem.taskName) {
            logger.error('No taskName, not ending track item');
            return null;
        }

        let runningItem = this.getCurrentTrackItem(rawItem.taskName);

        if (runningItem) {
            if (rawItem.beginDate) {
                runningItem.endDate = rawItem.beginDate;
            } else {
                logger.debug('No beginDate, setting endDate to now');
                runningItem.endDate = Date.now();
            }

            logger.debug('Ending trackItem:', toPlainObject(runningItem));
            this.resetCurrentTrackItem(rawItem.taskName);
            await trackItemService.updateTrackItem(runningItem, runningItem.id);
        }

        return runningItem;
    }

    async createNewRunningTrackItem(rawItem: TrackItemRaw) {
        await this.endRunningTrackItem(rawItem);

        // Convert TrackItemRaw to match Drizzle schema
        const trackItemData = {
            app: rawItem.app || null,
            taskName: rawItem.taskName || null,
            title: rawItem.title || null,
            color: rawItem.color || null,
            url: rawItem.url || null,
            beginDate: rawItem.beginDate,
            endDate: rawItem.endDate,
        };

        let item = await trackItemService.createTrackItem(trackItemData as any);

        this.setCurrentTrackItem(item);
        return item;
    }

    async updateRunningTrackItemEndDate(type: TrackItemType) {
        let runningItem = this.getCurrentTrackItem(type);
        if (!runningItem) {
            return null;
        }

        runningItem.endDate = Date.now();
        await trackItemService.updateTrackItem(runningItem, runningItem.id);
        // logger.debug('Saved track item(endDate change) to DB:', runningItem.toJSON());
        return runningItem;
    }
}

export const stateManager = new StateManager();
