import { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { setupTestDb } from './db.testUtils';
import { changeStateAndMockDate, selectAllAppItems } from './query.testUtils';
import { getTimestamp } from './time.testUtils';

// Create mocks
vi.mock('electron');
vi.mock('electron-is-dev');
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
    taskName: TrackItemType.StatusTrackItem,
};

describe('watchAndSetStatusTrackItem', () => {
    beforeEach(async () => {
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

    it('state-changed event should end current status item', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem } = await import('../background/watchTrackItems/watchAndSetStatusTrackItem');
        await watchAndSetStatusTrackItem();

        // Default state is online

        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Verify the item was updated with new end date
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            app: 'ONLINE',
            title: 'online',
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.ONLINE,
        });
    });

    it('state-changed event should start new log item if state changes to idle-online-idle', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem } = await import('../background/watchTrackItems/watchAndSetStatusTrackItem');
        await watchAndSetStatusTrackItem();

        // create initial in memory item

        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // should save the new item dates
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));

        // should save the new item dates
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 3000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(3));

        const items = await selectAllAppItems(db);

        expect(items.length).toBe(3);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            id: 1,
            app: 'ONLINE',
            title: 'online',
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.ONLINE,
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            id: 2,
            app: 'IDLE',
            title: 'idle',
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
            color: COLORS.IDLE,
        });

        expect(items[2]).toStrictEqual({
            ...emptyData,
            id: 3,
            app: 'ONLINE',
            title: 'online',
            beginDate: NOW + 2000,
            endDate: NOW + 3000,
            color: COLORS.ONLINE,
        });
    });

    it('watchAndSetStatusTrackItemRemove should end current item and save it', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem, watchAndSetStatusTrackItemCleanup: watchAndSetStatusTrackItemRemove } =
            await import('../background/watchTrackItems/watchAndSetStatusTrackItem');

        // Spy on appEmitter's removeAllListeners method
        const removeAllListenersSpy = vi.spyOn(appEmitter, 'removeAllListeners');

        // Setup initial state
        await watchAndSetStatusTrackItem();

        // Mock Date.now to advance time for the end date
        const END_TIME = NOW + 5000;
        vi.spyOn(Date, 'now').mockImplementation(() => END_TIME);

        // Initially there should be no items in the database
        expect((await selectAllAppItems(db)).length).toBe(0);

        // Call the remove function which should save the current item
        await watchAndSetStatusTrackItemRemove();

        // Verify appEmitter.removeAllListeners was called with 'state-changed'
        expect(removeAllListenersSpy).toHaveBeenCalledWith('state-changed');

        // Verify an item was saved to the database
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Verify the saved item has the correct properties
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            app: 'ONLINE',
            title: 'online',
            id: 1,
            beginDate: NOW,
            endDate: END_TIME,
            color: COLORS.ONLINE,
        });
    });
});
