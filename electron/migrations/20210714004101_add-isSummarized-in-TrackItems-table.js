exports.up = function (knex) {
    return knex.schema.table('TrackItems', (table) => {
        table.boolean('isSummarized').defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('TrackItems', (table) => {
        table.dropColumn('isSummarized');
    });
};
