import config from '../config';

const { Model } = require('objection');
import * as Knex from 'knex';
import { logManager } from '../log-manager';

let logger = logManager.getLogger('Database');

export async function connectAndSync() {
    let dbConfig = config.databaseConfig;
    logger.debug('Database dir is:' + dbConfig.outputPath);

    // Initialize knex.
    const knex = Knex({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: dbConfig.outputPath,
            database: dbConfig.database,
            user: dbConfig.username,
            password: dbConfig.password,
        },
    });

    // Give the knex instance to objection.
    Model.knex(knex);

    await knex.migrate.latest({ loadExtensions: ['.js'] });
}
