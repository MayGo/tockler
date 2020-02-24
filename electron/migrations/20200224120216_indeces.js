exports.up = function(knex) {
    return knex.schema
        .raw('CREATE INDEX IF NOT EXISTS app_settings_name ON AppSettings (name)')
        .raw('CREATE INDEX IF NOT EXISTS settings_name ON Settings (name)')
        .raw('CREATE INDEX IF NOT EXISTS track_items_begin_date ON TrackItems (beginDate)')
        .raw('CREATE INDEX IF NOT EXISTS track_items_end_date ON TrackItems (endDate)')
        .raw('CREATE INDEX IF NOT EXISTS track_items_task_name ON TrackItems (taskName)');
};

exports.down = function(knex) {};
