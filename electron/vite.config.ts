import fs from 'fs-extra';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

// Function to copy migrations to dist-electron
function copyMigrations() {
    return {
        name: 'copy-migrations',
        closeBundle() {
            const srcDir = resolve(__dirname, 'src/drizzle/migrations');
            const destDir = resolve(__dirname, 'dist-electron/drizzle/migrations');
            fs.copySync(srcDir, destDir, { overwrite: true });
            console.log('✓ Drizzle migrations copied to dist-electron');
        },
    };
}

export default defineConfig({
    plugins: [
        electron({
            main: {
                // Shortcut of `build.lib.entry`
                entry: 'src/index.ts',

                vite: {
                    build: {
                        rollupOptions: {
                            // Here are some C/C++ modules them can't be built properly
                            external: ['better-sqlite3', 'active-win', 'node-machine-id'],
                        },
                    },
                    plugins: [copyMigrations()],
                },
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`
                input: 'src/preloadStuff.ts',
            },
            // Optional: Use Node.js API in the Renderer process
            renderer: {},
        }),
    ],
});
