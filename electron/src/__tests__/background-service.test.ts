import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import the real implementations directly to reduce dynamic imports
import { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { BackgroundService } from '../background/oldstuff/background-service';
import { trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
import { getTimestamp } from './time.testUtils';

// Mocked in __mocks__
vi.mock('electron');
vi.mock('../utils/log-manager');
vi.mock('../utils/config');

// Setup in-memory database
let client: Client;
let db: ReturnType<typeof drizzle>;

async function cleanupTestDb() {
    if (client) {
        client.close();
    }
}

const NOW = getTimestamp('2023-01-10T12:00:00');

describe('BackgroundService with real implementation', () => {
    let backgroundService: BackgroundService;

    beforeEach(async () => {
        // Reset mocks and modules
        vi.resetModules();
        vi.resetAllMocks();

        vi.spyOn(Date, 'now').mockImplementation(() => NOW);

        // Setup test database
        ({ db, client } = await setupTestDb());

        // Import the services after we've mocked the database
        const stateManagerModule = await import('../background/oldstuff/state-manager');
        const bgServiceModule = await import('../background/oldstuff/background-service');

        // Make sure stateManager is initialized with test DB
        await stateManagerModule.stateManager.restoreState();

        // Get instance of background service
        backgroundService = bgServiceModule.backgroundService;
    });

    afterEach(async () => {
        // Restore Date.now
        vi.restoreAllMocks();
        await cleanupTestDb();
    });

    describe('addInactivePeriod', () => {
        it('should create an inactive period track item in the database', async () => {
            // Setup
            const beginDate = new Date('2023-01-10T10:00:00');
            const endDate = new Date('2023-01-10T11:00:00');

            // Execute
            const result = await backgroundService.addInactivePeriod(beginDate, endDate);

            // Verify
            expect(result).not.toBeNull();

            // Check that the item was actually created in the database
            const items = await db
                .select()
                .from(trackItems)
                .where(eq(trackItems.taskName, TrackItemType.StatusTrackItem));

            expect(items.length).toBe(1);
            expect(items[0].app).toBe(State.Offline);
            expect(items[0].title).toBe(State.Offline.toString().toLowerCase());
            expect(items[0].beginDate).toBe(getTimestamp('2023-01-10T10:00:00'));
            expect(items[0].endDate).toBe(getTimestamp('2023-01-10T11:00:00'));
            expect(items[0].color).toBe('#f31b1b'); // Default color for OFFLINE status
        });
    });

    describe('createItems', () => {
        it('should create multiple track items in the database', async () => {
            // Setup
            const items: any[] = [
                {
                    app: 'Chrome',
                    title: 'Google',
                    taskName: TrackItemType.AppTrackItem,
                    beginDate: getTimestamp('2023-01-10T10:00:00'),
                    endDate: getTimestamp('2023-01-10T11:00:00'),
                    color: '#ff0000',
                },
                {
                    app: 'VSCode',
                    title: 'project.ts',
                    taskName: TrackItemType.AppTrackItem,
                    beginDate: getTimestamp('2023-01-10T11:00:00'),
                    endDate: getTimestamp('2023-01-10T12:00:00'),
                    color: '#00ff00',
                },
            ];

            // Execute
            const result = await backgroundService.createItems(items);

            // Verify
            expect(result.length).toBe(2);

            // Check that items were created in the database
            const dbItems = await db
                .select()
                .from(trackItems)
                .where(eq(trackItems.taskName, TrackItemType.AppTrackItem));

            expect(dbItems.length).toBe(2);
            expect(dbItems[0].app).toBe('Chrome');
            expect(dbItems[1].app).toBe('VSCode');
        });
    });

    describe('createOrUpdate', () => {
        it('should create a new track item in the database', async () => {
            // Setup
            const rawItem = {
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                beginDate: getTimestamp('2023-01-10T10:00:00'),
                endDate: getTimestamp('2023-01-10T11:00:00'),
            };

            // Execute
            const result = await backgroundService.createOrUpdate(rawItem);

            // Verify
            expect(result).not.toBeNull();

            // Check that the item was actually created in the database
            const items = await db.select().from(trackItems).where(eq(trackItems.app, 'Chrome'));

            expect(items.length).toBe(1);
            expect(items[0].app).toBe('Chrome');
            expect(items[0].title).toBe('Google');
            expect(items[0].beginDate).toBe(getTimestamp('2023-01-10T10:00:00'));
            expect(items[0].endDate).toBe(getTimestamp('2023-01-10T11:00:00'));
        });

        it('should update an existing track items endDate if it is running', async () => {
            // First create a track item
            const initialItem = {
                app: 'Firefox',
                title: 'Mozilla',
                taskName: TrackItemType.AppTrackItem,
                beginDate: getTimestamp('2023-01-10T10:00:00'),
                endDate: getTimestamp('2023-01-10T11:00:00'),
            };

            // Execute creation
            const createdItem = await backgroundService.createOrUpdate(initialItem);
            expect(createdItem).not.toBeNull();

            // Get the state manager
            const stateManagerModule = await import('../background/oldstuff/state-manager');

            // Assert that the item is in state manager's current items
            expect(stateManagerModule.stateManager.getCurrentTrackItem(TrackItemType.AppTrackItem)).toEqual(
                createdItem,
            );

            // Execute update
            const updatedItem = await backgroundService.createOrUpdate(initialItem);

            // Verify
            expect(updatedItem).not.toBeNull();
            expect(updatedItem?.endDate).toEqual(NOW);

            // Check that it was updated in the database
            const items = await db.select().from(trackItems).where(eq(trackItems.app, 'Firefox'));

            expect(items.length).toBe(1);
            expect(items[0].endDate).toBe(NOW);
        });

        it('should split track item if it spans midnight', async () => {
            // Create a track item that spans midnight
            const spanningItem = {
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                beginDate: getTimestamp('2023-01-09T23:30:00'),
                endDate: getTimestamp('2023-01-10T00:40:00'),
            };

            // Execute creation
            const result = await backgroundService.createOrUpdate(spanningItem);

            // Verify
            expect(result).not.toBeNull();

            // Check that two items were created in the database
            const items = await db.select().from(trackItems).where(eq(trackItems.app, 'Chrome'));

            expect(items.length).toBe(2);

            // First item should end at midnight
            expect(items[0].beginDate).toBe(getTimestamp('2023-01-09T23:30:00'));
            expect(items[0].endDate).toBe(getTimestamp('2023-01-09T23:59:59'));

            // Second item should start at midnight
            expect(items[1].beginDate).toBe(getTimestamp('2023-01-10T00:00:00'));
            expect(items[1].endDate).toBe(getTimestamp('2023-01-10T00:40:00'));

            // Both items should maintain the same metadata
            items.forEach((item) => {
                expect(item.app).toBe('Chrome');
                expect(item.title).toBe('Google');
                expect(item.taskName).toBe(TrackItemType.AppTrackItem);
            });
        });

        it('should split track item spanning multiple days correctly', async () => {
            // Create a track item that spans multiple days
            const multiDayItem = {
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                beginDate: getTimestamp('2023-01-09T23:30:00'),
                endDate: getTimestamp('2023-01-11T01:15:00'),
            };

            // Execute creation
            const result = await backgroundService.createOrUpdate(multiDayItem);

            // Verify
            expect(result).not.toBeNull();

            // Check items created in database
            const items = await db.select().from(trackItems).where(eq(trackItems.app, 'Chrome'));

            // Should create 3 items - one for each day
            expect(items.length).toBe(3);

            // First day item (partial)
            expect(items[0].beginDate).toBe(getTimestamp('2023-01-09T23:30:00'));
            expect(items[0].endDate).toBe(getTimestamp('2023-01-09T23:59:59'));

            // Second day item (full day)
            expect(items[1].beginDate).toBe(getTimestamp('2023-01-10T00:00:00'));
            expect(items[1].endDate).toBe(getTimestamp('2023-01-10T23:59:59'));

            // Third day item (partial)
            expect(items[2].beginDate).toBe(getTimestamp('2023-01-11T00:00:00'));
            expect(items[2].endDate).toBe(getTimestamp('2023-01-11T01:15:00'));

            // All items should maintain the same metadata
            items.forEach((item) => {
                expect(item.app).toBe('Chrome');
                expect(item.title).toBe('Google');
                expect(item.taskName).toBe(TrackItemType.AppTrackItem);
            });
        });
    });

    describe('onSleep and onResume', () => {
        it('should set system to sleep when onSleep is called', async () => {
            const stateManagerModule = await import('../background/oldstuff/state-manager');

            const spySetSystemToSleep = vi.spyOn(stateManagerModule.stateManager, 'setSystemToSleep');

            await backgroundService.onSleep();

            expect(spySetSystemToSleep).toHaveBeenCalled();
        });

        it('should add inactive period when resuming with existing status track item', async () => {
            // First create a status track item
            const statusItem = {
                app: State.Online,
                title: State.Online.toString().toLowerCase(),
                taskName: TrackItemType.StatusTrackItem,
                beginDate: getTimestamp('2023-01-10T10:00:00'),
                endDate: getTimestamp('2023-01-10T11:00:00'),
            };

            // Execute creation
            const createdItem = await backgroundService.createOrUpdate(statusItem);
            expect(createdItem).not.toBeNull();

            // Mock Date.now() to return a predictable value for testing
            const resumeTime = getTimestamp('2023-01-10T11:30:00');
            vi.spyOn(Date, 'now').mockImplementation(() => resumeTime);

            // Spy on addInactivePeriod to check it's called
            const addInactivePeriodSpy = vi.spyOn(backgroundService, 'addInactivePeriod');

            await backgroundService.onResume();

            expect(addInactivePeriodSpy).toHaveBeenCalled();

            // Check for the newly created offline item
            const offlineItems = await db.select().from(trackItems).where(eq(trackItems.app, State.Offline));

            expect(offlineItems.length).toBeGreaterThan(0);
        });

        it('should not add inactive period when resuming with no status track item', async () => {
            await db.delete(trackItems);

            const addInactivePeriodSpy = vi.spyOn(backgroundService, 'addInactivePeriod');

            await backgroundService.onResume();

            expect(addInactivePeriodSpy).not.toHaveBeenCalled();
        });
    });
});
