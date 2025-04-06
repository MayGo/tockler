import { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NewTrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
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

const NOW = getTimestamp('2024-01-01T12:00:00');

describe('getCurrentSessionDuration', () => {
    const minBreakTime = 5; // 5 minutes break

    beforeEach(async () => {
        // Reset mocks and modules
        vi.resetModules();
        vi.resetAllMocks();

        vi.spyOn(Date, 'now').mockImplementation(() => NOW);
        //  vi.spyOn(DateTime, 'now').mockReturnValue(NOW_DT);

        // Setup test database for real DB operations
        ({ db, client } = await setupTestDb());
    });

    afterEach(async () => {
        // Restore mocks
        vi.restoreAllMocks();
        await cleanupTestDb();
    });

    it('should return 0 when no items are found', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const duration = await getCurrentSessionDuration(minBreakTime);
        expect(duration).toBe(0);
    });

    it('should return 0 when current break exceeds minBreakTime', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const item: NewTrackItem = {
            app: State.Online,
            title: 'Test Title',
            taskName: TrackItemType.StatusTrackItem,
            beginDate: NOW - 10 * 60 * 1000, // 10 minutes ago
            endDate: NOW - 6 * 60 * 1000, // 6 minutes ago
            color: null,
            url: null,
        };

        await db.insert(trackItems).values(item).execute();

        const duration = await getCurrentSessionDuration(minBreakTime);
        expect(duration).toBe(0);
    });

    it('should calculate total duration for current session', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const items: NewTrackItem[] = [
            {
                app: State.Online,
                title: 'Test Title 1',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 3 * 60 * 1000, // 3 minutes ago
                endDate: NOW - 1 * 60 * 1000, // 1 minute ago
                color: null,
                url: null,
            },
            {
                app: State.Online,
                title: 'Test Title 2',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 4 * 60 * 1000, // 4 minutes ago
                endDate: NOW - 3 * 60 * 1000, // 3 minutes ago
                color: null,
                url: null,
            },
        ];

        await db.insert(trackItems).values(items).execute();

        const duration = await getCurrentSessionDuration(minBreakTime);
        // Expected duration: 3 minutes = 180000 milliseconds
        expect(duration).toBe(180000);
    });

    it('should only include items from current session (before break)', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const items: NewTrackItem[] = [
            {
                app: 'ONLINE',
                title: 'Current Session',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 2 * 60 * 1000, // 2 minutes ago
                endDate: NOW - 1 * 60 * 1000, // 1 minute ago
                color: null,
                url: null,
            },
            {
                app: 'ONLINE',
                title: 'Previous Session',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 9 * 60 * 1000, // 9 minutes ago
                endDate: NOW - 8 * 60 * 1000, // 8 minutes ago
                color: null,
                url: null,
            },
        ];

        await db.insert(trackItems).values(items).execute();

        const duration = await getCurrentSessionDuration(minBreakTime);
        // Expected duration: 1 minute = 60000 milliseconds
        expect(duration).toBe(60000);
    });
});
