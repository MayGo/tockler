const path = require('path');
const os = require('os');

const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack')
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const nodeExternals = require('webpack-node-externals');
const tsConfigPath = path.resolve(__dirname, 'app', 'tsconfig.main.json');

let tsOptions = { configFileName: tsConfigPath }

// AppVeyor fix, needs tsconfig insteadof configFileName
if (os.platform() === 'win32') {
  tsOptions = { tsconfig: tsConfigPath }
}
console.log("Using tsOptions:", tsOptions)

module.exports = {
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
        options: tsOptions
      }
    ]
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new TsConfigPathsPlugin(),
    new CheckerPlugin()
  ],
}
