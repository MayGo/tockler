const { series, crossEnv, concurrent, rimraf, copy } = require('nps-utils')

module.exports = {
  scripts: {
    default: series(
      'nps build.dev',
      'nps run'
    ),

    clean: rimraf('dist'),

    run: {
      default: 'cross-env NODE_ENV=development electron ./dist',
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
      copy("'../client/dist/*' './dist'"),
      'build -c electron-builder.yml'
    )

  }
}
