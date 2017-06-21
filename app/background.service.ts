'use strict';
import TaskAnalyser from './task-analyser';
import { settingsService } from './services/settings-service';
import { trackItemService } from './services/track-item-service';
import { appItemService } from './services/app-item-service';

import { app, ipcMain, dialog } from "electron";
import config from "./config";

import { logManager } from "./log-manager";
var logger = logManager.getLogger('BackgroundService');

var $q = require('q');

import * as moment from 'moment';
import * as activeWin from 'active-win';
import UserMessages from "./user-messages";
import BackgroundUtils from "./background.utils";
import * as path from 'path';
import { exec, execSync, execFile } from "child_process";


const emptyItem = { title: 'EMPTY' };

var rawItems = [emptyItem, emptyItem, emptyItem];

var BACKGROUND_JOB_INTERVAL = 3000;
var IDLE_IN_SECONDS_TO_LOG = 60 * 1;

// on sleep computer can come out of it just for breif moment, at least mac
var isSleeping = false;

// hold last saved trackitems by taskName ('StatusTrackItem', 'AppTrackItem', 'LogTrackItem')
var lastTrackItems = { StatusTrackItem: null, AppTrackItem: null, LogTrackItem: null }


let shouldSplitLogItemFromDate = null;


let oneThreadRunning = false;

export class BackgroundService {

    init() {

        logger.info('Environment:' + process.env.NODE_ENV);

        logger.info('Running background service.');
        setInterval(() => {
            this.saveUserIdleTime();
            this.saveForegroundWindowTitle();
            this.saveRunningLogItem();

        }, BACKGROUND_JOB_INTERVAL);
    }

    addInactivePeriod(beginDate, endDate) {

        var item: any = { app: 'OFF', title: "Inactive" };
        item.taskName = 'StatusTrackItem';
        item.beginDate = beginDate;
        item.endDate = endDate;
        logger.info("Adding inactive trackitem", item);
        lastTrackItems.StatusTrackItem = null;
        this.createOrUpdate(item);
    }

    getRawTrackItem(savedItem) {
        var item = {
            app: savedItem.app,
            title: savedItem.title,
            taskName: savedItem.taskName,
            color: savedItem.color,
            beginDate: savedItem.beginDate,
            endDate: savedItem.endDate
        };
        return item;
    }

    createOrUpdate(rawItem) {

        var deferred = $q.defer();

        appItemService.getAppColor(rawItem.app).then((color) => {
            rawItem.color = color;

            var type = rawItem.taskName;

            if (!type) {
                logger.error('TaskName not defined:', rawItem);
            }

            if (BackgroundUtils.shouldSplitInTwoOnMidnight(rawItem.beginDate, rawItem.endDate)) {
                logger.info('its midnight for item:', rawItem);
                var almostMidnight = moment(rawItem.beginDate).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();
                var afterMidnight = BackgroundUtils.dateToAfterMidnight(rawItem.beginDate);
                var originalEndDate = rawItem.endDate;

                logger.debug('Midnight- almostMidnight: ' + almostMidnight + ', ' + afterMidnight);
                rawItem.endDate = almostMidnight;
                rawItem.endDateOverride = almostMidnight;
                this.createOrUpdate(rawItem).then((item1) => {
                    lastTrackItems[type] = null;
                    logger.debug('Midnight- Saved one: ', item1);
                    item1.beginDate = afterMidnight;
                    item1.endDate = originalEndDate;
                    item1.endDateOverride = originalEndDate;
                    logger.debug('Midnight- Saving second: ', item1);
                    this.createOrUpdate(this.getRawTrackItem(item1)).then((item2) => {
                        logger.debug('Midnight- Saved second: ', item2);
                        deferred.resolve(item2);
                    }).catch((error) => {
                        console.error("Second Item not updated.", error)
                    });
                }).catch((error) => {
                    console.error("First Item not updated.", error)
                });
            } else {

                if (!BackgroundUtils.isSameItems(rawItem, lastTrackItems[type])) {

                    var promise = $q.when();

                    if (lastTrackItems[type]) {
                        lastTrackItems[type].endDate = rawItem.beginDate;
                        logger.debug("Saving old trackItem:", lastTrackItems[type]);
                        promise = trackItemService.updateItem(lastTrackItems[type])
                    }

                    promise.then(() => {
                        //rawItem.endDate = new Date();
                        trackItemService.createItem(rawItem).then((item) => {
                            logger.debug("Created track item to DB:", item);
                            lastTrackItems[type] = item;
                            TaskAnalyser.analyseAndNotify(item);
                            TaskAnalyser.analyseAndSplit(item).then((fromDate) => {
                                if (fromDate) {
                                    logger.info("Splitting LogTrackItem from date:", fromDate);
                                    shouldSplitLogItemFromDate = fromDate;
                                }
                            });

                            deferred.resolve(item);
                        }).catch((error) => {
                            console.error("New Item not created.", error)
                        });
                    }).catch((error) => {
                        console.error("Old Item not updated.", error)
                    });

                } else if (BackgroundUtils.isSameItems(rawItem, lastTrackItems[type])) {
                    lastTrackItems[type].endDate = rawItem.endDateOverride || new Date();
                    trackItemService.updateItem(lastTrackItems[type]).then((item) => {
                        logger.debug("Saved track item(endDate change) to DB:", item);
                        lastTrackItems[type] = item;
                        deferred.resolve(item);
                    }).catch((error) => {
                        console.error("Item not updated.", error)
                    });
                } else {
                    logger.error("Nothing to do with item", rawItem);
                }
            }
        })
        return deferred.promise;
    }

