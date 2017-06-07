import { Aurelia, LogManager } from 'aurelia-framework'
import environment from './environment';
import * as Backend from 'i18next-xhr-backend';
import { PLATFORM } from 'aurelia-pal';

import 'tether';
import 'bootstrap';
import './style/_themes/blue-theme.scss';
import './style/app.scss';


//Configure Bluebird Promises.
//Note: You may want to use environment-specific configuration.
// (<any>Promise).config({
//   warnings: {
//     wForgottenReturn: false
//   }
// });
let logger = LogManager.getLogger('InitMain');

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .plugin(PLATFORM.moduleName('aurelia-dialog'))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), (instance) => {
      // register backend plugin
      instance.i18next.use(Backend);

      function loadLocales(url, options, callback, data) {
        try {
          let waitForLocale = require('bundle-loader!./locales/en/' + url + '.json');
          waitForLocale((locale) => {
            callback(locale, { status: '200' });
          })
        } catch (e) {
          logger.error(e);
          callback(null, { status: '404' });
        }

      }

      return instance.setup({
        backend: {
          loadPath: '{{ns}}',
          parse: (data) => data,
          ajax: loadLocales
        },
        lng: 'en',
        attributes: ['t', 'i18n'],
        fallbackLng: 'en',
        debug: false,
        ns: ['translation', 'validation', 'field', 'messages', 'nav'],
        defaultNS: 'translation'
      });
    })
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('au-table'))

  //if (environment.debug) {
  aurelia.use.developmentLogging();
  // }

  await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}
