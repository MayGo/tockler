exports.up = function (knex) {
    return knex.schema.createTable('Logs', (table) => {
        table.increments('id').notNullable();
        table.dateTime('createdAt').notNullable();
        table.dateTime('updatedAt').notNullable();
        table.string('type').notNullable();
        table.string('message');
        table.string('jsonData');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('Logs');
};
