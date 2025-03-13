import { Client } from '@libsql/client';
import { asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
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

async function selectItem() {
    return db.select().from(trackItems).orderBy(asc(trackItems.beginDate)).execute();
}

const expectNrOfItems = async (nr: number) => {
    await vi.waitFor(async () => {
        const items = await selectItem();
        expect(items.length).toBe(nr);
    });
};

const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.StatusTrackItem,
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

    it('state-changed event should end current status item', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem } = await import('../background/watchAndSetStatusTrackItem');
        await watchAndSetStatusTrackItem();

        appEmitter.emit('state-changed', State.Idle);

        // Simulate time passing
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Online);

        // Verify the item was updated with new end date
        const updatedItems = await selectItem();
        expect(updatedItems.length).toBe(1);
        expect(updatedItems[0]).toStrictEqual({
            ...emptyData,
            app: 'IDLE',
            title: 'idle',
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
        });
    });

    it('state-changed event should start new log item if state changes to idle-online-idle', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem } = await import('../background/watchAndSetStatusTrackItem');
        await watchAndSetStatusTrackItem();

        // create initial in memory item
        appEmitter.emit('state-changed', State.Offline);

        // trigger new item creation
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Idle);
        await expectNrOfItems(1);

        // should save the new item dates
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('state-changed', State.Online);
        await expectNrOfItems(2);

        // should save the new item dates
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Idle);
        await expectNrOfItems(3);

        const items = await selectItem();

        expect(items.length).toBe(3);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            id: 1,
            app: 'OFFLINE',
            title: 'offline',
            beginDate: NOW,
            endDate: NOW + 1000,
        });
        expect(items[1]).toStrictEqual({
            ...emptyData,
            id: 2,
            app: 'IDLE',
            title: 'idle',
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
        });

        expect(items[2]).toStrictEqual({
            ...emptyData,
            id: 3,
            app: 'ONLINE',
            title: 'online',
            beginDate: NOW + 2000,
            endDate: NOW + 3000,
        });
    });
});
