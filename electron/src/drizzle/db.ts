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

// Create SQLite connection with performance optimizations
const sqlite = new Database(config.databaseConfig.outputPath, {
    verbose: process.env['NODE_ENV'] === 'development' ? console.log : undefined,
});

// Apply performance optimizations
sqlite.pragma('journal_mode = WAL'); // Use Write-Ahead Logging for better concurrency
sqlite.pragma('synchronous = NORMAL'); // Reduce synchronous disk writes (balance between safety and speed)
sqlite.pragma('cache_size = -64000'); // 64MB page cache (negative means kibibytes)
sqlite.pragma('foreign_keys = ON'); // Ensure data integrity
sqlite.pragma('temp_store = MEMORY'); // Store temporary tables and indices in memory
sqlite.pragma('mmap_size = 1000000000'); // 1GB memory-mapped I/O (more reasonable for desktop applications)

export const db = drizzle(sqlite, { schema });

// Prepared statements for common queries to improve performance
export const preparedStatements = {
    // TrackItems prepared statements
    getTrackItemById: sqlite.prepare('SELECT * FROM TrackItems WHERE id = ?'),
    getLatestTrackItems: sqlite.prepare('SELECT * FROM TrackItems ORDER BY beginDate DESC LIMIT ?'),
    deleteTrackItemById: sqlite.prepare('DELETE FROM TrackItems WHERE id = ?'),
    deleteTrackItemsByApp: sqlite.prepare('DELETE FROM TrackItems WHERE app = ?'),
    updateTrackItemColor: sqlite.prepare('UPDATE TrackItems SET color = ? WHERE app = ?'),

    // AppSettings prepared statements
    getAppSettingByName: sqlite.prepare('SELECT * FROM AppSettings WHERE name = ? LIMIT 1'),

    // Settings prepared statements
    getSettingByName: sqlite.prepare('SELECT * FROM Settings WHERE name = ? LIMIT 1'),
};

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

// Check if knex migration tables exist
function checkForKnexMigrationTables(): boolean {
    logger.debug('Checking for knex migration tables');

    try {
        // Check if knex_migrations table exists
        const knexMigrationsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knex_migrations'")
            .get();

        // Check if knex_migrations_lock table exists
        const knexMigrationsLockExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knex_migrations_lock'")
            .get();

        const tablesExist = !!knexMigrationsExist && !!knexMigrationsLockExist;
        logger.debug(`Knex migration tables exist: ${tablesExist}`);

        return tablesExist;
    } catch (error) {
        logger.error('Error checking for knex migration tables:', error);
        return false;
    }
}

// Function to check if application tables already exist
function checkIfAppTablesExist(): boolean {
    logger.debug('Checking if application tables already exist');

    try {
        // Check for essential tables
        const trackItemsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TrackItems'")
            .get();

        const appSettingsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='AppSettings'")
            .get();

        const settingsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Settings'")
            .get();

        const tablesExist = !!trackItemsExist && !!appSettingsExist && !!settingsExist;
        logger.debug(`Application tables exist: ${tablesExist}`);

        return tablesExist;
    } catch (error) {
        logger.error('Error checking for application tables:', error);
        return false;
    }
}

// Function to remove knex migration tables
function removeKnexMigrationTables(): void {
    logger.debug('Removing knex migration tables');

    try {
        sqlite.prepare('DROP TABLE IF EXISTS knex_migrations').run();
        sqlite.prepare('DROP TABLE IF EXISTS knex_migrations_lock').run();
        logger.debug('Knex migration tables removed successfully');
    } catch (error) {
        logger.error('Error removing knex migration tables:', error);
    }
}

// Helper function for efficient transactions
export function runInTransaction<T>(callback: () => T): T {
    // Start transaction
    sqlite.prepare('BEGIN').run();

    try {
        // Run callback function within transaction
        const result = callback();

        // If we've made it this far without errors, commit the transaction
        sqlite.prepare('COMMIT').run();

        return result;
    } catch (error) {
        // If there's an error, roll back the transaction
        sqlite.prepare('ROLLBACK').run();
        throw error;
    }
}

// Initialize the database connection
export async function connectAndSync() {
    const dbConfig = config.databaseConfig;
    logger.debug('Database dir is:' + dbConfig.outputPath);

    // Create a better-sqlite3 database instance

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

        // Check for knex migration tables
        const hasKnexTables = checkForKnexMigrationTables();
        const hasAppTables = checkIfAppTablesExist();

        // Apply migrations with the default settings
        logger.debug('Running migrations from:', migrationsFolder);

        if (hasKnexTables && hasAppTables) {
            logger.info('Knex migration tables found and app tables already exist. Skipping initial migration.');

            // Create drizzle_migrations table if it doesn't exist
            sqlite
                .prepare(
                    `
                CREATE TABLE IF NOT EXISTS drizzle_migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    hash TEXT NOT NULL,
                    created_at INTEGER
                )
            `,
                )
                .run();

            // Get migration file names from the migrations folder
            const fs = require('fs');
            const initialMigrationFiles = fs
                .readdirSync(migrationsFolder)
                .filter((file: string) => file.endsWith('.sql'))
                .sort();

            // Get the initial migration file name (0000_*.sql)
            const initialMigrationFile = initialMigrationFiles.find((file: string) => file.startsWith('0000_'));

            if (initialMigrationFile) {
                // Extract migration tag (without .sql extension)
                const migrationTag = initialMigrationFile.replace('.sql', '');

                // Check if this migration is already marked as applied
                const existingMigration = sqlite
                    .prepare('SELECT * FROM drizzle_migrations WHERE hash = ?')
                    .get(migrationTag);

                if (!existingMigration) {
                    // Mark the initial migration as applied
                    sqlite
                        .prepare('INSERT INTO drizzle_migrations (hash, created_at) VALUES (?, ?)')
                        .run(migrationTag, Date.now());

                    logger.debug(`Marked initial migration "${migrationTag}" as applied`);
                }
            }

            // Remove knex tables as they're no longer needed
            removeKnexMigrationTables();
        }

        // Run migrations - this will skip already applied migrations
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
