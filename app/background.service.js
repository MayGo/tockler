'use strict';

var app = require('electron').app;

var compareVersion = require('compare-version');
var bunyan = require('bunyan');

var log;

var _ = require('lodash');
var $q = require('q');

var moment = require('moment');

var path = require('path');
var exec = require("child_process").exec;

var emptyItem = {title: 'EMPTY'};

var TrackItemService = null;
var AppSettingsService = null;
var SettingsService = null;

const TrackItemCrud = require('./TrackItemCrud');
const AppItemCrud = require('./AppItemCrud');
const SettingsCrud = require('./SettingsCrud');
const TrackItem = require('./db').TrackItem;

var BackgroundService = {};

var userDir;

BackgroundService.getTrackItemService = function () {
    return TrackItemService;
};
BackgroundService.getSettingsService = function () {
    return SettingsService;
};

BackgroundService.getAppSettingsService = function () {
    return AppSettingsService;
};


var rawItems = [emptyItem, emptyItem, emptyItem];

var BACKGROUND_JOB_INTERVAL = 3000;


// on sleep computer can come out of it just for breif moment, at least mac
var isSleeping = false;

// hold last saved trackitems by taskName ('StatusTrackItem', 'AppTrackItem', 'LogTrackItem')
var lastTrackItems = {StatusTrackItem: null, AppTrackItem: null, LogTrackItem: null}

var addInactivePeriod = function (beginDate, endDate) {

    var item = {app: 'OFF', title: "Inactive"};
    item.taskName = 'StatusTrackItem';
    item.beginDate = beginDate;
    item.endDate = endDate;
    log.info("Adding inactive trackitem", item);
    lastTrackItems.StatusTrackItem = null;
    createOrUpdate(item);
}


var isSameItems = function (item1, item2) {
    if (item1 && item2 && item1.app === item2.app && item1.title === item2.title) {
        return true
    }

    return false
};

var shouldSplitInTwoOnMidnight = function (beginDate, endDate) {
    return beginDate.getDate() < endDate.getDate();
}

var dateToAfterMidnight = function (d) {
    return moment(d).startOf('day').add(1, 'days').toDate();
}

var getRawTrackItem = function (savedItem) {
    var item = {
        app: savedItem.app,
        title: savedItem.title,
        taskName: savedItem.taskName,
        color: savedItem.color,
        beginDate: savedItem.beginDate,
        endDate: savedItem.endDate
    };
    return item;

};

let shouldSplitLogItemFromDate = null;
const TaskAnalyser = require('./taskAnalyser');

var createOrUpdate = function (rawItem) {

    var deferred = $q.defer();

    AppItemCrud.getAppColor(rawItem.app).then(function (color) {
        rawItem.color = color;

        var type = rawItem.taskName;

        if (!type) {
            log.error('TaskName not defined:', rawItem);
        }

        if (shouldSplitInTwoOnMidnight(rawItem.beginDate, rawItem.endDate)) {
            log.info('its midnight for item:', rawItem);
            var almostMidnight = moment(rawItem.beginDate).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();
            var afterMidnight = dateToAfterMidnight(rawItem.beginDate);
            var originalEndDate = rawItem.endDate;

            log.debug('Midnight- almostMidnight: ' + almostMidnight + ', ' + afterMidnight);
            rawItem.endDate = almostMidnight;
            rawItem.endDateOverride = almostMidnight;
            createOrUpdate(rawItem).then(function (item1) {
                lastTrackItems[type] = null;
                log.debug('Midnight- Saved one: ', item1);
                item1.beginDate = afterMidnight;
                item1.endDate = originalEndDate;
                item1.endDateOverride = originalEndDate;
                log.debug('Midnight- Saving second: ', item1);
                createOrUpdate(getRawTrackItem(item1)).then(function (item2) {
                    log.debug('Midnight- Saved second: ', item2);
                    deferred.resolve(item2);
                }).catch(function (error) {
                    console.error("Second Item not updated.", error)
                });
            }).catch(function (error) {
                console.error("First Item not updated.", error)
            });
        } else {

            if (!isSameItems(rawItem, lastTrackItems[type])) {

                var promise = $q.when();

                if (lastTrackItems[type]) {
                    lastTrackItems[type].endDate = rawItem.beginDate;
                    log.debug("Saving old trackItem:", lastTrackItems[type]);
                    promise = TrackItemCrud.updateItem(lastTrackItems[type])
                }

                promise.then(function () {
                    //rawItem.endDate = new Date();
                    TrackItemCrud.createItem(rawItem).then(function (item) {
                        log.debug("Created track item to DB:", item);
                        lastTrackItems[type] = item;
                        TaskAnalyser.analyseAndNotify(item);
                        TaskAnalyser.analyseAndSplit(item).then((fromDate)=> {
                            if (fromDate) {
                                log.info("Splitting LogTrackItem from date:", fromDate);
                                shouldSplitLogItemFromDate = fromDate;
                            }
                        });

                        deferred.resolve(item);
                    }).catch(function (error) {
                        console.error("New Item not created.", error)
                    });
                }).catch(function (error) {
                    console.error("Old Item not updated.", error)
                });

            } else if (isSameItems(rawItem, lastTrackItems[type])) {
                lastTrackItems[type].endDate = rawItem.endDateOverride || new Date();
                TrackItemCrud.updateItem(lastTrackItems[type]).then(function (item) {
                    log.debug("Saved track item(endDate change) to DB:", item);
                    lastTrackItems[type] = item;
                    deferred.resolve(item);
                }).catch(function (error) {
                    console.error("Item not updated.", error)
                });
            } else {
                log.error("Nothing to do with item", rawItem);
            }
        }
    })
    return deferred.promise;
};

