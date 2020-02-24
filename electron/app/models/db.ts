import config from '../config';
import { Model } from 'objection';
import * as Knex from 'knex';
import { logManager } from '../log-manager';
import { WebpackMigrationSource } from 'knex-webpack-migration-source';

let logger = logManager.getLogger('Database');

export async function connectAndSync() {
    let dbConfig = config.databaseConfig;
    logger.debug('Database dir is2:' + dbConfig.outputPath);

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

    await knex.migrate.latest({
        migrationSource: new WebpackMigrationSource(
            require.context('../../migrations', true, /.js$/),
        ),
    });
}
