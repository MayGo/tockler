import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject, PLATFORM } from "aurelia-framework";

import { BindingSignaler } from 'aurelia-templating-resources';
import * as toastr from "toastr";

const mainConfig = (<any>window).nodeRequire('electron').remote.getGlobal('shared');

const ipcRenderer = (<any>window).nodeRequire('electron').ipcRenderer;

@autoinject
export class App {
    router: Router;

    private rtUpdater: any;

    constructor(private bindingSignaler: BindingSignaler) {
        ipcRenderer.on('message', function (event, text) {
            toastr.info(text);
        });
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Tockler';
        config.map([
            {
                route: ['menubar'], name: 'menubar', moduleId: PLATFORM.moduleName('./menubar/menubar'),
                nav: (mainConfig.isDev && !mainConfig.trayEnabledInDev),
                title: 'nav:menubar'
            },
            { route: ['', 'timeline'], name: 'timeline', moduleId: PLATFORM.moduleName('./timeline/timeline-view'), nav: true, title: 'nav:timeline' },
            { route: 'summary', name: 'summary', moduleId: PLATFORM.moduleName('./summary/summary'), nav: true, title: 'nav:summary' },
            { route: 'settings', name: 'settings', moduleId: PLATFORM.moduleName('./settings/settings'), nav: true, title: 'nav:settings', settings: { icon: 'fa fa-cog' } }
        ]);

        this.router = router;
    }

    activate(params, config) {
        this.rtUpdater = setInterval(() => this.bindingSignaler.signal('rt-update'), 1000);
    }

    deactivate() {
        if (this.rtUpdater) {
            clearInterval(this.rtUpdater);
            this.rtUpdater = null;
        }
    }
}
