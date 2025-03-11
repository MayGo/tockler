// add Vitest functions here globally
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('./logger');
vi.mock('./services/EventEmitter');

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
    cleanup();
});