    addRawTrackItemToList(item) {
        // Keep only 3 items in array
        rawItems.unshift(item);
        rawItems.pop();
    }

    saveActiveWindow(newAppTrackItem) {
        if (isSleeping) {
            logger.info('Computer is sleeping, not running saveActiveWindow');
            return;
        }
        if (lastTrackItems.StatusTrackItem !== null && lastTrackItems.StatusTrackItem.app === 'IDLE') {
            logger.debug('Not saving, app is idling', newAppTrackItem);
            //addRawTrackItemToList(emptyItem);
            lastTrackItems.AppTrackItem = null;
            return
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

        if (isSleeping) {
            logger.info('Computer is sleeping, not running saveIdleTrackItem');
            return;
        }


        var appName = (seconds > IDLE_IN_SECONDS_TO_LOG) ? 'IDLE' : 'ONLINE';
        var appTitle = (seconds > IDLE_IN_SECONDS_TO_LOG) ? 'idle' : 'online';

        // Cannot go from OFFLINE to IDLE
        if (lastTrackItems.StatusTrackItem !== null &&
            lastTrackItems.StatusTrackItem.app === 'OFFLINE' &&
            appName === 'IDLE'
        ) {
            logger.info('Not saving. Cannot go from OFFLINE to IDLE');
            return
        }

        var beginDate = new Date();
        //Begin date is always BACKGROUND_JOB_INTERVAL before current date
        beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);

        var rawItem: any = {
            taskName: 'StatusTrackItem',
            app: appName,
            title: appTitle,
            beginDate: beginDate,
            endDate: new Date()
        };


        appItemService.getAppColor(rawItem.app).then((color) => {
            rawItem.color = color;
            this.createOrUpdate(rawItem);
        })

    }

    onSleep() {
        isSleeping = true;
        //lastStatusTrackItemSaved = null;
        lastTrackItems.AppTrackItem = null;
    }

    onResume() {
        this.addRawTrackItemToList(emptyItem);
        this.addRawTrackItemToList(emptyItem);
        this.addRawTrackItemToList(emptyItem);
        if (lastTrackItems.StatusTrackItem != null) {
            this.addInactivePeriod(lastTrackItems.StatusTrackItem.endDate, new Date());
        } else {
            logger.info('No lastTrackItems.StatusTrackItem for addInactivePeriod.')
        }
        isSleeping = false;
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
            var now = new Date();
            var beginDate = new Date();

            //Begin date is always BACKGROUND_JOB_INTERVAL before current date
            beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
            active.beginDate = beginDate;
            active.endDate = now;
            active.app = result.app;
            active.title = result.title.replace(/\n$/, "").replace(/^\s/, "");

            logger.debug("Foreground window (parsed):", active);

            this.saveActiveWindow(active);
        });

    }

    saveRunningLogItem() {
        // saveRunningLogItem can be run before app comes back ONLINE and running log item have to be split.
        //
        if (lastTrackItems.StatusTrackItem !== null &&
            lastTrackItems.StatusTrackItem.app !== 'ONLINE') {
            logger.info('Not saving running log item. Not online');
            return
        }

        if (isSleeping) {
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
                        logger.error("RUNNING_LOG_ITEM not found by id", item.jsonDataParsed.id)
                        return;
                    }
                    logger.debug("Found RUNNING_LOG_ITEM real LogItem: ", logItem);
                    let rawItem: any = this.getRawTrackItem(logItem);
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
                    lastTrackItems.LogTrackItem = logItem;

                    this.createOrUpdate(rawItem).then((savedItem) => {

                        if (splitEndDate) {
                            logger.info("Splitting LogItem, new item has endDate: ", splitEndDate);
                            lastTrackItems.LogTrackItem = null;
                            let newRawItem = this.getRawTrackItem(logItem);

                            let newBeginDate = new Date();
                            //Begin date is always BACKGROUND_JOB_INTERVAL before current date
                            newBeginDate.setMilliseconds(newBeginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
                            newRawItem.beginDate = newBeginDate;
                            newRawItem.endDate = new Date();
                            this.createOrUpdate(newRawItem).then((newSavedItem) => {
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
                })
            } else {
                logger.debug("No RUNNING_LOG_ITEM ref id");
                deferred.resolve()
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

            this.saveIdleTrackItem(seconds);
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

export const backgroundService = new BackgroundService();
