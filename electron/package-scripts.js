const { series, crossEnv, concurrent, rimraf, copy } = require('nps-utils')

module.exports = {
  scripts: {
    clean: rimraf('dist'),

    release: series(
      copy("'../client/dist/*' './dist'"),
      'build -c electron-builder.yml'
    ),
    main: {
      default: series(
        'nps main.build.dev',
        'nps main.run'
      ),
      run: 'cross-env HOT=1 NODE_ENV=development electron ./dist',
      build: {
        dev: series(
          'nps clean',
          'webpack --config webpack.config.main.js  -d'
        ),
        prod: series(
          'nps clean',
          'webpack --config webpack.config.main.js --progress --env.production'
        ),
      }
    },
    test: {
      default: 'nps test.e2e',
      unit: 'jest',
      e2e: 'jest -c jest-e2e.json'
    }
  }
}
