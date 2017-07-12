const { series, crossEnv, concurrent, rimraf } = require('nps-utils')

module.exports = {
  scripts: {

    release: 'build -c electron-builder.yml',
    main: {
      default: series(
        'nps main.build.dev',
        'nps main.run'
      ),
      run: 'cross-env NODE_ENV=development electron ./dist',
      build: {
        dev: 'webpack --config webpack.config.main.js  -d',
        prod: 'webpack --config webpack.config.main.js --progress --env.production'
      }
    },
    test: {
      default: 'nps test.e2e',
      unit: 'jest',
      e2e: 'jest -c jest-e2e.json'
    }
  }
}
