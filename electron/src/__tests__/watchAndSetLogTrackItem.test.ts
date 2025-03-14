import { Client } from '@libsql/client';
import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItemRaw } from '../app/task-analyser';
import { NEW_ITEM_END_DATE_OFFSET } from '../background/watchAndSetLogTrackItem.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { setupTestDb } from './db.testUtils';
import { changeStateAndMockDate, selectAllAppItems } from './query.testUtils';
import { getTimestamp } from './time.testUtils';
import { visualizeTrackItems } from './visualize.testUtils';

// Store handlers for IPC events
const eventHandlers: Record<string, any> = {};

// Create mocks
vi.mock('electron', async () => ({
    ...(await import('__mocks__/electron/index')),
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

async function selectLogItem(app: string) {
    return db.select().from(trackItems).where(eq(trackItems.app, app)).orderBy(asc(trackItems.beginDate)).execute();
}

async function addColorToApp(app: string, color: string) {
    const { appSettingService } = await import('../drizzle/queries/app-setting-service');
    await appSettingService.changeColorForApp(app, color);
}

const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.LogTrackItem,
};

describe('watchAndSetLogTrackItem', () => {
    beforeEach(async () => {
        // Reset mocks and modules
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

    it('start-new-log-item should save the log item', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   
   ID=1    0.0s    0.0s     = 0.0s
................................................................................
--------------------------------------------------------------------------------
*/
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');

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

        expect(items.length).toBe(1);
        expect(items[0].app).toBe('TestApp');
        expect(items[0].title).toBe('Test Title');
        expect(items[0].color).toBe('#ffffff');
        expect(items[0].url).toBe('http://test.com');
        expect(items[0].taskName).toBe(TrackItemType.LogTrackItem);

        // Visualize the track items
        visualizeTrackItems(items, NOW);
    });

    it('end-running-log-item should update the log items end date', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████████████████████████████████████████████
   ID=1    0.0s                                                        1.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
*/
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');

        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await sendStartNewLogItemEvent(testData);

        // Verify the item was created
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Wait a moment to ensure the endDate will be different
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);

        await sendEndRunningLogItemEvent();

        // Verify the item was updated in the database
        const items = await selectAllAppItems(db);

        expect(items.length).toBe(1);
        expect(items[0].endDate).toBe(NOW + 1000);

        visualizeTrackItems(items, NOW);
    });

    it('state-changed event should end current log item', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   ████████████████████████████████████████████████████████████
   ID=1    0.0s                                                        1.0s     = 1.0s
................................................................................
--------------------------------------------------------------------------------
*/
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        await sendStartNewLogItemEvent(testData);

        // Verify item was created
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

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

    it('state-changed event should create new log item when transitioning to Online state', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   █████████████████████████████
   ID=1    0.0s                         1.0s     = 1.0s
................................................................................
2. TestApp                                                            ███
   ID=2                                                             2.0s    2.1s     = 0.1s
................................................................................
--------------------------------------------------------------------------------
*/
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Start with creating an item (normally this happens when we're online)
        await sendStartNewLogItemEvent(testData);

        // Get the initial item
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        let items = await selectAllAppItems(db);

        // Transition to idle - should update end date to current time
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        items = await selectAllAppItems(db);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        // Come back online - should create a NEW log item
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        items = await selectAllAppItems(db);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 2,
            beginDate: NOW + 2000,
            endDate: NOW + 2000 + NEW_ITEM_END_DATE_OFFSET,
            color: COLORS.GREEN,
        });

        visualizeTrackItems(items, NOW);
    });

    it('should maintain currentLogItem until explicitly stopped', async () => {
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
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Create initial log item
        await sendStartNewLogItemEvent(testData);

        // Verify initial item was created
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

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

        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        items = await selectAllAppItems(db);

        // First item's end date should be when we went idle
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        // Second item should be new and start when we came back online
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 2,
            beginDate: NOW + 2000,
            endDate: NOW + 2000 + NEW_ITEM_END_DATE_OFFSET,
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
1. TestApp   ███████████████
   ID=1    0.0s           1.0s     = 1.0s
................................................................................
2. TestApp                                ███████████████
   ID=2                                 2.0s           3.0s     = 1.0s
................................................................................
3. TestApp                                                              █
   ID=3                                                               4.0s    4.1s     = 0.1s
................................................................................
--------------------------------------------------------------------------------
        */
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testData.app ?? '', COLORS.GREEN);

        // Create initial log item
        await sendStartNewLogItemEvent(testData);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Offline
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Online
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));

        // Idle
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 3000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));

        // Online
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 4000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(3));
        visualizeTrackItems(await selectAllAppItems(db), NOW);

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
});
