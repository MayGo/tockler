module.exports = {
    ipcMain: {
        on: vi.fn(),
        emit: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    dialog: {
        showSaveDialog: vi.fn().mockResolvedValue({ filePath: null }),
    },
    app: {
        getPath: vi.fn().mockReturnValue('/mock/path'),
    },
    Notification: class {
        constructor() {}
        show() {}
        on() {}
        removeAllListeners() {}
        static isSupported() {
            return false;
        }
    },
};
