const { series, crossEnv, concurrent, rimraf, copy } = require('nps-utils');

// prettier-ignore
module.exports = {
  scripts: {
    default: series(
      'nps build.dev',
      'nps run'
    ),

    clean: rimraf('dist'),

    run: {
      default: 'cross-env ELECTRON_RUN_AS_NODE=true NODE_ENV=development electron ./dist',
      hot: 'cross-env HOT=1 NODE_ENV=development electron ./dist'
    }, 

    build: {
      dev: series(
        'nps clean',
        'webpack -d'
      ),
      prod: series(
        'nps clean',
        'webpack --progress --env.production'
      )
    },

    test: {
      default: 'nps test.e2e',
      unit: 'jest',
      e2e: 'jest -c jest-e2e.json'
    },
    
    release: series(
      'build -c electron-builder.yml'
    )
  }
}
