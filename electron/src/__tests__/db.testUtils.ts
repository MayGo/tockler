import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { vi } from 'vitest';

// Import the real implementations directly to reduce dynamic imports
import * as schema from '../drizzle/schema';
import { appSettings } from '../drizzle/schema';

export async function setupTestDb() {
    // Create in-memory database client
    const client = createClient({
        url: 'file::memory:',
    });

    // Set up database with schema
    const db = drizzle(client, { schema });

    // Create tables from schema
    await migrate(db, { migrationsFolder: './src/drizzle/migrations' });

    // Insert default app settings that are needed
    await db.insert(appSettings).values({ name: 'ONLINE', color: '#7ed321' });
    await db.insert(appSettings).values({ name: 'OFFLINE', color: '#f31b1b' });
    await db.insert(appSettings).values({ name: 'IDLE', color: '#f5a623' });

    // Mock the database in the db module
    vi.doMock('../drizzle/db', () => ({
        db,
        connectAndSync: vi.fn().mockResolvedValue(undefined),
    }));

    return { db, client };
}
