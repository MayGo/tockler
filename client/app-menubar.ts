import { PLATFORM, Aurelia } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

export class AppMenubar {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Aurelia';
    config.map([
      { route: [''], moduleId: PLATFORM.moduleName('./menubar/menubar') }
    ]);

    this.router = router;
  }

}
