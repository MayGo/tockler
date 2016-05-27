'use strict';

var app = require('electron').app;

var compareVersion = require('compare-version');
var bunyan = require('bunyan');
var log;

var _ = require('lodash');
var fs = require('fs');
var $q = require('q');
var randomcolor = require('randomcolor');
var moment = require('moment');

var path = require('path');
var exec = require("child_process").exec;

var emptyItem = {title: 'EMPTY'};

var TrackItemService = null;
var AppSettingsService = null;
var SettingsService = null;


var BackgroundService = {};

var userDir;


//init db
var JSData = require('js-data');
//var DSLevelUpAdapter = require('js-data-levelup');
var DSNedbAdapter = require('js-data-nedb');
var storeDS
var initDb = function (isTesting) {
    log.info('Creating db');

    storeDS = new JSData.DS({
        cacheResponse: false,
        bypassCache: true,
        notify: true,
        keepChangeHistory: false,
        resetHistoryOnInject: true,
        watchChanges: true,
        debug: false
    });

    /*  var adapter = new DSLevelUpAdapter('./db');
     storeDS.registerAdapter('levelup', adapter, { default: true });*/
    var adapter = new DSNedbAdapter();
    storeDS.registerAdapter('nedb', adapter, {default: true});


    log.info('User Dir:' + userDir);
    log.info('Environment:' + process.env.NODE_ENV);

    var trackItemPath = path.join(userDir, (isTesting ? 'trackItemTest' : 'trackItem'));
    var appSettingsPath = path.join(userDir, (isTesting ? 'appSettingsTest' : 'appSettings'));
    var settingsPath = path.join(userDir, (isTesting ? 'settingsTest' : 'settings'));

    TrackItemService = storeDS.defineResource({name: 'trackItem', filepath: trackItemPath});
    AppSettingsService = storeDS.defineResource({name: 'appSettings', filepath: appSettingsPath});
    SettingsService = storeDS.defineResource({name: 'settings', filepath: settingsPath});

};
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

var lastAppTrackItemSaved = null;

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
    return beginDate.getDate() !== endDate.getDate();
}

var dateToAfterMidnight = function (d) {
    return moment(d).startOf('day').add(1, 'days').toDate();
}

var getAppColor = function (appName) {
    var deferred = $q.defer();
    var params = {
        name: appName
    };

    AppSettingsService.findAll(params).then(function (items) {
        if (items.length > 0) {
            deferred.resolve(items[0].color);
        } else {
            var color = randomcolor();
            AppSettingsService.create({name: appName, color: color}).then(function (item) {
                log.debug("Created color item to DB:", item);
            });
            deferred.resolve(color);
        }
    });
    return deferred.promise;
};

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

}


