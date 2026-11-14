import { Database } from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { appSettings } from '../schema';
import { db, migrationsPath, sqlite } from './db';
import { MIGRATIONS_TABLE, prepareLegacyMigrations } from './legacyMigrations';

const logger = console;

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
export async function connectAndSync(sqlite: Database, db: ReturnType<typeof drizzle>) {
    // Run migrations (if needed)
    try {
        const migrationsFolder = migrationsPath;
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

        prepareLegacyMigrations(sqlite, migrationsFolder);

        // Run migrations - this will skip already applied migrations
        migrate(db, {
            migrationsFolder,
            migrationsTable: MIGRATIONS_TABLE,
        });

        // Insert default data after migrations complete
        await insertDefaultData(db);

        logger.info('Database connected and migrations applied successfully');
    } catch (error) {
        logger.error('Error connecting to database or applying migrations:', error);
        throw error;
    }
}

export const initDb = async () => {
    await connectAndSync(sqlite, db);
};

export const closeDb = async () => {
    await sqlite.close();
};

export const dbService = {
    initDb,
    closeDb,
};

export type DbService = typeof dbService;
