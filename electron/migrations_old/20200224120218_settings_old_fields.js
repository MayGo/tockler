exports.up = async function(knex) {
    const createdAt = await knex.schema.hasColumn('Settings', 'createdAt');

    return knex.schema.table('Settings', async table => {
        if (createdAt) {
            await table.dropColumn('createdAt');
        }
    });
};

exports.down = function() {};
