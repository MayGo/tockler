import electron from 'vite-plugin-electron/simple';

export default {
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
};
