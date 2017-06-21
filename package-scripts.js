const { series, crossEnv, concurrent, rimraf } = require('nps-utils')
const { config: { port: E2E_PORT } } = require('./test/protractor.conf')

module.exports = {
  scripts: {
    run: concurrent.nps(
      'clean',
      'main',
      'renderer'
    ),

    clean: rimraf('dist'),


    build: 'nps renderer.build',
    release: 'build -c electron-builder.yml',
    main: {
      default: series(
        'nps main.build.dev',
        'nps main.run'
      ),
      run: 'cross-env NODE_ENV=development electron ./dist',
      build: {
        dev: 'webpack --config webpack.config.main.js --progress -d'
      }
    },
    renderer: {
      default: 'nps renderer.build.development',
      build: {
        development: 'webpack --watch --progress -d',
        production: {
          default: series(
            'nps renderer.build.before',
            'webpack --progress --env.production'
          )
        }
      }
    }
  }
}
