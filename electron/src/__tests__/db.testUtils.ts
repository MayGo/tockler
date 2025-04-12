import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { vi } from 'vitest';
import { createWorkerMock } from './worker.testUtils';

// Import the real implementations directly to reduce dynamic imports
import * as schema from '../drizzle/schema';
import { appSettings } from '../drizzle/schema';

const outputPathUrl = 'file::memory:';

export async function setupTestDb() {
    // Create in-memory database client
    const client = createClient({
        url: outputPathUrl,
    });

    // Set up database with schema
    const db = drizzle(client, {
        schema,
        logger: true,
    });

    console.info('setupTestDb');

    // Create tables from schema
    await migrate(db, { migrationsFolder: './src/drizzle/migrations' });

    // Insert default app settings that are needed
    await db.insert(appSettings).values({ name: 'ONLINE', color: '#7ed321' });
    await db.insert(appSettings).values({ name: 'OFFLINE', color: '#f31b1b' });
    await db.insert(appSettings).values({ name: 'IDLE', color: '#f5a623' });

    // Mock the database in the db module
    vi.doMock('../drizzle/worker/db', () => ({
        db,
    }));

    vi.doMock('worker_threads', () => createWorkerMock());

    return { db, client };
}

export async function addColorToApp(app: string, color: string) {
    const { appSettingService } = await import('../drizzle/worker/queries/app-setting-service');
    await appSettingService.changeColorForApp(app, color);
}
