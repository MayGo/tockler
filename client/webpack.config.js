const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { optimize: { CommonsChunkPlugin }, ProvidePlugin } = require('webpack');
const { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

// config helpers:
const ensureArray = config => (config && (Array.isArray(config) ? config : [config])) || [];
const when = (condition, config, negativeConfig) =>
    condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const title = 'Tockler';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, './src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const port = process.env.PORT || 3000;

const hotDeps = [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${port}`,
    'webpack/hot/only-dev-server',
];
const deps = [path.resolve('./src/app.ts')];

// prettier-ignore
module.exports = ({ production = false, server = false, extractCss = false, coverage = false } = {}) => ({
  target: 'electron-renderer',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [srcDir, 'node_modules']
  },
  entry: {
    app: (server)?hotDeps.concat(deps):deps
  },

  devServer: {
    hot: true, // Tell the dev-server we're using HMR
    contentBase: outDir,
    publicPath: `http://localhost:${port}/`,
    port: port
  },
  output: {
    path: outDir,
    publicPath: (server) ? `http://localhost:${port}/` : '',
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].bundle.js',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].chunk.js',
  },

  /* node: {
    __dirname: false,
    __filename: false
  },*/
  module: {
    rules: [
      {
        test: /\.less$/,
        // use: ['style-loader', 'css-loader', 'less-loader'],    
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            //resolve-url-loader may be chained before lesss-loader if necessary
            use: [
                'css-loader', 
                'less-loader',
            ]
        })
      },  
      { test: /\.html$/i, loader: 'html-loader' },
      { test: /\.tsx?$/i, loader: 'awesome-typescript-loader', exclude: nodeModulesDir },
      //{ test: /\.tsx$/i, loader: 'react-hot-loader/webpack"', exclude: nodeModulesDir },
      { test: /\.json$/i, loader: 'json-loader' },


      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(ico|png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
      // load these fonts normally, as files:
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
      ...when(coverage, {
        test: /\.[jt]s$/i, loader: 'istanbul-instrumenter-loader',
        include: srcDir, exclude: [/\.{spec,test}\.[jt]s$/i],
        enforce: 'post', options: { esModules: true },
      })
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates
    new FriendlyErrorsWebpackPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }),
    
    new TsConfigPathsPlugin(),
    new CheckerPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(srcDir, 'index.ejs'),
      minify: production ? {
        removeComments: true,
        collapseWhitespace: true
      } : undefined,
      metadata: {
        // available in index.ejs //
        title, server, baseUrl
      },
    }),


    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].bundle.css',
      allChunks: true,
    }),
    ...when(production, new CommonsChunkPlugin({
      name: 'common'
    }))
  ],
})
