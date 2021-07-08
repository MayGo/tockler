exports.up = function (knex) {
    return Promise.all(
        [
            knex.schema.createTable('Blacklist', (table) => {
                table.increments('id').notNullable();
                table.dateTime('createdAt').notNullable();
                table.dateTime('updatedAt').notNullable();
                table.string('app');
                table.string('title');
                table.string('url');
            }),
            knex.schema.createTable('Whitelist', (table) => {
                table.increments('id').notNullable();
                table.dateTime('createdAt').notNullable();
                table.dateTime('updatedAt').notNullable();
                table.string('app');
                table.string('title');
                table.string('url');
            }),
        ].map((p) => p.catch(console.error)),
    );
};

exports.down = function (knex) {
    return Promise.all([knex.schema.dropTable('Whitelist'), knex.schema.dropTable('Blacklist')]);
};
