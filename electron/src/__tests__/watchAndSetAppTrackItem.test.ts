import { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NormalizedActiveWindow } from '../background/watchTrackItems/watchForActiveWindow.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { addColorToApp, setupTestDb } from './db.testUtils';
import { selectAllAppItems } from './query.testUtils';
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
        const { watchAndSetAppTrackItem } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');

        await watchAndSetAppTrackItem();

        const firstApp: NormalizedActiveWindow = {
            app: 'FirstApp',
            title: 'First Title',
        };

        const secondApp: NormalizedActiveWindow = {
            app: 'SecondApp',
            title: 'Second Title',
        };

        await addColorToApp(firstApp.app ?? '', COLORS.GREEN);

        appEmitter.emit('active-window-changed', firstApp);
        appEmitter.emit('active-window-changed', secondApp);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        // Verify item was created in the database
        const items = await selectAllAppItems(db);

        expect(items.length).toBe(1);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...firstApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW,
            color: COLORS.GREEN,
        });
    });

    it('saves each item with correct begin/end dates', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetAppTrackItem } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');

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

        await addColorToApp(firstApp.app ?? '', COLORS.GREEN);
        await addColorToApp(secondApp.app ?? '', COLORS.RED);

        appEmitter.emit('active-window-changed', firstApp);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('active-window-changed', secondApp);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('active-window-changed', thirdApp);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));

        // Verify item was created in the database
        const items = await selectAllAppItems(db);

        expect(items.length).toBe(2);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...firstApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...secondApp,
            id: 2,
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
            color: COLORS.RED,
        });
    });
});
