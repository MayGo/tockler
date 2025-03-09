import { ipcMain } from 'electron';
import { appEmitter } from './app-event-emitter';
import { backgroundService } from './background-service';
import BackgroundUtils from './background-utils';
import { TrackItem } from './drizzle/schema';
import { State } from './enums/state';
import { TrackItemType } from './enums/track-item-type';
import { logManager } from './log-manager';
import { settingsService } from './services/settings-service';
import { trackItemService } from './services/track-item-service';
import { TrackItemRaw } from './task-analyser';
import { sendToTrayWindow } from './window-manager';

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

        appEmitter.on('start-new-log-item', (rawItem) => {
            logger.debug('start-new-log-item event');
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

        return BackgroundUtils.isSameItems(
            rawItem,
            BackgroundUtils.getRawTrackItem(this.getCurrentTrackItem(rawItem.taskName)),
        );
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
        let rawItem: any = {
            taskName: 'StatusTrackItem',
            app: State.Online,
            title: State.Online.toString().toLowerCase(),
            beginDate: new Date(),
            endDate: new Date(),
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
                runningItem.endDate =
                    rawItem.beginDate instanceof Date
                        ? rawItem.beginDate.toISOString()
                        : new Date(rawItem.beginDate).toISOString();
            } else {
                logger.debug('No beginDate, setting endDate to now');
                runningItem.endDate = new Date().toISOString();
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
            beginDate:
                rawItem.beginDate instanceof Date
                    ? rawItem.beginDate.toISOString()
                    : rawItem.beginDate || new Date().toISOString(),
            endDate:
                rawItem.endDate instanceof Date
                    ? rawItem.endDate.toISOString()
                    : rawItem.endDate || new Date().toISOString(),
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

        runningItem.endDate = new Date().toISOString();
        await trackItemService.updateTrackItem(runningItem, runningItem.id);
        // logger.debug('Saved track item(endDate change) to DB:', runningItem.toJSON());
        return runningItem;
    }
}

export const stateManager = new StateManager();
