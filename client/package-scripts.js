const { series, crossEnv, concurrent, rimraf } = require('nps-utils')

module.exports = {
  scripts: {
    "serve": "webpack-dev-server -d --devtool '#source-map' --inline --hot --env.server",

    "hot-server": "cross-env NODE_ENV=development node --max_old_space_size=2096 server.js",
    renderer: {
      default: 'nps renderer.build.dev',
      build: {
        dev: 'webpack --watch  -d',
        prod: 'webpack --progress --env.production'
      }
    },
    test: {
      default: 'nps test.e2e',
      unit: 'jest',
      e2e: 'jest -c jest-e2e.json'
    }
  }
}
