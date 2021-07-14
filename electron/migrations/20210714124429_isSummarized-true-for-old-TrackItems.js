exports.up = function (knex) {
    return knex('TrackItems').update({
        isSummarized: true,
    });
};

exports.down = function (knex) {};
