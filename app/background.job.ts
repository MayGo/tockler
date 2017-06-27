
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
import { backgroundService } from "./background.service";
var logger = logManager.getLogger('BackgroundJob');

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

export class BackgroundJob {

    init() {

        logger.info('Environment:' + process.env.NODE_ENV);

        logger.info('Running background service.');
        setInterval(() => {
            this.saveUserIdleTime();
            this.saveForegroundWindowTitle();
            this.saveRunningLogItem();

        }, appConstants.BACKGROUND_JOB_INTERVAL);
    }

    saveForegroundWindowTitle() {

        activeWin().then(result => {

            /*
            {
                title: 'npm install',
                id: 54,
                app: 'Terminal',
                pid: 368
            }
            */
            let active: any = {};
            // logger.info(result);

            active.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
            active.endDate = new Date();
            active.app = result.app;
            active.title = result.title.replace(/\n$/, "").replace(/^\s/, "");

            logger.debug("Foreground window (parsed):", active);

            backgroundService.saveActiveWindow(active);
        });

    }

    saveRunningLogItem() {
        // saveRunningLogItem can be run before app comes back ONLINE and running log item have to be split.
        if (!stateManager.isSystemOnline()) {
            logger.info('Not saving running log item. Not online');
            return;
        }

        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveRunningLogItem');
            return;
        }

        let splitEndDate = null;

        // Getting and reseting variable
        if (shouldSplitLogItemFromDate != null) {
            splitEndDate = shouldSplitLogItemFromDate;
            shouldSplitLogItemFromDate = null;
        }

        settingsService.findByName('RUNNING_LOG_ITEM').then((item: any) => {
            var deferred = $q.defer();
            logger.debug("Found RUNNING_LOG_ITEM config: ", item);
            if (item.jsonDataParsed.id) {
                trackItemService.findById(item.jsonDataParsed.id).then((logItem: any) => {
                    if (!logItem) {
                        logger.error("RUNNING_LOG_ITEM not found by id", item.jsonDataParsed.id);
                        return;
                    }
                    logger.debug("Found RUNNING_LOG_ITEM real LogItem: ", logItem);
                    let rawItem: any = BackgroundUtils.getRawTrackItem(logItem);
                    rawItem.endDate = new Date();
                    if (splitEndDate != null) {
                        logger.info("Splitting LogItem, old item has endDate: ", splitEndDate);
                        rawItem.endDateOverride = splitEndDate;
                        rawItem.endDate = splitEndDate;
                        if (rawItem.beginDate > splitEndDate) {
                            logger.error("BeginDate is after endDate. Not saving RUNNING_LOG_ITEM");
                        }
                    }
                    // set first LogTrackItem because
                    // when restarting application there would be multiple same items
                    stateManager.setRunningTrackItem(logItem);

                    backgroundService.createOrUpdate(rawItem).then((savedItem) => {

                        if (splitEndDate) {
                            logger.info("Splitting LogItem, new item has endDate: ", splitEndDate);
                            stateManager.resetLogTrackItem();
                            let newRawItem = BackgroundUtils.getRawTrackItem(logItem);

                            newRawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
                            newRawItem.endDate = new Date();
                            backgroundService.createOrUpdate(newRawItem).then((newSavedItem) => {
                                logger.info('RUNNING_LOG_ITEM has split', newSavedItem.id);
                                settingsService.saveRunningLogItemReferemce(newSavedItem.id);
                            });
                        } else {
                            // at midnight track item is split and new items ID should be RUNNING_LOG_ITEM
                            if (savedItem.id !== logItem.id) {
                                logger.info('RUNNING_LOG_ITEM changed at midnight.');
                                settingsService.saveRunningLogItemReferemce(savedItem.id);
                            }
                        }

                    });
                });
            } else {
                logger.debug("No RUNNING_LOG_ITEM ref id");
                deferred.resolve();
            }
            return deferred.promise;
        });
    }


    saveUserIdleTime() {

        //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        let runExec = "";
        let args = [];
        if (process.platform === 'darwin') {
            runExec = "sh";
            args.push(path.join(config.root, "scripts", "get-user-idle-time.mac.sh"));
        } else if (process.platform === 'win32') {
            runExec = 'powershell.exe';
            args.push('"& ""' + path.join(config.root, "scripts", "get-user-idle-time.ps1") + '"""');
        } else if (process.platform === 'linux') {
            runExec = "sh";
            args.push(path.join(config.root, "scripts", "get-user-idle-time.linux.sh"));
        }

        //logger.debug('Script saveUserIdleTime file: ' + script)

        var handleSuccess = (stdout) => {
            logger.debug('Idle time: ' + stdout);

            var seconds = stdout;

            backgroundService.saveIdleTrackItem(seconds);
        };

        var handleError = (error) => {
            logger.error('saveUserIdleTime error: ' + error);

            /* if (error.includes('UnauthorizedAccess') || error.includes('AuthorizationManager check failed')) {
                 error = 'Choose [A] Always run in opened command prompt.';
                 execSync('start cmd.exe  /K' + script);
             }*/

            UserMessages.showError('Error getting user idle time', error);

        };

        var callcack = (err, stdout, stderr) => {

            if (stderr) {
                handleError(stderr);
                return;
            }

            if (err) {
                handleError(err);
                logger.error("saveUserIdleTime err", err);
                return;
            }

            handleSuccess(stdout);
        };

        execFile(runExec, args, { timeout: 2000 }, callcack);
    }
}

export const backgroundJob = new BackgroundJob();
