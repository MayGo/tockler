import { vi } from 'vitest';

export const EventEmitter = {
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
};
