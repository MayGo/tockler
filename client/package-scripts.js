const { series, crossEnv, concurrent, rimraf } = require('nps-utils')

module.exports = {
  scripts: {
    default: 'nps run',
    clean: rimraf('dist'),
    serve: "webpack-dev-server -d --devtool '#source-map' --inline --hot --env.server",

    run: {
      default: 'nps run.hot',
      simple: 'nps build.dev',

      hot: series(
        'nps build.devServer',
        'nps serve'
      ),
    },

    build: {
      dev: series(
        'nps clean',
        'webpack --watch  -d'
      ),
      devServer: series(
        'nps clean',
        'webpack  -d --env.server'
      ),
      prod: series(
        'nps clean',
        'webpack --progress --env.production'
      ),
    },

    test: {
      default: 'nps test.e2e',
      unit: 'jest',
      e2e: 'jest -c jest-e2e.json'
    }
  }
}
