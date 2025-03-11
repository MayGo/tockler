// Mock electron
vi.mock('electron', () => {
    return {
        app: {
            getPath: vi.fn(() => '/mock/path'),
            on: vi.fn(),
            quit: vi.fn(),
        },
        ipcMain: {
            on: vi.fn(),
            handle: vi.fn(),
        },
    };
});

// Mock electron-is-dev
vi.mock('electron-is-dev', () => false);

// Mock node-machine-id
vi.mock('node-machine-id', () => ({
    machineIdSync: vi.fn(() => 'mock-machine-id'),
}));
