import { Aurelia } from 'aurelia-framework'
import environment from './environment';
import * as Backend from 'i18next-xhr-backend';
import { PLATFORM } from 'aurelia-pal';

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
  //  .feature(PLATFORM.moduleName("./resources"))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), instance => {
      instance.i18next.use(Backend);
      return instance.setup({
        ns: ['translation', 'admin'],
        defaultNs: 'translation',
        backend: {
          loadPath: 'locales/{{lng}}/{{ns}}.json',
        },
        lng: 'en',
        attributes: ['t', 'i18n'],
        fallbackLng: 'en',
        debug: false
      });
    })
    .plugin(PLATFORM.moduleName('aurelia-validation'))
  //  .plugin(PLATFORM.moduleName('aurelia-table'))
    .plugin(PLATFORM.moduleName('aurelia-materialize-bridge'), b => b.useAll());

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

   await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}