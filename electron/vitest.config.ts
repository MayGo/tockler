/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/__tests__/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/dist-electron/**'],
        mockReset: true,
        setupFiles: ['./src/setupTests.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'dist/',
                'dist-electron/',
                '**/*.d.ts',
                'test{,s}/**',
                '**/*.test.{js,cjs,mjs,ts,tsx,jsx}',
                '**/__tests__/**',
            ],
        },
        reporters: ['default'],
        pool: 'forks', // or 'threads'
        isolate: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
