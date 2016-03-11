'use strict';

var app = require('electron').app;

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


var rawItems = [emptyItem, emptyItem, emptyItem];

var BACKGROUND_JOB_INTERVAL = 3000;

var lastAppTrackItemSaved = null;
var lastStatusTrackItemSaved = null;

// on sleep computer can come out of it just for breif moment, at least mac
var isSleeping = false;

var addInactivePeriod = function (beginDate, endDate) {

    var appTrackItem = {app: 'OFF', title: "Inactive"};
    appTrackItem.taskName = 'StatusTrackItem';
    appTrackItem.color = '#ff0000';
    appTrackItem.beginDate = beginDate;
    appTrackItem.endDate = endDate;
    log.info("Adding inactive trackitem", appTrackItem);
    createOrUpdate(appTrackItem);
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

var createOrUpdate = function (appTrackItem) {

    var deferred = $q.when();
    if (shouldSplitInTwoOnMidnight(appTrackItem.beginDate, appTrackItem.endDate)) {
        log.info('its midnight');
        var almostMidnight = moment(appTrackItem.beginDate).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();
        var afterMidnight = dateToAfterMidnight(appTrackItem.beginDate);
        var originalEndDate = appTrackItem.endDate;

        log.debug('Midnight- almostMidnight: ' + almostMidnight + ', ' + afterMidnight);
        appTrackItem.endDate = almostMidnight;
        createOrUpdate(appTrackItem).then(function (item1) {
            lastAppTrackItemSaved = null;
            log.debug('Midnight- Saved one: ' + item1);
            item1.beginDate = afterMidnight;
            item1.endDate = originalEndDate;
            log.debug('Midnight- Saving second: ' + item1);
            createOrUpdate(item1).then(function (item2) {
                log.debug('Midnight- Saved second: ' + item2);
                deferred.resolve(item2);
            });
        });
    } else {
        deferred.then(function () {

            if (!isSameItems(appTrackItem, lastAppTrackItemSaved)) {

                var promise = $q.when();

                if (lastAppTrackItemSaved) {
                    lastAppTrackItemSaved.endDate = appTrackItem.beginDate;
                    log.debug("Saving old trackItem:", lastAppTrackItemSaved);
                    promise = TrackItemService.update(lastAppTrackItemSaved.id, lastAppTrackItemSaved)
                }

                promise.then(function () {
                    appTrackItem.endDate = new Date();
                    TrackItemService.create(appTrackItem).then(function (item) {
                        log.debug("Created track item to DB:", item);
                        lastAppTrackItemSaved = item;
                        deferred.resolve(item);
                    }, function (e) {
                        log.error("Error creating", e)
                    });
                });

            } else if (isSameItems(appTrackItem, lastAppTrackItemSaved)) {
                lastAppTrackItemSaved.endDate = new Date();
                TrackItemService.update(lastAppTrackItemSaved.id, lastAppTrackItemSaved).then(function (item) {
                    log.debug("Saved track item(endDate change) to DB:", item);
                    lastAppTrackItemSaved = item;
                    deferred.resolve(item);
                }, function () {
                    log.error('Error saving');
                });
            } else {
                log.error("Nothing to do with item", appTrackItem);
            }
        })
    }


    return deferred;
}

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
    if (lastStatusTrackItemSaved !== null && lastStatusTrackItemSaved.app === 'IDLE') {
        log.info('Not saving');
        //addRawTrackItemToList(emptyItem);
        lastAppTrackItemSaved = null;
        return
    }

    if (!newAppTrackItem.title && !newAppTrackItem.app) {
        // Lock screen have no title, maybe something
        newAppTrackItem.app = 'NATIVE';
        newAppTrackItem.taskName = 'AppTrackItem';
        newAppTrackItem.color = '#ff6700';
        newAppTrackItem.title = 'NO_TITLE';
    } else {
        newAppTrackItem.taskName = 'AppTrackItem';
    }


    getAppColor(newAppTrackItem.app).then(function (color) {
        newAppTrackItem.color = color;
        addRawTrackItemToList(newAppTrackItem);


        createOrUpdate(rawItems[0]);
        //has two same items in list
        //log.info("Compare items: " + rawItems[0].title + " - " + rawItems[1].title)
        /*if (isSameItems(rawItems[0], rawItems[1])) {
         rawItems[0].beginDate = rawItems[1].beginDate;
         createOrUpdate(rawItems[0])
         } else if (isSameItems(rawItems[0], rawItems[2])) {
         // There is one different item in between, eg:tab switching
         //bug: enddate before begindate
         // rawItems[0].beginDate = rawItems[2].beginDate;
         // createOrUpdate(rawItems[0])
         }*/

    })
};

