import CopyPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import nodeExternals from 'webpack-node-externals';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    target: 'electron-main',

    externals: [
        nodeExternals({
            allowlist: ['get-windows'],
        }),
    ],

    resolve: {
        extensions: ['.ts', '.js'],
    },
    entry: {
        index: path.resolve(__dirname, 'src', 'index.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },

    node: {
        __dirname: false,
        __filename: false,
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        module: 'commonjs',
                    },
                },
            },
        ],
    },
    plugins: [new Dotenv(), new CopyPlugin({ patterns: ['preloadStuff.js'] })],
};
