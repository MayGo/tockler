exports.up = function(knex) {
    return knex.schema.raw(
        "update TrackItems set beginDate = CAST(strftime('%s000', beginDate) AS INT), endDate = CAST(strftime('%s000', endDate) AS INT)  where CAST(strftime('%s000', beginDate) AS INT) IS NOT NULL",
    );
};

exports.down = function(knex) {};
