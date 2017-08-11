
import { settingsService } from './services/settings-service';
import { trackItemService } from './services/track-item-service';
import { appSettingService } from './services/app-setting-service';
import { TrackItemInstance, TrackItemAttributes } from './models/interfaces/track-item-interface';
import { State } from './enums/state';
import { app, ipcMain, dialog } from "electron";
import config from "./config";

import { logManager } from "./log-manager";
import { stateManager } from "./state-manager";
import { backgroundService } from "./background-service";
let logger = logManager.getLogger('BackgroundJob');

import * as moment from 'moment';
import * as activeWin from 'active-win';
import UserMessages from "./user-messages";
import BackgroundUtils from "./background-utils";
import * as path from 'path';
import { exec, execSync, execFile } from "child_process";
import { TrackItemType } from "./enums/track-item-type";
import { appConstants } from "./app-constants";
import { logTrackItemJob } from "./jobs/log-track-item-job";
import { statusTrackItemJob } from "./jobs/status-track-item-job";
import { appTrackItemJob } from "./jobs/app-track-item-job";


const emptyItem = { title: 'EMPTY' };

let shouldSplitLogItemFromDate = null;

export class BackgroundJob {

    init() {

        logger.info('Environment:' + process.env.NODE_ENV);

        logger.info('Running background service.');

        setInterval(() => {
            appTrackItemJob.run();
            statusTrackItemJob.run();
            logTrackItemJob.run();

        }, appConstants.BACKGROUND_JOB_INTERVAL);
    }
}

export const backgroundJob = new BackgroundJob();
