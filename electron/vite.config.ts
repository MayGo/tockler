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
                            external: [
                                'node-gyp',
                                'sqlite3',
                                'electron-builder',
                                'electron',
                                'mock-aws-s3',
                                'aws-sdk',
                                'nock',
                                'better-sqlite3',
                                'tedious',
                                'mysql',
                                'mysql2',
                                'oracledb',
                                'pg',
                                'pg-query-stream',
                            ],
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