var IDLE_IN_SECONDS_TO_LOG = 60 * 1;

/**
 *
 * @param seconds
 * @returns
 */
var saveIdleTrackItem = function (seconds) {

    if (isSleeping) {
        log.info('Computer is spleeing, not running saveIdleTrackItem');
        return;
    }

    var appName = (seconds > IDLE_IN_SECONDS_TO_LOG) ? 'IDLE' : 'ONLINE';
    var isSplitting = (lastStatusTrackItemSaved) ? shouldSplitInTwoOnMidnight(lastStatusTrackItemSaved.beginDate, new Date()) : false;
    var afterMidnight = (lastStatusTrackItemSaved) ? dateToAfterMidnight(lastStatusTrackItemSaved.beginDate) : null;
    if (isSplitting) {
        log.info('midnight in status');
        var almostMidnight = moment(lastStatusTrackItemSaved.beginDate).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();

        log.debug('Midnight status - almostMidnight: ' + almostMidnight + ', ' + afterMidnight);
        lastStatusTrackItemSaved.endDate = almostMidnight;
        TrackItemService.update(lastStatusTrackItemSaved.id, lastStatusTrackItemSaved);
        lastStatusTrackItemSaved = null;
    }

    if (lastStatusTrackItemSaved && lastStatusTrackItemSaved.app === appName) {
        lastStatusTrackItemSaved.endDate = new Date();
        log.debug("Saving old status trackItem:", lastStatusTrackItemSaved);
        TrackItemService.update(lastStatusTrackItemSaved.id, lastStatusTrackItemSaved)
    } else {
        var appTrackItem = {app: appName, title: ""};
        var beginDate = new Date();
        //Begin date is always BACKGROUND_JOB_INTERVAL before current date
        beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
        if (isSplitting) {
            beginDate = afterMidnight;
            log.debug('Midnight status - is splitting: ' + almostMidnight);
        }
        appTrackItem.taskName = 'StatusTrackItem';
        appTrackItem.beginDate = beginDate;
        getAppColor(appTrackItem.app).then(function (color) {
            appTrackItem.color = color;

            appTrackItem.endDate = new Date();
            log.info("Adding status trackitem", appTrackItem);

            TrackItemService.create(appTrackItem).then(function (item) {
                log.info("Created status track item to DB:", item);
                lastStatusTrackItemSaved = item;
                deferred.resolve(item);
            }, function (e) {
                log.info("Error creating", e)
            });
        });
    }

};


BackgroundService.onSleep = function () {
    isSleeping = true;
    lastStatusTrackItemSaved = null;
    lastAppTrackItemSaved = null;
};

BackgroundService.onResume = function () {
    addRawTrackItemToList(emptyItem);
    addRawTrackItemToList(emptyItem);
    addRawTrackItemToList(emptyItem);
    if (lastAppTrackItemSaved) {
        addInactivePeriod(lastAppTrackItemSaved.beginDate, new Date());
    } else {
        log.info('No lastAppTrackItemSaved for addInactivePeriod.')
    }
    isSleeping = false;
};

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
        log.debug('saveForegroundWindowTitle: ' + stdout);

        if (stderr) {
            log.debug('saveUserIdleTime error: ' + stderr);
        }

        var active = {};
        var active_a = stdout.split(",");

        if (typeof active_a[0] !== "undefined") {
            active.app = active_a[0];
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

        log.debug("Active item:", active);

        saveActiveWindow(active);
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
        log.debug('saveUserIdleTime: ' + stdout);
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
        //don't save window title if is idling
        self.saveUserIdleTime();
        self.saveForegroundWindowTitle();

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
}
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

