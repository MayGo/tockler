const TrackItem = require('./db').TrackItem;
var $q = require('q');
var moment = require('moment');
/**
 * Module
 */

module.exports.findAllDayItems = function (to, from, taskName) {
    'use strict';
    return TrackItem.findAll({
            where: {
                endDate: {
                    $gte: to,
                    $lte: from
                },
                taskName: taskName
            },
            raw: true,
            order: [
                ['beginDate', 'ASC']
            ]
        }
    );
};

module.exports.findAllFromDay = function (day, taskName) {
    'use strict';

    var to = moment(day).add(1, 'days')
    console.log('findAllFromDay ' + taskName + ' from:' + day + ', to:' + to);

    return module.exports.findAllDayItems(day, to.toDate(), taskName);
};

module.exports.findFirstLogItems = function () {
    'use strict';
    return TrackItem.findAll({
            where: {
                taskName: 'LogTrackItem'
            },
            limit: 10,
            order: [
                ['beginDate', 'DESC']
            ]
        }
    );
};

module.exports.createItem = function (itemData) {
    'use strict';

    var deferred = $q.defer();

    TrackItem.create(itemData).then(function (item) {
        //console.log("Created track item to DB:", item.id);
        deferred.resolve(item);
    }).catch(function (error) {
        console.error(error)
    });


    return deferred.promise;
};

module.exports.updateItem = function (itemData) {
    'use strict';

    var deferred = $q.defer();
    TrackItem.update({
        beginDate: itemData.beginDate,
        endDate: itemData.endDate
    }, {
        fields: ['beginDate', 'endDate'],
        where: {id: itemData.id}
    }).then(function () {
        //console.log("Saved track item to DB:", itemData.id);
        deferred.resolve(itemData);
    }).catch(function (error) {
        console.error(error)
    });


    return deferred.promise;
};

module.exports.updateColorForApp = function (appName, color) {
    'use strict';

    console.log("Updating app color:", appName, color);

    return TrackItem.update({color: color}, {
        fields: ['color'],
        where: {
            app: appName
        }
    })
};

module.exports.findById = function (id) {
    'use strict';

    return TrackItem.findById(id);
};

module.exports.updateEndDateWithNow = function (id) {
    'use strict';
    var deferred = $q.defer();

    TrackItem.update({
        endDate: new Date()
    }, {
        fields: ['endDate'],
        where: {id: id}
    }).then(function () {
        console.log("Saved track item to DB with now:", id);
        deferred.resolve(id);
    }).catch(function (error) {
        console.error(error)
    });
    return deferred.promise;
};