var addRawTrackItemToList = function (item) {
    // Keep only 3 items in array
    rawItems.unshift(item);
    rawItems.pop();
};

var saveActiveWindow = function (newAppTrackItem) {
    if (isSleeping) {
        log.info('Computer is sleeping, not running saveActiveWindow');
        return;
    }
    if (lastTrackItems.StatusTrackItem !== null && lastTrackItems.StatusTrackItem.app === 'IDLE') {
        log.debug('Not saving, app is idling', newAppTrackItem);
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

    createOrUpdate(newAppTrackItem);
};

var IDLE_IN_SECONDS_TO_LOG = 60 * 1;

/**
 *
 * @param seconds
 * @returns
 */
var saveIdleTrackItem = function (seconds) {

    if (isSleeping) {
        log.info('Computer is sleeping, not running saveIdleTrackItem');
        return;
    }


    var appName = (seconds > IDLE_IN_SECONDS_TO_LOG) ? 'IDLE' : 'ONLINE';
    var appTitle = (seconds > IDLE_IN_SECONDS_TO_LOG) ? 'idle' : 'online';

    // Cannot go from OFFLINE to IDLE
    if (lastTrackItems.StatusTrackItem !== null &&
        lastTrackItems.StatusTrackItem.app === 'OFFLINE' &&
        appName === 'IDLE'
    ) {
        log.info('Not saving. Cannot go from OFFLINE to IDLE');
        return
    }

    var beginDate = new Date();
    //Begin date is always BACKGROUND_JOB_INTERVAL before current date
    beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);

    var rawItem = {
        taskName: 'StatusTrackItem',
        app: appName,
        title: appTitle,
        beginDate: beginDate,
        endDate: new Date()
    };


    AppItemCrud.getAppColor(rawItem.app).then(function (color) {
        rawItem.color = color;
        createOrUpdate(rawItem);

    })

};


BackgroundService.onSleep = function () {
    isSleeping = true;
    //lastStatusTrackItemSaved = null;
    lastTrackItems.AppTrackItem = null;
};

BackgroundService.onResume = function () {
    addRawTrackItemToList(emptyItem);
    addRawTrackItemToList(emptyItem);
    addRawTrackItemToList(emptyItem);
    if (lastTrackItems.StatusTrackItem != null) {
        addInactivePeriod(lastTrackItems.StatusTrackItem.endDate, new Date());
    } else {
        log.info('No lastTrackItems.StatusTrackItem for addInactivePeriod.')
    }
    isSleeping = false;
};

var isOsxScriptRunned = false;

