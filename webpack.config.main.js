const path = require('path');

const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack')
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');

// primary config:
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'app');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');

module.exports = ({ production, server, extractCss, coverage } = {}) => ({
  target: 'electron-main',
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [srcDir, 'node_modules'],
  },
  entry: {
    index: ['index']
  },
  output: {
    path: outDir,
    filename: 'index.js'

  },

  /* node: {
    __dirname: false,
    __filename: false
  },*/
  module: {
    rules: [
      { test: /\.ts$/i, loader: 'awesome-typescript-loader', exclude: nodeModulesDir }
    ]
  },
  plugins: [
    new TsConfigPathsPlugin(),
    new CheckerPlugin()
  ],
})
