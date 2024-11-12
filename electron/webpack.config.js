const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
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
        libraryTarget: 'commonjs2',
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
