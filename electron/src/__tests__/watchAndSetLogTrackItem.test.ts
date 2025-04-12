import { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItemRaw } from '../app/task-analyser.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { addColorToApp, setupTestDb } from './db.testUtils';
import { changeStateAndMockDate, selectAllAppItems } from './query.testUtils';
import { getTimestamp } from './time.testUtils';
import { visualizeTrackItems } from './visualize.testUtils';

// Store handlers for IPC events
const eventHandlers: Record<string, any> = {};

// Create mocks
vi.mock('electron', async () => ({
    app: {
        getPath: vi.fn(() => ''),
    },
    ipcMain: {
        on: vi.fn((event, handler) => {
            eventHandlers[event] = handler;
        }),
    },
}));

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

async function sendStartNewLogItemEvent(testData: TrackItemRaw) {
    expect(eventHandlers['start-new-log-item']).toBeDefined();
    return eventHandlers['start-new-log-item']({} as any, testData);
}

async function sendEndRunningLogItemEvent() {
    expect(eventHandlers['end-running-log-item']).toBeDefined();
    return eventHandlers['end-running-log-item']({} as any);
}

const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.LogTrackItem,
};

describe('watchAndSetLogTrackItem', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.resetAllMocks();

        // Clear event handlers
        Object.keys(eventHandlers).forEach((key) => {
            delete eventHandlers[key];
        });

        vi.spyOn(Date, 'now').mockImplementation(() => NOW);

        // Setup test database for real DB operations
        ({ db, client } = await setupTestDb());
    });

    afterEach(async () => {
        // Restore Date.now
        vi.restoreAllMocks();
        await cleanupTestDb();
    });

    it('start-new-log-item should not save the log item', async () => {
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');

        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
            color: '#ffffff',
            url: 'http://test.com',
        };

        await sendStartNewLogItemEvent(testData);

        // Verify item was created in the database
        const items = await selectAllAppItems(db);

        expect(items.length).toBe(0);
    });

    it('end-running-log-item should update the log items end date', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████████████████████████████████████████████
   ID=1    0.0s                                                        1.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
*/
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');

        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await sendStartNewLogItemEvent(testData);

        // Wait a moment to ensure the endDate will be different
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);

        await sendEndRunningLogItemEvent();

        // Verify the item was updated in the database
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0].endDate).toBe(NOW + 1000);

        visualizeTrackItems(items, NOW);
    });

    it('create new log item when transitioning to Idle/Offline state', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████████████████████████████████████████████
   ID=1    0.0s                                                        1.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
*/
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        await sendStartNewLogItemEvent(testData);

        // Idle
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Verify the item was updated with new end date
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        visualizeTrackItems(items, NOW);
    });

    it('creates new log item when stopped', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████
   ID=1    0.0s                1.0s     = 1.0s
................................................................................
2. TestApp                                           ████████████████████
   ID=2                                            2.0s                3.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
*/
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Create initial log item
        await sendStartNewLogItemEvent(testData);

        // Change to Idle state
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);

        // Verify no new items were created, just the end date updated
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        let items = await selectAllAppItems(db);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        // Online
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);

        items = await selectAllAppItems(db);

        expect(items.length).toBe(1);

        // First item's end date should be when we went idle
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);

        await sendEndRunningLogItemEvent();

        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 4000);
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 5000);
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 6000);
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 7000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));

        visualizeTrackItems(await selectAllAppItems(db), NOW);
    });

    it('should not create new items when stopped', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████
   ID=1    0.0s                1.0s     = 1.0s
................................................................................
2. TestApp                                           ████████████████████
   ID=2                                            2.0s                3.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
        */
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Create initial log item
        await sendStartNewLogItemEvent(testData);

        // Offline
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Online
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);

        // Idle
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 3000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));

        const items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
    });

    it('watchAndSetLogTrackItemRemove should end current item and save it', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem, watchAndSetLogTrackItemCleanup: watchAndSetLogTrackItemRemove } = await import(
            '../background/watchTrackItems/watchAndSetLogTrackItem'
        );

        // Spy on appEmitter's removeAllListeners method
        const removeAllListenersSpy = vi.spyOn(appEmitter, 'removeAllListeners');

        // Setup initial state
        await watchAndSetLogTrackItem();

        // Create a test log item
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };
        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Start a new log item
        await sendStartNewLogItemEvent(testData);

        // Mock Date.now to advance time for the end date
        const END_TIME = NOW + 5000;
        vi.spyOn(Date, 'now').mockImplementation(() => END_TIME);

        // Initially there should be no items in the database
        expect((await selectAllAppItems(db)).length).toBe(0);

        // Call the remove function which should save the current item
        await watchAndSetLogTrackItemRemove();

        // Verify appEmitter.removeAllListeners was called with 'state-changed'
        expect(removeAllListenersSpy).toHaveBeenCalledWith('state-changed');

        // Verify an item was saved to the database
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Verify the saved item has the correct properties
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            app: 'TestApp',
            title: 'Test Title',
            color: COLORS.GREEN,
            id: 1,
            beginDate: NOW,
            endDate: END_TIME,
        });
    });

    it('should handle state change from Offline to Idle', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████
   ID=1    0.0s                1.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
        */
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Create initial log item
        await sendStartNewLogItemEvent(testData);

        // Offline
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Idle
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 2000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Online
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 3000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        let items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        visualizeTrackItems(items, NOW);
    });
});
