import { PLATFORM, Aurelia } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

const ipcRenderer = (<any>window).nodeRequire('electron').ipcRenderer;

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Aurelia';
    config.map([
      { route: [''], moduleId: PLATFORM.moduleName('./menubar/menubar') }
    ]);

    this.router = router;
  }

  toggleMainWindow() {
    ipcRenderer.send('toggle-main-window')
  };

  exitApp() {
    ipcRenderer.send('close-app')
  }
}
