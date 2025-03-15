import { vi } from 'vitest';

export const logManager = {
    getLogger: () => ({
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    }),
};