BackgroundService.saveForegroundWindowTitle = function () {

    //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    var script = "";
    if (process.platform === 'darwin') {
        //Run applescript from shell.
        script = "osascript " + path.join(__dirname, "get-foreground-window-title.osa");
    } else if (process.platform === 'win32') {
        script = 'powershell.exe "& ""' + path.join(__dirname, "get-foreground-window-title.ps1") + '"""';
    } else if (process.platform === 'linux') {
        script = "sh " + path.join(__dirname, "get-foreground-window-title.sh");
    }

    //log.debug('Script saveForegroundWindowTitle file: ' + script);

    exec(script, function (error, stdout, stderr) {
        log.debug('Foreground window: ' + stdout);

        if (stderr) {
            log.error('saveForegroundWindowTitle error: ' + stderr);
        }

        var active = {};
        var active_a = stdout.split(",");

        if (typeof active_a[0] !== "undefined") {
            active.app = active_a[0];
            // isElCapitanScriptRunned = true;//some applications doe not have app, check only when started
        }
        if (active.app) {
            isOsxScriptRunned = true;//some applications doe not have app, check only when started
        }

        if (process.platform === 'darwin' && isOsxScriptRunned === false) {
            console.log('Running assistive-access-el-capitan.osa');
            var access_script = "osascript " + path.join(__dirname, "assistive-access-el-capitan.osa");
            if (compareVersion(require('os').release(), '10.11.0') === -1) {
                access_script = "osascript " + path.join(__dirname, "assistive-access-osx.osa");
            }
            isOsxScriptRunned = true;
            exec(access_script, function (error, stdout, stderr) {
                console.log('Assistive access: ', stdout, error, stderr);
            });
        }

        if (typeof active_a[1] !== "undefined") {
            active.title = active_a[1].replace(/\n$/, "").replace(/^\s/, "");
        }

        //log.info(active);
        var now = new Date();
        var beginDate = new Date();
        //Begin date is always BACKGROUND_JOB_INTERVAL before current date
        beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
        active.beginDate = beginDate;
        active.endDate = now;

        log.debug("Foreground window (parsed):", active);

        saveActiveWindow(active);
    });
};
BackgroundService.saveRunningLogItem = function () {
    // saveRunningLogItem can be run before app comes back ONLINE and running log item have to be split.
    //
    if (lastTrackItems.StatusTrackItem !== null &&
        lastTrackItems.StatusTrackItem.app !== 'ONLINE') {
        log.info('Not saving running log item. Not online');
        return
    }

    if (isSleeping) {
        log.info('Computer is sleeping, not running saveRunningLogItem');
        return;
    }

    let splitEndDate = null;

    // Getting and reseting variable
    if (shouldSplitLogItemFromDate != null) {
        splitEndDate = shouldSplitLogItemFromDate;
        shouldSplitLogItemFromDate = null;
    }
    SettingsCrud.findByName('RUNNING_LOG_ITEM').then(function (item) {
        var deferred = $q.defer();
        log.debug("Found RUNNING_LOG_ITEM config: ", item);
        if (item.jsonDataParsed.id) {
            TrackItemCrud.findById(item.jsonDataParsed.id).then(function (logItem) {
                if (!logItem) {
                    log.error("RUNNING_LOG_ITEM not found by id", item.jsonDataParsed.id)
                    return;
                }
                log.debug("Found RUNNING_LOG_ITEM real LogItem: ", logItem);
                let rawItem = getRawTrackItem(logItem);
                rawItem.endDate = new Date();
                if (splitEndDate != null) {
                    log.info("Splitting LogItem, old item has endDate: ", splitEndDate);
                    rawItem.endDateOverride = splitEndDate;
                    rawItem.endDate = splitEndDate;
                    if(rawItem.beginDate > splitEndDate){
                        log.error("BeginDate is after endDate. Not saving RUNNING_LOG_ITEM");
                    }
                }
                // set first LogTrackItem because
                // when restarting application there would be multiple same items
                lastTrackItems.LogTrackItem = logItem;

                createOrUpdate(rawItem).then(function (savedItem) {

                    if (splitEndDate) {
                        log.info("Splitting LogItem, new item has endDate: ", splitEndDate);
                        lastTrackItems.LogTrackItem = null;
                        let newRawItem = getRawTrackItem(logItem);

                        let newBeginDate = new Date();
                        //Begin date is always BACKGROUND_JOB_INTERVAL before current date
                        newBeginDate.setMilliseconds(newBeginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
                        newRawItem.beginDate = newBeginDate;
                        newRawItem.endDate = new Date();
                        createOrUpdate(newRawItem).then(function (newSavedItem) {
                            log.info('RUNNING_LOG_ITEM has split', newSavedItem.id);
                            SettingsCrud.saveRunningLogItemReferemce(newSavedItem.id);
                        });
                    } else {
                        // at midnight track item is split and new items ID should be RUNNING_LOG_ITEM
                        if (savedItem.id !== logItem.id) {
                            log.info('RUNNING_LOG_ITEM changed at midnight.');
                            SettingsCrud.saveRunningLogItemReferemce(savedItem.id);
                        }
                    }

                });
            })
        } else {
            log.debug("No RUNNING_LOG_ITEM ref id");
            deferred.resolve()
        }
        return deferred.promise;
    });
};

BackgroundService.saveUserIdleTime = function () {

    //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    var script = "";
    if (process.platform === 'darwin') {
        script = "sh " + path.join(__dirname, "get-user-idle-time.mac.sh");
    } else if (process.platform === 'win32') {
        script = 'powershell.exe "& ""' + path.join(__dirname, "get-user-idle-time.ps1") + '"""';


    } else if (process.platform === 'linux') {
        script = "sh " + path.join(__dirname, "get-user-idle-time.linux.sh");
    }

    //log.debug('Script saveUserIdleTime file: ' + script)

    return exec(script, function (error, stdout, stderr) {
        log.debug('Idle time: ' + stdout);
        if (stderr) {
            log.debug('saveUserIdleTime error: ' + stderr);
        }

        var seconds = stdout;

        saveIdleTrackItem(seconds);
    });
};

BackgroundService.init = function () {

    userDir = app.getPath('userData');
    var outputPath = path.join(userDir, 'stdout.json');

    // Create logger
    log = bunyan.createLogger({
        name: 'background-service',
        streams: [
            {
                level: 'info',
                stream: process.stdout            // log INFO and above to stdout
            },
            {
                level: 'debug',
                type: 'rotating-file',
                period: '1d',   // daily rotation
                count: 3,        // keep 3 back copies
                path: outputPath
            }
        ]
    });


    log.info('User Dir:' + userDir);
    log.info('Environment:' + process.env.NODE_ENV);

    TrackItemService = TrackItemCrud;
    AppSettingsService = AppItemCrud;
    SettingsService = SettingsCrud;


    log.info('Running background service.');
    setInterval(function () {
        self.saveUserIdleTime();
        self.saveForegroundWindowTitle();
        self.saveRunningLogItem();

    }, BACKGROUND_JOB_INTERVAL);
};


var self = module.exports = BackgroundService;

