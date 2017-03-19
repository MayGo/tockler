const Settings = require('./db').Settings;
const TrackItemCrud = require('./TrackItemCrud');

var $q = require('q');
/**
 * Module
 */

module.exports.findByName = function (name) {
    'use strict';
    var deferred = $q.defer();
    Settings.findCreateFind({
        where: {
            name: name
        }
    }).then(function (items) {
            var item = items[0];
            item.jsonDataParsed = JSON.parse(item.jsonData);
            deferred.resolve(item);
        }
    );
    return deferred.promise;
};

module.exports.updateByName = function (name, jsonData) {
    'use strict';

    return Settings.update({jsonData: JSON.stringify(jsonData)}, {
            where: {
                name: name
            }
        }
    )
};

module.exports.fetchWorkSettings = function () {
    'use strict';
    var deferred = $q.defer();
    module.exports.findByName('WORK_SETTINGS').then(function (item) {
        //console.log('Fetched work item:', item);
        deferred.resolve(item.jsonDataParsed)
    });
    return deferred.promise;
};

module.exports.fetchAnalyserSettings = function () {
    'use strict';
    var deferred = $q.defer();
    module.exports.findByName('ANALYSER_SETTINGS').then(function (item) {
        //console.log('Fetched analyser item:', item);
        deferred.resolve(item.jsonDataParsed)
    });
    return deferred.promise;
};

module.exports.getRunningLogItem = function () {
    'use strict';
    var deferred = $q.defer();
    //console.log("Fetch RUNNING_LOG_ITEM. ");
    module.exports.findByName('RUNNING_LOG_ITEM').then(function (item) {

        //console.log("got RUNNING_LOG_ITEM: ", item);
        if (item.jsonDataParsed.id) {
            TrackItemCrud.findById(item.jsonDataParsed.id).then(function (logItem) {
                //console.log("resolved log item RUNNING_LOG_ITEM: ", logItem);
                deferred.resolve(logItem)
            })
        } else {
            console.log("No RUNNING_LOG_ITEM ref id");
            deferred.resolve();
        }
    });

    return deferred.promise;
};

module.exports.saveRunningLogItemReferemce = function (logItemId) {
    'use strict';
    module.exports.updateByName('RUNNING_LOG_ITEM', {id: logItemId}).then(function (item) {
        console.log("Updated RUNNING_LOG_ITEM!", item);
    });
    if (logItemId) {
        //Lets update items end date
        TrackItemCrud.updateEndDateWithNow(logItemId).then(function (item) {
            console.log("Updated log item to DB:", item);
        });
    }
};