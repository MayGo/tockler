'use strict';

var electron = require('electron');

var _ = require('lodash');
var fs = require('fs');
var $q = require('q');
var randomcolor = require('randomcolor');

var path = require('path');
var exec = require("child_process").exec;

var emptyItem = {title: 'EMPTY'};

var TrackItemService = null;
var AppSettingsService = null;
var SettingsService = null;


var BackgroundService = {};

var userDir = electron.app.getPath('userData');
var output = fs.createWriteStream(path.join(userDir, 'stdout.log'));
var errorOutput = fs.createWriteStream(path.join(userDir, 'stderr.log'));

// custom simple logger
var logger = new console.Console(output, errorOutput);

//init db
var JSData = require('js-data');
//var DSLevelUpAdapter = require('js-data-levelup');
var DSNedbAdapter = require('js-data-nedb');
var storeDS
var initDb = function (isTesting) {
    console.log('Creating db');

    storeDS = new JSData.DS({
        cacheResponse: false,
        bypassCache: true,
        notify: true,
        keepChangeHistory: true,
        resetHistoryOnInject: true,
        watchChanges: true,
        debug: false
    });

    /*  var adapter = new DSLevelUpAdapter('./db');
     storeDS.registerAdapter('levelup', adapter, { default: true });*/
    var adapter = new DSNedbAdapter();
    storeDS.registerAdapter('nedb', adapter, {default: true});


    console.log('User Dir:' + userDir);
    console.log('Environment:' + process.env.NODE_ENV);

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
var lastIdleTrackItemSaved = null;

// on sleep computer can come out of it just for breif moment, at least mac
var isSleeping = false;

var addInactivePeriod = function (beginDate, endDate) {

    var appTrackItem = {app: 'OFF', title: "Inactive"};
    appTrackItem.taskName = 'StatusTrackItem';
    appTrackItem.color = '#ff0000';
    appTrackItem.beginDate = beginDate;
    appTrackItem.endDate = endDate;
    console.log("Adding inactive trackitem", appTrackItem);

    createOrUpdate(appTrackItem);
}


var isSameItems = function (item1, item2) {
    if (item1 && item2 && item1.app === item2.app && item1.title === item2.title) {
        return true
    }

    return false
};

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
                //console.log("Created color item to DB:", item);
            });
            deferred.resolve(color);
        }
    });
    return deferred.promise;
};

var createOrUpdate = function (appTrackItem) {
    lastIdleTrackItemSaved = null;
    var deferred = $q.defer();

    if (!isSameItems(appTrackItem, lastAppTrackItemSaved)) {

        var promise = $q.when();

        if (lastAppTrackItemSaved) {
            lastAppTrackItemSaved.endDate = appTrackItem.beginDate;
            //console.log("Saving old trackItem:", lastAppTrackItemSaved);
            promise = TrackItemService.update(lastAppTrackItemSaved.id, lastAppTrackItemSaved)
        }

        promise.then(function () {
            appTrackItem.endDate = new Date();
            TrackItemService.create(appTrackItem).then(function (item) {
                console.log("Created track item to DB:", item);
                lastAppTrackItemSaved = item;
                deferred.resolve(item);
            }, function (e) {
                console.log("Error creating", e)
            });
        });

    } else if (isSameItems(appTrackItem, lastAppTrackItemSaved)) {
        lastAppTrackItemSaved.endDate = new Date();
        TrackItemService.update(lastAppTrackItemSaved.id, lastAppTrackItemSaved).then(function (item) {
            //console.log("Saved track item(endDate change) to DB:", item);
            lastAppTrackItemSaved = item;
            deferred.resolve(item);
        }, function () {
            log.error('Error saving');
        });
    } else {
        console.error("Nothing to do with item", appTrackItem);
    }

    return deferred.promise;
}

var addRawTrackItemToList = function (item) {
    // Keep only 3 items in array
    rawItems.unshift(item);
    rawItems.pop();
};

