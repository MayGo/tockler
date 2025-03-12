import { Client } from '@libsql/client';
import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NormalizedActiveWindow } from '../background/watchForActiveWindow.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
import { getTimestamp } from './time.testUtils';

// Create mocks
vi.mock('electron');

vi.mock('../utils/log-manager');

// Setup in-memory database
let client: Client;
let db: ReturnType<typeof drizzle>;

async function cleanupTestDb() {
    if (client) {
        await db.delete(trackItems).execute();
        await client.close();
    }
}

const NOW = getTimestamp('2023-01-10T12:00:00');

async function selectAppItem(app: string) {
    return db.select().from(trackItems).where(eq(trackItems.app, app)).orderBy(asc(trackItems.beginDate)).execute();
}

async function selectAllAppItems() {
    return db.select().from(trackItems).execute();
}

const expectNrOfItems = async (nr: number) => {
    await vi.waitFor(async () => {
        const items = await selectAllAppItems();
        expect(items.length).toBe(nr);
    });
};

const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.AppTrackItem,
};

describe('watchAndSetLogTrackItem', () => {
    beforeEach(async () => {
        // Reset mocks and modules
        vi.resetModules();
        vi.resetAllMocks();

        vi.spyOn(Date, 'now').mockImplementation(() => NOW);

        // Setup test database for real DB operations
        ({ db, client } = await setupTestDb());
    });

    afterEach(async () => {
        // Restore Date.now
        vi.restoreAllMocks();
        await cleanupTestDb();
    });

    it('saves previous app item', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetAppTrackItem } = await import('../background/watchAndSetAppTrackItem');

        await watchAndSetAppTrackItem();

        const firstApp: NormalizedActiveWindow = {
            app: 'FirstApp',
            title: 'First Title',
        };

        const secondApp: NormalizedActiveWindow = {
            app: 'SecondApp',
            title: 'Second Title',
        };

        appEmitter.emit('active-window-changed', firstApp);
        appEmitter.emit('active-window-changed', secondApp);

        // Verify item was created in the database
        const items = await selectAppItem('FirstApp');

        expect(items.length).toBe(1);
        expect(items[0].app).toBe('FirstApp');
        expect(items[0].title).toBe('First Title');
        expect(items[0].taskName).toBe(TrackItemType.AppTrackItem);
        expect(items[0].beginDate).toBe(NOW);
        expect(items[0].endDate).toBe(NOW);
    });

    it('saves each item with correct begin/end dates', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetAppTrackItem } = await import('../background/watchAndSetAppTrackItem');

        await watchAndSetAppTrackItem();

        const firstApp: NormalizedActiveWindow = {
            app: 'FirstApp',
            title: 'First Title',
        };

        const secondApp: NormalizedActiveWindow = {
            app: 'SecondApp',
            title: 'Second Title',
        };

        const thirdApp: NormalizedActiveWindow = {
            app: 'ThirdApp',
            title: 'Third Title',
        };

        appEmitter.emit('active-window-changed', firstApp);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('active-window-changed', secondApp);
        await expectNrOfItems(1);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('active-window-changed', thirdApp);
        await expectNrOfItems(2);

        // Verify item was created in the database
        const items = await selectAllAppItems();

        expect(items.length).toBe(2);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...firstApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...secondApp,
            id: 2,
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
        });
    });
});
