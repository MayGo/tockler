exports.up = async function(knex) {
    const createdAt = await knex.schema.hasColumn('Settings', 'createdAt');
    const updatedAt = await knex.schema.hasColumn('Settings', 'updatedAt');

    return knex.schema.table('Settings', async table => {
        if (createdAt) {
            await table.dropColumn('createdAt');
        }

        if (updatedAt) {
            await table.dropColumn('updatedAt');
        }
    });
};

exports.down = function() {};
