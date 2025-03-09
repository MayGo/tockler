import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from '../config';
import { logManager } from '../log-manager';
import * as schema from './schema';
import { appSettings } from './schema';

const logger = logManager.getLogger('Database');

export const db = drizzle(new Database(config.databaseConfig.outputPath), { schema });

// Function to insert default data if it doesn't exist
async function insertDefaultData(db: ReturnType<typeof drizzle>) {
    logger.debug('Checking for default data');

    // Check if ONLINE setting exists
    const onlineSetting = await db.select().from(appSettings).where(eq(appSettings.name, 'ONLINE')).get();
    if (!onlineSetting) {
        logger.debug('Inserting ONLINE default setting');
        await db.insert(appSettings).values({ name: 'ONLINE', color: '#7ed321' });
    }

    // Check if OFFLINE setting exists
    const offlineSetting = await db.select().from(appSettings).where(eq(appSettings.name, 'OFFLINE')).get();
    if (!offlineSetting) {
        logger.debug('Inserting OFFLINE default setting');
        await db.insert(appSettings).values({ name: 'OFFLINE', color: '#f31b1b' });
    }

    // Check if IDLE setting exists
    const idleSetting = await db.select().from(appSettings).where(eq(appSettings.name, 'IDLE')).get();
    if (!idleSetting) {
        logger.debug('Inserting IDLE default setting');
        await db.insert(appSettings).values({ name: 'IDLE', color: '#f5a623' });
    }

    logger.debug('Default data check complete');
}

// Initialize the database connection
export async function connectAndSync() {
    const dbConfig = config.databaseConfig;
    logger.debug('Database dir is:' + dbConfig.outputPath);

    // Create a better-sqlite3 database instance
    const sqlite = new Database(dbConfig.outputPath);

    // Create a drizzle instance using the database connection
    const db = drizzle(sqlite, { schema });

    // Run migrations (if needed)
    try {
        // Use the default migrations folder location
        const migrationsFolder = join(__dirname, 'drizzle', 'migrations');
        logger.debug('Checking migrations at:', migrationsFolder);

        if (!existsSync(migrationsFolder)) {
            logger.error('Could not find migrations folder');
            throw new Error('Could not find migrations folder');
        }

        // Check if the meta directory exists and create it if it doesn't
        const metaDir = join(migrationsFolder, 'meta');
        if (!existsSync(metaDir)) {
            logger.debug('Creating meta directory at:', metaDir);
            mkdirSync(metaDir, { recursive: true });
        }

        // Apply migrations with the default settings
        logger.debug('Running migrations from:', migrationsFolder);
        migrate(db, {
            migrationsFolder,
            migrationsTable: 'drizzle_migrations',
        });

        // Insert default data after migrations complete
        await insertDefaultData(db);

        logger.info('Database connected and migrations applied successfully');
    } catch (error) {
        logger.error('Error connecting to database or applying migrations:', error);
        throw error;
    }
}