var saveActiveWindow = function (newAppTrackItem) {
    if (isSleeping) {
        console.log('Computer is spleeing, not running saveActiveWindow');
        return;
    }
    if (lastIdleTrackItemSaved !== null) {
        console.log('Not saving');
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
        //console.log("Compare items: " + rawItems[0].title + " - " + rawItems[1].title)
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
        console.log('Computer is spleeing, not running saveIdleTrackItem');
        return;
    }

    if (seconds > IDLE_IN_SECONDS_TO_LOG) {
        if (lastIdleTrackItemSaved) {
            lastIdleTrackItemSaved.endDate = new Date();
            console.log("Saving old idle trackItem:", lastIdleTrackItemSaved);
            TrackItemService.update(lastIdleTrackItemSaved.id, lastIdleTrackItemSaved)
        } else {
            var appTrackItem = {app: 'IDLE', title: ""};
            var beginDate = new Date();
            //Begin date is always BACKGROUND_JOB_INTERVAL before current date
            beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
            appTrackItem.taskName = 'StatusTrackItem';
            appTrackItem.beginDate = beginDate;
            getAppColor(appTrackItem.app).then(function (color) {
                appTrackItem.color = color;

                appTrackItem.endDate = new Date();
                console.log("Adding idle trackitem", appTrackItem);

                TrackItemService.create(appTrackItem).then(function (item) {
                    console.log("Created idle track item to DB:", item);
                    lastIdleTrackItemSaved = item;
                    deferred.resolve(item);
                }, function (e) {
                    console.log("Error creating", e)
                });
            });
        }

    } else {
        lastIdleTrackItemSaved = null;
    }

};


BackgroundService.onSleep = function () {
    isSleeping = true;
};

BackgroundService.onResume = function () {
    addRawTrackItemToList(emptyItem);
    addRawTrackItemToList(emptyItem);
    addRawTrackItemToList(emptyItem);
    if (lastAppTrackItemSaved) {
        addInactivePeriod(lastAppTrackItemSaved.beginDate, new Date());
    } else {
        console.log('No lastAppTrackItemSaved for addInactivePeriod.')
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

    logger.log('Script saveForegroundWindowTitle file: ' + script);

    exec(script, function (error, stdout, stderr) {
        logger.log('saveForegroundWindowTitle: ' + stdout);

        if (stderr) {
            logger.log('saveUserIdleTime error: ' + stderr);
        }

        var active = {};
        var active_a = stdout.split(",");

        if (typeof active_a[0] !== "undefined") {
            active.app = active_a[0];
        }

        if (typeof active_a[1] !== "undefined") {
            active.title = active_a[1].replace(/\n$/, "").replace(/^\s/, "");
        }

        //console.log(active);
        var now = new Date();
        var beginDate = new Date();
        //Begin date is always BACKGROUND_JOB_INTERVAL before current date
        beginDate.setMilliseconds(beginDate.getMilliseconds() - BACKGROUND_JOB_INTERVAL);
        active.beginDate = beginDate;
        active.endDate = now;

        //console.log("Active item:", active);

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

    logger.log('Script saveUserIdleTime file: ' + script)

    return exec(script, function (error, stdout, stderr) {
        logger.log('saveUserIdleTime: ' + stdout);
        if (stderr) {
            logger.log('saveUserIdleTime error: ' + stderr);
        }

        var seconds = stdout;

        //console.log('Idle:' + seconds);
        saveIdleTrackItem(seconds);
    });
};

BackgroundService.init = function () {
    initDb(false);
    console.log('Running background service.');
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

    console.log('Test: Adding item', active);

    setTimeout(function () {
        console.log("Test: resolving", active)
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
                console.error("!!!!!!!!!!!!!!!!!!!!!!!!Should have 1 trackItem!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }
        });
    }).then(function () {
        return createTestItem({app: 'app2'});
    }).then(function () {
        return createTestItem({app: 'app2'});
    }).then(function () {
        trackItemServiceInst.findAll().then(function (items) {
            if (items.length != 2) {
                console.error("!!!!!!!!!!!!!!!!!!!!!!!!Should have 2 trackItems!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }
        });
    }).then(function () {
        return createTestItem({app: 'app2', title: 'title3'});
    }).then(function () {
        return createTestItem({app: 'app2', title: 'title3'});
    }).then(function () {
            trackItemServiceInst.findAll().then(function (items) {
                if (items.length != 3) {
                    console.error("!!!!!!!!!!!!!!!!!!!!!!!!Should have 3 trackItems!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
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
                    console.error("!!!!!!!!!!!!!!!!!!!!!!!!Should not have date caps!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", hasCaps, items);
                }
            });
        }).then(function () {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!TEST END!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    });
};


var self = module.exports = BackgroundService;

