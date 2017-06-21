const path = require('path');

const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack')
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');

const nodeExternals = require('webpack-node-externals');

module.exports = ({ production, server, extractCss, coverage } = {}) => ({
  target: 'electron-main',

  externals: [nodeExternals()],

  resolve: {
    extensions: ['.ts', '.js']
  },
  entry: {
    'index': path.resolve(__dirname, 'app', 'index.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
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
        loader: 'awesome-typescript-loader',
        options: { configFileName: 'tsconfig.main.json' }
      }
    ]
  },
  plugins: [
    new TsConfigPathsPlugin(),
    new CheckerPlugin()
  ],
})
