import { Aurelia, LogManager } from 'aurelia-framework';
import environment from './environment';
import * as Backend from 'i18next-xhr-backend';
import { PLATFORM } from 'aurelia-pal';

import 'tether';
import 'bootstrap';
import 'toastr/build/toastr.css';
import './style/_themes/blue-theme.scss';
import './style/app.scss';
import 'material-design-iconic-font/dist/css/material-design-iconic-font.css';
import 'font-awesome/css/font-awesome.css';
import 'aurelia-dialog/styles/output.css';
import 'typeface-berkshire-swash';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';

const remote = (<any>window).nodeRequire('electron').remote;

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
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-dialog'))
    .plugin(PLATFORM.moduleName('au-table'))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), instance => {
      // register backend plugin
      instance.i18next.use(Backend);

      function loadLocales(url, options, callback, data) {
        try {
          let waitForLocale = require('bundle-loader!./locales/en/' +
            url +
            '.json');
          waitForLocale(locale => {
            callback(locale, { status: '200' });
          });
        } catch (e) {
          logger.error(e);
          callback(null, { status: '404' });
        }
      }

      return instance
        .setup({
          backend: {
            loadPath: '{{ns}}',
            parse: data => data,
            ajax: loadLocales,
          },
          lng: 'en',
          attributes: ['t', 'i18n'],
          fallbackLng: 'en',
          debug: false,
          ns: ['translation', 'validation', 'field', 'messages', 'nav'],
          defaultNS: 'translation',
        })
        .then(() => {
          const router = aurelia.container.get(Router);
          const events = aurelia.container.get(EventAggregator);
          router.transformTitle = title => instance.tr(title);
          events.subscribe('i18n:locale:changed', () => {
            router.updateTitle();
          });
        });
    })
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('au-table'));

  //if (environment.debug) {
  aurelia.use.developmentLogging();
  // }

  const window = remote.getCurrentWindow();
  const isMenubarWin = window.id == 2;

  await aurelia.start();
  await aurelia.setRoot(
    isMenubarWin
      ? PLATFORM.moduleName('app-menubar')
      : PLATFORM.moduleName('app'),
  );
}
