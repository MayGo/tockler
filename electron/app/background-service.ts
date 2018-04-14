import { settingsService } from './services/settings-service';
import { trackItemService } from './services/track-item-service';
import { appSettingService } from './services/app-setting-service';
import { TrackItemInstance, TrackItemAttributes } from './models/interfaces/track-item-interface';
import { State } from './enums/state';
import { app, ipcMain, dialog } from 'electron';
import config from './config';

import { logManager } from './log-manager';
import { stateManager } from './state-manager';
let logger = logManager.getLogger('BackgroundService');

import * as moment from 'moment';
import UserMessages from './user-messages';
import BackgroundUtils from './background-utils';
import * as path from 'path';
import { exec, execSync, execFile } from 'child_process';
import { TrackItemType } from './enums/track-item-type';
import { appConstants } from './app-constants';

const emptyItem = { title: 'EMPTY' };

let shouldSplitLogItemFromDate = null;

let oneThreadRunning = false;

export class BackgroundService {
    async addInactivePeriod(beginDate, endDate) {
        let rawItem: any = { app: State.Offline, title: State.Offline.toString().toLowerCase() };
        rawItem.taskName = TrackItemType.StatusTrackItem;
        rawItem.beginDate = beginDate;
        rawItem.endDate = endDate;
        logger.info('Adding inactive trackitem', rawItem);

        stateManager.resetStatusTrackItem();

        let item = await this.createOrUpdate(rawItem);
        return item;
    }

    async createItems(items) {
        const promiseArray = items.map(async newItem => {
            const savedItem = await trackItemService.createTrackItem(newItem);
            return savedItem;
        });

        logger.info('Created items');
        return await Promise.all(promiseArray);
    }

    async createOrUpdate(rawItem) {
        try {
            let color = await appSettingService.getAppColor(rawItem.app);
            rawItem.color = color;

            let item: any;

            let type: TrackItemType = rawItem.taskName;

            if (!type) {
                throw new Error('TaskName not defined.');
            }

            if (BackgroundUtils.shouldSplitInTwoOnMidnight(rawItem.beginDate, rawItem.endDate)) {
                let items: TrackItemAttributes[] = BackgroundUtils.splitItemIntoDayChunks(rawItem);

                if (stateManager.hasSameRunningTrackItem(rawItem)) {
                    let firstItem = items.shift();
                    stateManager.endRunningTrackItem(firstItem);
                }
                try {
                    let savedItems = await this.createItems(items);

                    let lastItem = savedItems[savedItems.length - 1];
                    item = lastItem;
                    stateManager.setCurrentTrackItem(item);
                } catch (e) {
                    logger.error('Error creating items');
                }
            } else {
                if (stateManager.hasSameRunningTrackItem(rawItem)) {
                    item = await stateManager.updateRunningTrackItemEndDate(type);
                } else if (!stateManager.hasSameRunningTrackItem(rawItem)) {
                    item = await stateManager.createNewRunningTrackItem(rawItem);
                }
            }

            return item;
        } catch (e) {
            logger.error('Error createOrUpdate', e);
        }
    }

    onSleep() {
        stateManager.setSystemToSleep();
    }

    async onResume() {
        let statusTrackItem = stateManager.getCurrentStatusTrackItem();
        if (statusTrackItem != null) {
            let item = await this.addInactivePeriod(statusTrackItem.endDate, new Date());
            stateManager.setAwakeFromSleep();
        } else {
            logger.info('No lastTrackItems.StatusTrackItem for addInactivePeriod.');
        }
    }
}

export const backgroundService = new BackgroundService();