var createOrUpdate = function (rawItem) {

    var deferred = $q.defer();

    getAppColor(rawItem.app).then(function (color) {
        rawItem.color = color;

        var type = rawItem.taskName;

        if (!type) {
            log.error('TaskName not defined:', rawItem);
        }

        if (shouldSplitInTwoOnMidnight(rawItem.beginDate, rawItem.endDate)) {
            log.info('its midnight');
            var almostMidnight = moment(rawItem.beginDate).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();
            var afterMidnight = dateToAfterMidnight(rawItem.beginDate);
            var originalEndDate = rawItem.endDate;

            log.debug('Midnight- almostMidnight: ' + almostMidnight + ', ' + afterMidnight);
            rawItem.endDate = almostMidnight;
            createOrUpdate(rawItem).then(function (item1) {
                lastTrackItems[type] = null;
                log.debug('Midnight- Saved one: ' + item1);
                item1.beginDate = afterMidnight;
                item1.endDate = originalEndDate;
                log.debug('Midnight- Saving second: ' + item1);
                createOrUpdate(getRawTrackItem(item1)).then(function (item2) {
                    log.debug('Midnight- Saved second: ' + item2);
                    deferred.resolve(item2);
                });
            });
        } else {

            if (!isSameItems(rawItem, lastTrackItems[type])) {

                var promise = $q.when();

                if (lastTrackItems[type]) {
                    lastTrackItems[type].endDate = rawItem.beginDate;
                    log.debug("Saving old trackItem:", lastTrackItems[type]);
                    promise = TrackItemService.update(lastTrackItems[type].id, lastTrackItems[type])
                }

                promise.then(function () {
                    //rawItem.endDate = new Date();
                    TrackItemService.create(rawItem).then(function (item) {
                        log.debug("Created track item to DB:", item);
                        lastTrackItems[type] = item;
                        deferred.resolve(item);
                    }, function (e) {
                        log.error("Error creating", e)
                    });
                });

            } else if (isSameItems(rawItem, lastTrackItems[type])) {
                lastTrackItems[type].endDate = new Date();
                TrackItemService.update(lastTrackItems[type].id, lastTrackItems[type]).then(function (item) {
                    log.debug("Saved track item(endDate change) to DB:", item);
                    lastTrackItems[type] = item;
                    deferred.resolve(item);
                }, function () {
                    log.error('Error saving');
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
        log.info('Computer is spleeing, not running saveActiveWindow');
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


    getAppColor(rawItem.app).then(function (color) {
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

    log.debug('Script saveForegroundWindowTitle file: ' + script);

    exec(script, function (error, stdout, stderr) {
        log.debug('Foreground window: ' + stdout);

        if (stderr) {
            log.debug('saveUserIdleTime error: ' + stderr);
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

    SettingsService.find('RUNNING_LOG_ITEM', {cacheResponse: false}).then(function (item) {
        var deferred = $q.defer();
        log.debug("got RUNNING_LOG_ITEM: ", item);
        if (item.refId) {
            TrackItemService.find(item.refId).then(function (logItem) {
                log.debug("resolved log item RUNNING_LOG_ITEM: ", logItem);
                var now = new Date();
                logItem.endDate = now;
                // set first LogTrackItem becouse
                // when restarting application there would be multiple same items
                lastTrackItems.LogTrackItem = logItem;
                createOrUpdate(getRawTrackItem(logItem));
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

    log.debug('Script saveUserIdleTime file: ' + script)

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
    initDb(false);
    log.info('Running background service.');
    setInterval(function () {
        self.saveUserIdleTime();
        self.saveForegroundWindowTitle();
        self.saveRunningLogItem();

    }, BACKGROUND_JOB_INTERVAL);
};


var createTestItem = function (data) {
    var deferred = $q.defer();

    var active = {};

    active.app = 'app1';
    active.title = 'title1';

    var now = new Date();
    var beginDate = new Date();
    //Begin date is always BACKGROUND_JOB_INTERVAL before current date
    beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
    active.beginDate = beginDate;
    active.endDate = now;

    _.merge(active, data);

    log.info('Test: Adding item', active);

    setTimeout(function () {
        log.info("Test: resolving", active)
        saveActiveWindow(active);
        deferred.resolve(active);
    }, BACKGROUND_JOB_INTERVAL);


    return deferred.promise
};


BackgroundService.testSaving = function () {
    initDb(true);

    TrackItemService.destroyAll().then(function () {
        return AppSettingsService.destroyAll();
    }).then(function () {
        return createTestItem();
    }).then(function () {
        return createTestItem();
    }).then(function () {
        trackItemServiceInst.findAll().then(function (items) {
            if (items.length != 1) {
                log.error("!!!!!!!!!!!!!!!!!!!!!!!!Should have 1 trackItem!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }
        });
    }).then(function () {
        return createTestItem({app: 'app2'});
    }).then(function () {
        return createTestItem({app: 'app2'});
    }).then(function () {
        trackItemServiceInst.findAll().then(function (items) {
            if (items.length != 2) {
                log.error("!!!!!!!!!!!!!!!!!!!!!!!!Should have 2 trackItems!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }
        });
    }).then(function () {
        return createTestItem({app: 'app2', title: 'title3'});
    }).then(function () {
        return createTestItem({app: 'app2', title: 'title3'});
    }).then(function () {
        trackItemServiceInst.findAll().then(function (items) {
            if (items.length != 3) {
                log.error("!!!!!!!!!!!!!!!!!!!!!!!!Should have 3 trackItems!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }
        });
    })
        .then(function () {
            trackItemServiceInst.findAll({
                orderBy: [
                    ['beginDate', 'ASC']
                ]
            }).then(function (items) {
                var prevItem;
                var hasCaps = false;
                _.each(items, function (item) {
                    if (!prevItem) {
                        prevItem = item;
                    } else {
                        var diffBetweenItems = prevItem.endDate.getTime() - item.beginDate.getTime();
                        hasCaps = (diffBetweenItems !== 0);
                        prevItem = item;
                    }
                });

                if (hasCaps) {
                    log.error("!!!!!!!!!!!!!!!!!!!!!!!!Should not have date caps!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", hasCaps, items);
                }
            });
        }).then(function () {
            log.info("!!!!!!!!!!!!!!!!!!!!!!!!TEST END!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        });
};


var self = module.exports = BackgroundService;

