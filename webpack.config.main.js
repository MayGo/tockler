const path = require('path');

const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack')
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');

const nodeExternals = require('webpack-node-externals');

// primary config:
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'app');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const pkgJson = require('./package.json');


const tsConfigBase = 'tsconfig.webpack.json';
const customTsConfigFileName = 'tsconfig.main.json';

const atlConfig = {
  configFileName: customTsConfigFileName
};

module.exports = ({ production, server, extractCss, coverage } = {}) => ({
  target: 'electron-main',
  
  externals: [nodeExternals()],

  resolve: {
    extensions: ['.ts', '.js']
  },
  entry: {
    'index': './app/index.ts'
  },
  output: {
    path: outDir,
    filename: 'index.js'

  },


  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        loader: 'awesome-typescript-loader?' + JSON.stringify(atlConfig)
      }
    ]
  },
  plugins: [
    new TsConfigPathsPlugin(),
    new CheckerPlugin()
  ],
})
