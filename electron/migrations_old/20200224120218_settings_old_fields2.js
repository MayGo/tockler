exports.up = async function(knex) {
    const updatedAt = await knex.schema.hasColumn('Settings', 'updatedAt');

    return knex.schema.table('Settings', async table => {
        if (updatedAt) {
            await table.dropColumn('updatedAt');
        }
    });
};

exports.down = function() {};
