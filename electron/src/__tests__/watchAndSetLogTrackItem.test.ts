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
import { getTimestamp } from './time.testUtils';

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

        // Wait a moment to ensure the endDate will be different
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);

        await sendEndRunningLogItemEvent();

        // Verify the item was updated in the database
        const updatedItems = await selectLogItem('TestApp');

        expect(updatedItems.length).toBe(1);

        expect(updatedItems[0].endDate).toBe(NOW + 1000);
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
    });

    it('state-changed event should start new log item if state changes to idle-online-idle', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();

        const expectNrOfItems = async (nr: number) => {
            await vi.waitFor(async () => {
                const items = await selectLogItem('TestApp');
                expect(items.length).toBe(nr);
            });
        };

        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Test Title',
        };
        // create a log item and wait for it to be updated
        await sendStartNewLogItemEvent(testData);
        await expectNrOfItems(1);

        // trigger new item creation
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Idle);
        await expectNrOfItems(2);

        // should save the new item dates
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('state-changed', State.Online);
        await expectNrOfItems(3);

        // should save the new item dates
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Idle);
        await expectNrOfItems(3);

        const items = await selectLogItem('TestApp');

        expect(items.length).toBe(4);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
        });
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 2,
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
        });

        expect(items[2]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 3,
            beginDate: NOW + 2000,
            endDate: NOW + 3000,
        });
        expect(items[3]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 4,
            beginDate: NOW + 3000,
            endDate: NOW + 3000 + NEW_ITEM_END_DATE_OFFSET,
        });
    });
});
