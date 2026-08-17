import fs from 'fs-extra';
import { builtinModules } from 'module';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

// Copy migrations to dist-electron immediately (not in a closeBundle hook) so this runs
// for `vite dev` too, not just `vite build`. vite-plugin-electron's dev-mode watch builds
// don't go through the outer config's Rollup bundle lifecycle, so closeBundle never fires
// there — only calling this eagerly, as soon as the config file loads, covers both cases.
function copyMigrationsNow() {
    const srcDir = resolve(__dirname, 'src/drizzle/migrations');
    const destDir = resolve(__dirname, 'dist-electron/drizzle/migrations');
    fs.copySync(srcDir, destDir, { overwrite: true });
    console.log('✓ Drizzle migrations copied to dist-electron');
}

copyMigrationsNow();

export default defineConfig({
    plugins: [
        electron([
            {
                // Main process entry
                entry: 'src/index.ts',
                onstart(options) {
                    options.startup();
                },
                vite: {
                    build: {
                        rollupOptions: {
                            external: [...builtinModules, 'better-sqlite3', 'active-win'],
                        },
                    },
                },
            },
            {
                // Preload scripts
                entry: 'src/preloadStuff.ts',
            },
            {
                // Worker thread
                entry: 'src/drizzle/worker/dbWorker.ts',
                onstart(options) {
                    options.reload();
                },
                vite: {
                    build: {
                        rollupOptions: {
                            external: [...builtinModules, 'better-sqlite3'],
                        },
                    },
                },
            },
        ]),
        renderer(),
    ],
});
