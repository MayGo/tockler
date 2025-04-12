import { vi } from 'vitest';

// Define the mock implementation outside of the factory function
const mockState = {
    listeners: new Map<string, Function[]>(),
};

class MockWorker {
    private actions: any;
    private actionsLoaded: Promise<void>;

    constructor(workerPath: string, options: any) {
        console.warn('MockWorker constructor', workerPath, options);
        this.actionsLoaded = this.setActions();
    }

    async setActions() {
        const { appSettingService } = await import('../drizzle/worker/queries/app-setting-service');
        const { settingsService } = await import('../drizzle/worker/queries/settings-service');
        const { trackItemService } = await import('../drizzle/worker/queries/track-item-service');
        const { trackItemDb } = await import('../drizzle/worker/queries/trackItem.db');
        const { dbService } = await import('../drizzle/worker/dbService');

        this.actions = Object.assign({}, trackItemService, appSettingService, settingsService, trackItemDb, dbService);
    }

    on(event: string, callback: Function) {
        if (!mockState.listeners.has(event)) {
            mockState.listeners.set(event, []);
        }
        mockState.listeners.get(event)!.push(callback);
    }

    async postMessage(msg: { id: number; action: string; args: any[] }) {
        try {
            // Wait for actions to be loaded before processing the message
            await this.actionsLoaded;

            const result = await this.actions[msg.action]?.(...msg.args);
            const messageListeners = mockState.listeners.get('message') || [];
            messageListeners.forEach((listener) => listener({ id: msg.id, result }));
        } catch (error: any) {
            const messageListeners = mockState.listeners.get('message') || [];
            messageListeners.forEach((listener) => listener({ id: msg.id, error: error.message }));
        }
    }
}

// Reset the mock state
export function resetMockState() {
    mockState.listeners.clear();
}

// Create the mock factory
export function createWorkerMock() {
    return {
        Worker: MockWorker,
        workerData: {
            outputPath: 'file::memory:',
        },
        parentPort: {
            on: vi.fn(),
            postMessage: vi.fn(),
        },
        // Expose these for test manipulation if needed
        _state: mockState,
    };
}
