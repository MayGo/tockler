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
import { visualizeTrackItems } from './visualize.testUtils';

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
        const { addActiveWindowWatch } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');

        await addActiveWindowWatch();

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
        const { addActiveWindowWatch } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');

        await addActiveWindowWatch();

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

    it('watchAndSetAppTrackItemRemove should end current item and save it', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { addActiveWindowWatch, watchAndSetAppTrackItemCleanup: watchAndSetAppTrackItemRemove } = await import(
            '../background/watchTrackItems/watchAndSetAppTrackItem'
        );

        // Spy on appEmitter's removeAllListeners method
        const removeAllListenersSpy = vi.spyOn(appEmitter, 'removeAllListeners');

        // Create a mock for the removeActiveWindowWatcher function
        vi.mock('../background/watchTrackItems/watchForActiveWindow', () => ({
            startActiveWindowWatcher: vi.fn().mockReturnValue(vi.fn()),
        }));

        // Set up the initial state
        await addActiveWindowWatch();

        // Create a test app window data
        const testApp: NormalizedActiveWindow = {
            app: 'TestApp',
            title: 'Test Title',
        };

        // Add color to make verification easier
        await addColorToApp(testApp.app, COLORS.BLUE);

        // Emit the active window changed event
        appEmitter.emit('active-window-changed', testApp);

        // Mock Date.now to advance time for the end date
        const END_TIME = NOW + 5000;
        vi.spyOn(Date, 'now').mockImplementation(() => END_TIME);

        // Initially there should be no items in the database (since our current item hasn't been saved yet)
        expect((await selectAllAppItems(db)).length).toBe(0);

        // Call the remove function which should save the current item
        await watchAndSetAppTrackItemRemove();

        // Verify appEmitter.removeAllListeners was called with 'active-window-changed'
        expect(removeAllListenersSpy).toHaveBeenCalledWith('active-window-changed');

        // Verify an item was saved to the database
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));

        // Verify the saved item has the correct properties
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testApp,
            id: 1,
            beginDate: NOW,
            endDate: END_TIME,
            color: COLORS.BLUE,
        });
    });

    it('ends app tracking when state changes to IDLE/OFFLINE', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetAppTrackItem } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');
        const { State } = await import('../enums/state');

        const backgroundJobIntervalSeconds = 1;

        await watchAndSetAppTrackItem(backgroundJobIntervalSeconds);

        const testApp: NormalizedActiveWindow = {
            app: 'TestApp',
            title: 'Test Title',
        };

        await addColorToApp(testApp.app ?? '', COLORS.GREEN);

        // Emit active window changed event
        appEmitter.emit('active-window-changed', testApp);

        // This saves TestApp to db, and clears the ongoing item
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Idle);

        // Verify item was saved with correct end date
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        let items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });

        // Change back to ONLINE and emit new window
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('state-changed', State.Online);
        appEmitter.emit('active-window-changed', testApp);

        // Change to IDLE again, that means we are
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Idle);

        // Verify second item was saved
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        items = await selectAllAppItems(db);
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testApp,
            id: 2,
            beginDate: NOW + 2000,
            endDate: NOW + 3000,
            color: COLORS.GREEN,
        });

        visualizeTrackItems(items, NOW);
    });
});
