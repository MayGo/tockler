exports.up = function (knex) {
    return knex.schema.table('TrackItems', (table) => {
        table.dateTime('createdAt');
        table.dateTime('updatedAt');
        table.string('userEventId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('TrackItems', (table) => {
        table.dropTimestamps('createdAt');
        table.dropTimestamps('updatedAt');
        table.dropColumn('userEventId');
    });
};
