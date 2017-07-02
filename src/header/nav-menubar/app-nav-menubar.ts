import { autoinject, containerless, bindable, LogManager } from "aurelia-framework";

let logger = LogManager.getLogger('AppNavMenubar');

const ipcRenderer = (<any>window).nodeRequire('electron').ipcRenderer;

@autoinject
@containerless
export class AppNavMenubar {

  toggleMainWindow() {
    ipcRenderer.send('toggle-main-window');
  }

  exitApp() {
    ipcRenderer.send('close-app');
  }
}