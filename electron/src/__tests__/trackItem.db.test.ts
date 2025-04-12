import { describe, expect, it } from 'vitest';

import { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, vi } from 'vitest';
import { getTimestamp } from '../__tests__/time.testUtils'; // Importing getTimestamp
import { NewTrackItem, TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
import { selectAllAppItems } from './query.testUtils';

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
    taskName: TrackItemType.AppTrackItem,
};

describe('trackItem.db', () => {
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

    it('should not split track item when it does not span across midnight', async () => {
        // Import modules with mocked dependencies

        const { insertTrackItemInternal: insertTrackItem } = await import('../drizzle/worker/queries/trackItem.db');

        // First create a status item that starts before midnight
        const beginDate = getTimestamp('2023-01-09T00:00:01');
        const endDate = getTimestamp('2023-01-09T23:59:59.999');

        // Insert the initial item that starts before midnight
        const statusItem: NewTrackItem = {
            app: State.Online,
            title: 'online',
            taskName: TrackItemType.StatusTrackItem,
            beginDate,
            endDate,
        };

        // Now update the item with an end time after midnight
        const id = await insertTrackItem(statusItem);

        expect(id).toBe(1n);

        const items = await selectAllAppItems(db);

        expect(items.length).toBe(1);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 1,
            beginDate,
            endDate,
        });
    });

    it('should split track item when it spans across midnight', async () => {
        // Import modules with mocked dependencies

        const { insertTrackItemInternal: insertTrackItem } = await import('../drizzle/worker/queries/trackItem.db');

        // First create a status item that starts before midnight
        const beforeMidnightTime = getTimestamp('2023-01-09T23:58:28');
        const afterMidnightTime = getTimestamp('2023-01-10T00:05:00');

        // Insert the initial item that starts before midnight
        const statusItem: NewTrackItem = {
            app: State.Online,
            title: 'online',
            taskName: TrackItemType.StatusTrackItem,
            beginDate: beforeMidnightTime,
            endDate: afterMidnightTime,
        };

        // Now update the item with an end time after midnight
        const id = await insertTrackItem(statusItem);

        expect(id).toBe(2n);

        const items = await selectAllAppItems(db);

        expect(items.length).toBe(2);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 1,
            beginDate: beforeMidnightTime,
            endDate: getTimestamp('2023-01-09T23:59:59.999'),
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 2,
            beginDate: getTimestamp('2023-01-10T00:00:00'),
            endDate: afterMidnightTime,
        });
    });

    it('should split track item when it spans multiple nights', async () => {
        // Import modules with mocked dependencies

        const { insertTrackItemInternal: insertTrackItem } = await import('../drizzle/worker/queries/trackItem.db');

        // First create a status item that starts before midnight
        const beginDate = getTimestamp('2023-01-09T13:00:00');
        const endDate = getTimestamp('2023-01-13T00:05:00');

        // Insert the initial item that starts before midnight
        const statusItem: NewTrackItem = {
            app: State.Online,
            title: 'online',
            taskName: TrackItemType.StatusTrackItem,
            beginDate: beginDate,
            endDate: endDate,
        };

        // Now update the item with an end time after midnight
        const id = await insertTrackItem(statusItem);

        expect(id).toBe(5n);

        const items = await selectAllAppItems(db);

        expect(items.length).toBe(5);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 1,
            beginDate: beginDate,
            endDate: getTimestamp('2023-01-09T23:59:59.999'),
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 2,
            beginDate: getTimestamp('2023-01-10T00:00:00'),
            endDate: getTimestamp('2023-01-10T23:59:59.999'),
        });

        expect(items[2]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 3,
            beginDate: getTimestamp('2023-01-11T00:00:00'),
            endDate: getTimestamp('2023-01-11T23:59:59.999'),
        });

        expect(items[3]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 4,
            beginDate: getTimestamp('2023-01-12T00:00:00'),
            endDate: getTimestamp('2023-01-12T23:59:59.999'),
        });

        expect(items[4]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 5,
            beginDate: getTimestamp('2023-01-13T00:00:00'),
            endDate: endDate,
        });
    });
});
