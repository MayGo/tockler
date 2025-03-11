import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { vi } from 'vitest';

// Import the real implementations directly to reduce dynamic imports
import * as schema from '../drizzle/schema';
import { appSettings } from '../drizzle/schema';

export async function setupTestDb() {
    // Create in-memory database
    const sqlite = new Database(':memory:');

    // Set up database with schema
    const db = drizzle(sqlite, { schema });

    // Apply schema to in-memory database
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS TrackItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app TEXT NOT NULL,
      taskName TEXT,
      title TEXT,
      url TEXT,
      color TEXT,
      beginDate INTEGER NOT NULL,
      endDate INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS AppSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT
    );
    
    CREATE TABLE IF NOT EXISTS Settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      jsonData TEXT
    );
  `);

    // Insert default app settings that are needed
    await db.insert(appSettings).values({ name: 'ONLINE', color: '#7ed321' });
    await db.insert(appSettings).values({ name: 'OFFLINE', color: '#f31b1b' });
    await db.insert(appSettings).values({ name: 'IDLE', color: '#f5a623' });

    // Mock the database in the db module
    vi.doMock('../drizzle/db', () => ({
        db,
        connectAndSync: vi.fn().mockResolvedValue(undefined),
    }));

    return { db, sqlite };
}
