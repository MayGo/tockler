import { Client } from '@libsql/client';
import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItemRaw } from '../app/task-analyser';
import { NEW_ITEM_END_DATE_OFFSET } from '../background/watchAndSetLogTrackItem.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
import { expectNrOfItems } from './query.testUtils';
import { getTimestamp } from './time.testUtils';
import { visualizeTrackItems } from './visualize.testUtils';

// Store handlers for IPC events
const eventHandlers: Record<string, any> = {};

// Create mocks
vi.mock('electron', () => ({
    ipcMain: {
        on: vi.fn((event, handler) => {
            eventHandlers[event] = handler;
        }),
    },
}));

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
        const items = await selectLogItem('TestApp');

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
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');

        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await sendStartNewLogItemEvent(testData);

        // Verify the item was created
        const createdItems = await selectLogItem('TestApp');
        expect(createdItems.length).toBe(1);

        // Visualize initial state
        console.log('\nInitial state:');
        visualizeTrackItems(createdItems, NOW);

        // Wait a moment to ensure the endDate will be different
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);

        await sendEndRunningLogItemEvent();

        // Verify the item was updated in the database
        const updatedItems = await selectLogItem('TestApp');

        expect(updatedItems.length).toBe(1);
        expect(updatedItems[0].endDate).toBe(NOW + 1000);

        // Visualize after update
        console.log('\nAfter ending running item:');
        visualizeTrackItems(updatedItems, NOW);
    });

    it('state-changed event should end current log item', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await sendStartNewLogItemEvent(testData);

        // Verify item was created
        const createdItems = await selectLogItem('TestApp');
        expect(createdItems.length).toBe(1);

        // Visualize initial state
        console.log('\nInitial state:');
        visualizeTrackItems(createdItems, NOW);

        // Simulate time passing
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);

        appEmitter.emit('state-changed', State.Idle);

        // Verify the item was updated with new end date
        const updatedItems = await selectLogItem('TestApp');
        expect(updatedItems.length).toBe(1);
        expect(updatedItems[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
        });

        // Visualize after state change
        console.log('\nAfter state changed to Idle:');
        visualizeTrackItems(updatedItems, NOW);
    });

    it('state-changed event should create new log item when transitioning to Online state', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        // Start with creating an item (normally this happens when we're online)
        await sendStartNewLogItemEvent(testData);

        // Get the initial item
        let items = await expectNrOfItems(1, db);

        // Visualize initial state
        console.log('\nInitial state:');
        visualizeTrackItems(items, NOW);

        // Transition to idle - should update end date to current time
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Idle);

        items = await expectNrOfItems(1, db);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
        });

        // Visualize after going idle
        console.log('\nAfter going Idle:');
        visualizeTrackItems(items, NOW);

        // Come back online - should create a NEW log item
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Online);

        items = await expectNrOfItems(2, db);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 3000,
        });

        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 2,
            beginDate: NOW + 3000,
            endDate: NOW + 3000 + NEW_ITEM_END_DATE_OFFSET,
        });

        // Visualize after going back online
        console.log('\nAfter coming back Online:');
        visualizeTrackItems(items, NOW);
    });

    it.only('should maintain currentLogItem until explicitly stopped', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };

        // Create initial log item
        await sendStartNewLogItemEvent(testData);

        // Verify initial item was created
        let items = await expectNrOfItems(1, db);

        // Change to Idle state
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Idle);

        // Verify no new items were created, just the end date updated
        items = await expectNrOfItems(1, db);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
        });

        // Change to Online state - should create a new item
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('state-changed', State.Online);

        // Verify a new item was created
        items = await expectNrOfItems(2, db);

        // First item's end date should be when we went idle
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 2000,
        });

        // Second item should be new and start when we came back online
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 2,
            beginDate: NOW + 2000,
            endDate: NOW + 2000 + NEW_ITEM_END_DATE_OFFSET,
        });

        visualizeTrackItems(items, NOW);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Offline);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 4000);
        appEmitter.emit('state-changed', State.Online);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 5000);
        appEmitter.emit('state-changed', State.Offline);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 6000);
        appEmitter.emit('state-changed', State.Online);

        // Verify a new item was created
        items = await expectNrOfItems(2, db);
    });

    it.only('should not create new items when stopped', async () => {
        /*
--------------------------------------------------------------------------------
1. TestApp   █████████████
   ID=1    0.0s           1.0s     = 1.0s
................................................................................
2. TestApp                                 ██████████████████████
   ID=2                                  2.0s                    3.0s     = 1.0s
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

        // Create initial log item
        await sendStartNewLogItemEvent(testData);

        // Change to Online state - should create a new item
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Offline);

        await expectNrOfItems(1, db);

        // Change to Online state - should create a new item
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('state-changed', State.Online);

        // Verify a new item was created
        let items = await expectNrOfItems(1, db);

        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Idle);

        await expectNrOfItems(2, db);

        // Change to Online state - should create a new item
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 4000);
        appEmitter.emit('state-changed', State.Online);

        // Verify no new items were created, just the end date updated
        items = await expectNrOfItems(2, db);

        visualizeTrackItems(items, NOW);

        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 2000,
        });

        // Visualize after stopping the item
        console.log('\nAfter stopping the running item:');
        visualizeTrackItems(items, NOW);
    });
});
