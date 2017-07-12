const { series, crossEnv, concurrent, rimraf } = require('nps-utils')

module.exports = {
  scripts: {
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
