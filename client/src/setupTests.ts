// add Vitest functions here globally
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('./logger');

// Mock window.matchMedia - required for Chakra UI components in test environment
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock scrollTo for menu elements
// This fixes the "menuRef.current?.scrollTo is not a function" error with React 19 + Chakra UI
HTMLElement.prototype.scrollTo = HTMLElement.prototype.scrollTo || vi.fn();

// Mock ResizeObserver which is not available in jsdom
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

// Add ResizeObserver to the global object
global.ResizeObserver = ResizeObserverMock;

// Mock Canvas context
// Instead of modifying the prototype directly, use a vi.spyOn approach to avoid TypeScript errors
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (contextType) {
    if (contextType === '2d') {
        return {
            font: '',
            measureText: (text: string) => ({ width: text.length * 10 }), // Simple approximation
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Array(4),
            })),
            putImageData: vi.fn(),
            createImageData: vi.fn(() => []),
            setTransform: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            fillText: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            transform: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
    }

    // Default to null for other context types
    return null;
});

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
    cleanup();
});
