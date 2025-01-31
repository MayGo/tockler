import { config } from '../config';
import { Model } from 'objection';
import { knex } from 'knex';
import { logManager } from '../log-manager';
import { WebpackMigrationSource } from './WebpackMigrationSource';

let logger = logManager.getLogger('Database');

export async function connectAndSync() {
    let dbConfig = config.databaseConfig;
    logger.debug('Database dir is:' + dbConfig.outputPath);

    const knexInstance = knex({
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
    Model.knex(knexInstance);

    await knexInstance.migrate.latest({
        migrationSource: new WebpackMigrationSource(require.context('../../migrations', true, /.js$/)),
    });
    return knexInstance;
}
