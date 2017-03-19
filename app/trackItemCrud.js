const TrackItem = require('./db').TrackItem;
var $q = require('q');
var moment = require('moment');
/**
 * Module
 */

module.exports.findAllItems = function (from, to, taskName, searchStr, paging) {
    'use strict';

    var order = paging.order || 'beginDate';
    var orderSort = paging.orderSort || 'ASC';
    if (order.startsWith('-')) {
        order = order.substring(1);
        orderSort = 'DESC';
    }
    var limit = paging.limit || 10;
    var offset = paging.offset || 0;
    if (paging.page) {
        offset = (paging.page - 1) * limit;
    }

    var where = {
        endDate: {
            $gte: from,
            $lt: to
        },
        taskName: taskName
    };

    if (searchStr) {
        where.title = {
            $like: '%' + searchStr + '%'
        }
    }
    return TrackItem.findAndCountAll({
            where: where,
            raw: false,
            limit: limit,
            offset: offset,
            order: [
                [order, orderSort]
            ]
        }
    );
};


module.exports.findAllDayItems = function (from, to, taskName) {
    'use strict';
    return TrackItem.findAll({
            where: {
                endDate: {
                    $gte: from,
                    $lte: to
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

    var to = moment(day).add(1, 'days');
    console.log('findAllFromDay ' + taskName + ' from:' + day + ', to:' + to.toDate());

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

module.exports.findLastOnlineItem = function () {
    'use strict';

    //ONLINE item can be just inserted, we want old one.
    // 2 seconds should be enough
    let beginDate = moment().subtract(5, 'seconds').toDate();

    return TrackItem.findAll({
            where: {
                app: 'ONLINE',
                beginDate: {
                    $lte: beginDate
                },
                taskName: 'StatusTrackItem'
            },
            limit: 1,
            order: [
                ['endDate', 'DESC']
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
        console.error("Item not created.", error)
    });


    return deferred.promise;
};

module.exports.updateItem = function (itemData) {
    'use strict';

    var deferred = $q.defer();
    TrackItem.update({
        app: itemData.app,
        title: itemData.title,
        color: itemData.color,
        beginDate: itemData.beginDate,
        endDate: itemData.endDate
    }, {
        fields: ['beginDate', 'endDate', 'app', 'title', 'color'],
        where: {id: itemData.id}
    }).then(function () {
        //console.log("Saved track item to DB:", itemData.id);
        deferred.resolve(itemData);
    }).catch(function (error) {
        console.error("Item not updated.", error)
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
    }).catch(function (error) {
        console.error("Color not updated.", error)
    });
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
        console.error("Item not updated with now", error)
    });
    return deferred.promise;
};

module.exports.deleteById = function (id) {
    'use strict';
    var deferred = $q.defer();

    TrackItem.destroy({
        where: {id: id}
    }).then(function () {
        console.log("Deleted track item with ID:", id);
        deferred.resolve(id);
    }).catch(function (error) {
        console.error("Item not deleted", error)
    });
    return deferred.promise;
};
module.exports.deleteByIds = function (ids) {
    'use strict';
    var deferred = $q.defer();

    TrackItem.destroy({
        where: {
            id: {
                $in: ids
            }
        }
    }).then(function () {
        console.log("Deleted track items with IDs:", ids);
        deferred.resolve(ids);
    }).catch(function (error) {
        console.error("Items not deleted", error)
    });
    return deferred.promise;
};

const {ipcMain} = require('electron');

ipcMain.on('TIMELINE_LOAD_DAY_REQUEST', function (event, startDate, taskName) {
    console.log('TIMELINE_LOAD_DAY_REQUEST', startDate, taskName);
    module.exports.findAllFromDay(startDate, taskName).then((items)=>event.sender.send('TIMELINE_LOAD_DAY_RESPONSE', startDate, taskName, items))
});
