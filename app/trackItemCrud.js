const TrackItem = require('./db').TrackItem;
var $q = require('q');
/**
 * Module
 */
module.exports.findOrCreate = function (label, callback) {
    'use strict';
    if (!label) {
        return callback("Null tag not saved.");
    }

    var q = {
        label: label
    };

    TrackItem.findOne(q, function (err, ftag) {
        if (err) return callback(err);
        if (!ftag) {
            TrackItem.save(q, function (err, saved) {
                if (err) return callback(err);
                callback(null, saved);
            });
        } else {
            callback(err, ftag);
        }
    });
};

module.exports.findAllDayItems = function (to, from, taskName) {
    'use strict';
    var deferred = $q.defer();
    TrackItem.find({
            endDate: {
                $gte: to,
                $lte: from
            },
            taskName: taskName

        }
    ).sort({beginDate: 1}).exec(function (err, items) {
            deferred.resolve(items);
        });
    return deferred.promise;
};

module.exports.createOrUpdate = function (itemData) {
    'use strict';

    var deferred = $q.defer();
    TrackItem.save([itemData], function (err, item) {
        //console.log(err)
        console.log("Saved track item to DB:", item);
        deferred.resolve(item);
    });

    return deferred.promise;
};