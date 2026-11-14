import { Database } from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const logger = console;

export const MIGRATIONS_TABLE = 'drizzle_migrations';

interface JournalEntry {
    tag: string;
    when: number;
}

const isJournalEntry = (value: unknown): value is JournalEntry =>
    typeof value === 'object' &&
    value !== null &&
    'tag' in value &&
    typeof value.tag === 'string' &&
    'when' in value &&
    typeof value.when === 'number';

export function readJournal(migrationsFolder: string): JournalEntry[] {
    const journal: unknown = JSON.parse(readFileSync(join(migrationsFolder, 'meta', '_journal.json'), 'utf8'));

    if (
        typeof journal !== 'object' ||
        journal === null ||
        !('entries' in journal) ||
        !Array.isArray(journal.entries) ||
        !journal.entries.every(isJournalEntry)
    ) {
        throw new Error(`Invalid migrations journal in ${migrationsFolder}`);
    }

    return journal.entries;
}

const tableExists = (sqlite: Database, name: string) =>
    !!sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(name);

/**
 * Databases from the knex-based releases already contain the tables that the first drizzle migration creates.
 * Record that migration as applied so drizzle doesn't try to create them again, then drop the knex tables.
 */
function adoptKnexDatabase(sqlite: Database, baseline: JournalEntry) {
    const hasKnexTables = tableExists(sqlite, 'knex_migrations') && tableExists(sqlite, 'knex_migrations_lock');
    const hasAppTables = ['TrackItems', 'AppSettings', 'Settings'].every((table) => tableExists(sqlite, table));

    if (!hasKnexTables || !hasAppTables) {
        return;
    }

    logger.info('Knex database found. Marking the initial drizzle migration as applied.');

    sqlite
        .prepare(
            `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hash TEXT NOT NULL,
                created_at INTEGER
            )`,
        )
        .run();

    const alreadyMarked = sqlite.prepare(`SELECT 1 FROM ${MIGRATIONS_TABLE} WHERE hash = ?`).get(baseline.tag);
    if (!alreadyMarked) {
        // created_at must be the migration's own timestamp: drizzle only applies migrations newer than the latest row.
        sqlite
            .prepare(`INSERT INTO ${MIGRATIONS_TABLE} (hash, created_at) VALUES (?, ?)`)
            .run(baseline.tag, baseline.when);
    }

    sqlite.prepare('DROP TABLE IF EXISTS knex_migrations').run();
    sqlite.prepare('DROP TABLE IF EXISTS knex_migrations_lock').run();
}

/**
 * Earlier 4.x builds recorded the adopted baseline with created_at = Date.now(). Drizzle skips every migration
 * older than the latest created_at, so migrations generated before that moment never ran on those databases.
 * Resetting the row to the baseline's own timestamp lets them run.
 */
function repairBaselineTimestamp(sqlite: Database, baseline: JournalEntry) {
    if (!tableExists(sqlite, MIGRATIONS_TABLE)) {
        return;
    }

    const { changes } = sqlite
        .prepare(`UPDATE ${MIGRATIONS_TABLE} SET created_at = ? WHERE hash = ? AND created_at <> ?`)
        .run(baseline.when, baseline.tag, baseline.when);

    if (changes > 0) {
        logger.info(`Reset timestamp of adopted baseline migration ${baseline.tag} so later migrations can run.`);
    }
}

/** Run before drizzle's `migrate()`. */
export function prepareLegacyMigrations(sqlite: Database, migrationsFolder: string) {
    const [baseline] = readJournal(migrationsFolder);
    if (!baseline) {
        return;
    }

    adoptKnexDatabase(sqlite, baseline);
    repairBaselineTimestamp(sqlite, baseline);
}
