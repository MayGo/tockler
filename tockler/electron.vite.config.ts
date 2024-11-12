import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs';
import commonjs from '@rollup/plugin-commonjs';

import { exec } from 'child_process';
import react from '@vitejs/plugin-react';

// Custom plugin to run shell commands post-build
function RunShellCommandPostBuild() {
    return {
        name: 'run-shell-command-post-build', // name of the plugin
        buildEnd() {
            // Command to execute
            const command = 'chmod +x .webpack/main/native_modules/main';
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                if (stdout) console.log(`stdout: ${stdout}`);
                if (stderr) console.error(`stderr: ${stderr}`);
            });
        },
    };
}

export default defineConfig({
    main: {
        plugins: [
            externalizeDepsPlugin(),
            commonjs({ include: ['ajv', 'uri-js', 'get-windows'] }),
            // viteCommonjs({ include: ['ajv'] }),
            RunShellCommandPostBuild(),
        ],
        resolve: {
            alias: {
                'mock-aws-s3': resolve(__dirname, 'src/main/empty.ts'),
                'aws-sdk': resolve(__dirname, 'src/main/empty.ts'),
                'better-sqlite3': resolve(__dirname, 'src/main/empty.ts'),
                'pg-query-stream': resolve(__dirname, 'src/main/empty.ts'),
                tedious: resolve(__dirname, 'src/main/empty.ts'),
                mysql: resolve(__dirname, 'src/main/empty.ts'),
                mysql2: resolve(__dirname, 'src/main/empty.ts'),
                oracledb: resolve(__dirname, 'src/main/empty.ts'),
                pg: resolve(__dirname, 'src/main/empty.ts'),
                nock: resolve(__dirname, 'src/main/empty.ts'),
            },
        },
        // optimizeDeps: {
        //     esbuildOptions: {
        //         plugins: [esbuildCommonjs(['get-windows'])],
        //     },
        // },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
            },
        },
        plugins: [react()],
    },
});
