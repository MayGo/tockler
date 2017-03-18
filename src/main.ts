import {Aurelia} from 'aurelia-framework'
import environment from './environment';
import * as Backend from 'i18next-xhr-backend';

//Configure Bluebird Promises.
//Note: You may want to use environment-specific configuration.
// (<any>Promise).config({
//   warnings: {
//     wForgottenReturn: false
//   }
// });

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  aurelia.use.plugin('aurelia-i18n', instance => {
    instance.i18next.use(Backend);
    return instance.setup({
      ns: ['translation', 'admin'],
      defaultNs: 'translation',
      backend: {
        loadPath: 'locales/{{lng}}/{{ns}}.json',
      },
      lng : 'en',
      attributes : ['t','i18n'],
      fallbackLng : 'en',
      debug : false
    });
  });

  aurelia.use.plugin('aurelia-validation');
  aurelia.use.plugin('aurelia-materialize-bridge', b => b.useAll());

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  await aurelia.start();
  aurelia.setRoot('app');
}
