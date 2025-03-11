/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// @ts-expect-error - no TS types yet for beta test.
import PluginObject from 'babel-plugin-react-compiler';

// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [[PluginObject], react()],
    server: {
        port: 3000,
        host: '127.0.0.1',
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.d.ts',
                'test{,s}/**',
                '**/*.test.{js,cjs,mjs,ts,tsx,jsx}',
                '**/__tests__/**',
            ],
        },
    },
});
