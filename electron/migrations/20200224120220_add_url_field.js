exports.up = async function (knex) {
    return knex.schema.table('TrackItems', function (table) {
        table.string('url', 255);
    });
};

exports.down = function () {};
