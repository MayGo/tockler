'use strict';
const path = require('path');

module.exports = function (config) {
  config.set({
    /**
     * base path that will be used to resolve all patterns (e.g. files, exclude)
     */
    basePath: path.dirname(__dirname),

    /**
     * Frameworks to use
     *
     * available frameworks: https://npmjs.org/browse/keyword/karma-adapter
     */
    frameworks: [ 'jasmine' ],

    /**
     * list of files / patterns to load in the browser
     * we are building the test environment in ./spec-bundle.js
     */
    files: [
      { pattern: 'test/karma-bundle.js', watched: false }
    ],

    /*
     * preprocess matching files before serving them to the browser
     * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: {
      'test/karma-bundle.js': [ 'webpack' ]
    },

    webpack: require('../webpack.config')({ coverage: true }),

    /*
     * test results reporter to use
     *
     * possible values: 'dots', 'progress'
     * available reporters: https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: [ 'mocha', 'progress', 'coverage-istanbul' ],

    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly', 'text-summary' ],
      dir: path.resolve(__dirname, 'coverage-karma'),
      fixWebpackSourcePaths: true,
    },

    // Webpack please don't spam the console when running in karma!
    webpackServer: { noInfo: true },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    /*
     * level of logging
     * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    /*
     * start these browsers
     * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     */
    browsers: [
      'Chrome',
    ],

    /*
     * Continuous Integration mode
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: true
  })
}
