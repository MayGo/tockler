import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MIGRATIONS_TABLE, prepareLegacyMigrations, readJournal } from '../drizzle/worker/legacyMigrations';

const migrationsFolder = join(__dirname, '../drizzle/migrations');
const [baseline] = readJournal(migrationsFolder);

const runMigrations = (sqlite: Database.Database) => {
    prepareLegacyMigrations(sqlite, migrationsFolder);
    migrate(drizzle(sqlite), { migrationsFolder, migrationsTable: MIGRATIONS_TABLE });
};

const runSqlFile = (sqlite: Database.Database, tag: string) => {
    const statements = readFileSync(join(migrationsFolder, `${tag}.sql`), 'utf8').split('--> statement-breakpoint');
    statements.forEach((statement) => sqlite.exec(statement));
};

const createKnexDatabase = (sqlite: Database.Database) => {
    runSqlFile(sqlite, baseline!.tag);
    sqlite.exec('CREATE TABLE knex_migrations (id INTEGER PRIMARY KEY, name TEXT)');
    sqlite.exec('CREATE TABLE knex_migrations_lock (id INTEGER PRIMARY KEY, is_locked INTEGER)');
};

const columnNames = (sqlite: Database.Database, table: string) =>
    sqlite
        .prepare(`PRAGMA table_info(${table})`)
        .all()
        .map((column) => (column as { name: string }).name);

describe('prepareLegacyMigrations', () => {
    let sqlite: Database.Database;

    beforeEach(() => {
        sqlite = new Database(':memory:');
        sqlite.pragma('foreign_keys = ON');
    });

    afterEach(() => {
        sqlite.close();
    });

    it('migrates a fresh database', () => {
        runMigrations(sqlite);

        expect(columnNames(sqlite, 'AppSettings')).toContain('categoryId');
    });

    it('adopts a knex database without recreating its tables', () => {
        createKnexDatabase(sqlite);
        sqlite.exec(`INSERT INTO AppSettings (name, color) VALUES ('Code', '#fff')`);

        runMigrations(sqlite);

        expect(columnNames(sqlite, 'AppSettings')).toContain('categoryId');
        expect(sqlite.prepare(`SELECT name FROM AppSettings`).all()).toEqual([{ name: 'Code' }]);
        expect(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'knex%'").all()).toEqual(
            [],
        );
    });

    it('runs migrations skipped because an earlier build stamped the baseline with Date.now()', () => {
        // State left by the old adoption code: baseline marked applied with the time of first launch.
        createKnexDatabase(sqlite);
        sqlite.exec(
            `CREATE TABLE ${MIGRATIONS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL, created_at INTEGER)`,
        );
        sqlite.exec('DROP TABLE knex_migrations');
        sqlite.exec('DROP TABLE knex_migrations_lock');
        sqlite
            .prepare(`INSERT INTO ${MIGRATIONS_TABLE} (hash, created_at) VALUES (?, ?)`)
            .run(baseline!.tag, Date.parse('2025-09-01'));

        runMigrations(sqlite);

        expect(columnNames(sqlite, 'AppSettings')).toContain('categoryId');
    });

    it('does not rerun migrations on an up-to-date database', () => {
        runMigrations(sqlite);

        expect(() => runMigrations(sqlite)).not.toThrow();
    });

    it('clears the category of apps when the category is deleted', () => {
        runMigrations(sqlite);
        sqlite.exec(`INSERT INTO Categories (name) VALUES ('Work')`);
        sqlite.exec(`INSERT INTO AppSettings (name, categoryId) VALUES ('Code', 1)`);

        sqlite.exec('DELETE FROM Categories WHERE id = 1');

        expect(sqlite.prepare(`SELECT categoryId FROM AppSettings WHERE name = 'Code'`).get()).toEqual({
            categoryId: null,
        });
    });
});
