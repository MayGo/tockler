
import TaskAnalyser from './task-analyser';
import { settingsService } from './services/settings-service';
import { trackItemService } from './services/track-item-service';
import { appSettingService } from './services/app-setting-service';
import { TrackItemInstance, TrackItemAttributes } from './models/interfaces/track-item-interface';
import { State } from './state.enum';
import { app, ipcMain, dialog } from "electron";
import config from "./config";

import { logManager } from "./log-manager";
import { stateManager } from "./state-manager";
var logger = logManager.getLogger('BackgroundService');

var $q = require('q');

import * as moment from 'moment';
import * as activeWin from 'active-win';
import UserMessages from "./user-messages";
import BackgroundUtils from "./background.utils";
import * as path from 'path';
import { exec, execSync, execFile } from "child_process";
import { TrackItemType } from "./track-item-type.enum";
import { appConstants } from "./app-constants";


const emptyItem = { title: 'EMPTY' };

let shouldSplitLogItemFromDate = null;


let oneThreadRunning = false;

export class BackgroundService {

    async addInactivePeriod(beginDate, endDate) {

        var rawItem: any = { app: State.Offline, title: State.Offline.toString().toLowerCase() };
        rawItem.taskName = TrackItemType.StatusTrackItem;
        rawItem.beginDate = beginDate;
        rawItem.endDate = endDate;
        logger.info("Adding inactive trackitem", rawItem);

        stateManager.resetStatusTrackItem();

        let item = await this.createOrUpdate(rawItem);
        return item;
    }

    async createItems(items) {
        const promiseArray = items.map(async (newItem) => {
            const savedItem = await trackItemService.createTrackItem(newItem);
            return savedItem;
        });
        return await Promise.all(promiseArray);

    }

    async createOrUpdate(rawItem) {

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

            let savedItems = await this.createItems(items);

            let lastItem = savedItems[savedItems.length - 1];
            item = lastItem;
            stateManager.setRunningTrackItem(item);

        } else {

            if (stateManager.hasSameRunningTrackItem(rawItem)) {

                item = await stateManager.updateRunningTrackItemEndDate(type);

            } else if (!stateManager.hasSameRunningTrackItem(rawItem)) {

                item = await stateManager.createNewRunningTrackItem(rawItem);

                TaskAnalyser.analyseAndNotify(item);
            }
        }

        return item;
    }

    saveActiveWindow(newAppTrackItem) {
        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveActiveWindow');
            return 'SLEEPING'; //TODO: throw exception
        }

        if (stateManager.isSystemIdling()) {
            logger.debug('Not saving, app is idling', newAppTrackItem);
            stateManager.resetAppTrackItem();
            return 'IDLING'; //TODO: throw exception
        }

        if (!newAppTrackItem.title && !newAppTrackItem.app) {
            // Lock screen have no title, maybe something
            newAppTrackItem.app = 'NATIVE';
            newAppTrackItem.taskName = 'AppTrackItem';
            newAppTrackItem.title = 'NO_TITLE';
        } else {
            newAppTrackItem.taskName = 'AppTrackItem';
        }

        this.createOrUpdate(newAppTrackItem);
    }

    saveIdleTrackItem(seconds) {

        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveIdleTrackItem');
            return 'SLEEPING';
        }

        let state: State = (seconds > appConstants.IDLE_IN_SECONDS_TO_LOG) ? State.Idle : State.Online;
        // Cannot go from OFFLINE to IDLE
        if (stateManager.isSystemOffline() && state === State.Idle) {
            logger.info('Not saving. Cannot go from OFFLINE to IDLE');
            return 'BAD_STATE';
        }

        var rawItem: any = {
            taskName: 'StatusTrackItem',
            app: state,
            title: state.toString().toLowerCase(),
            beginDate: BackgroundUtils.currentTimeMinusJobInterval(),
            endDate: new Date()
        };

        this.createOrUpdate(rawItem);
    }

    async updateRunningLogItem() {
        // saveRunningLogItem can be run before app comes back ONLINE and running log item have to be split.
        if (!stateManager.isSystemOnline()) {
            logger.info('Not saving running log item. Not online');
            return 'NOT_ONLINE';
        }

        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveRunningLogItem');
            return 'SLEEPING';
        }


        let logItemMarkedAsRunning = stateManager.getLogTrackItemMarkedAsRunning();
        if (!logItemMarkedAsRunning) {
            logger.debug("RUNNING_LOG_ITEM not found.");
            return 'RUNNING_LOG_ITEM_NOT_FOUND';
        }

        let splitEndDate: Date = await TaskAnalyser.getTaskSplitDate();

        if (splitEndDate) {
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

    onSleep() {
        stateManager.setSystemToSleep();
    }

    async onResume() {
        let statusTrackItem = stateManager.getRunningTrackItem(TrackItemType.StatusTrackItem);
        if (statusTrackItem != null) {
            let item = await this.addInactivePeriod(statusTrackItem.endDate, new Date());
            stateManager.setAwakeFromSleep();
        } else {
            logger.info('No lastTrackItems.StatusTrackItem for addInactivePeriod.');
        }
    }

}

export const backgroundService = new BackgroundService();
