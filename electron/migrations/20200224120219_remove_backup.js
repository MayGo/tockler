exports.up = async function(knex) {
    const hasBackupTable = await knex.schema.hasTable('TrackItems_backup');

    if (hasBackupTable) {
        await knex.schema.dropTable('TrackItems_backup');
    }

    return true;
};

exports.down = function() {};
