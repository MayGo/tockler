import CopyPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import nodeExternals from 'webpack-node-externals';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    target: 'electron-main',

    resolve: {
        extensions: ['.ts', '.js', '.mjs'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
            '.mjs': ['.mts', '.mjs'],
        },
    },
    entry: {
        index: path.resolve(__dirname, 'src', 'index.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    experiments: {
        outputModule: true,
    },
    externals: [
        nodeExternals({
            allowlist: ['get-windows'],
        }),
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [new Dotenv(), new CopyPlugin({ patterns: ['preloadStuff.js'] })],
};
