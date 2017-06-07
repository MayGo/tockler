import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject, PLATFORM } from "aurelia-framework";

import { BindingSignaler } from 'aurelia-templating-resources';

let mainConfig: any = {
    isDev: true,
    trayEnabledInDev: false,
};

@autoinject
export class App {
    router: Router;

    private rtUpdater: any;

    constructor(private bindingSignaler: BindingSignaler) {
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Tockler';
        config.map([
            {
                route: ['menubar'], name: 'menubar', moduleId: PLATFORM.moduleName('./menubar/menubar'),
                nav: (mainConfig.isDev && !mainConfig.trayEnabledInDev),
                title: 'Menubar'
            },
            { route: ['', 'timeline'], name: 'timeline', moduleId: PLATFORM.moduleName('./timeline/timeline-view'), nav: true, title: 'Timeline' },
            { route: 'summary', name: 'summary', moduleId: PLATFORM.moduleName('./summary/summary'), nav: true, title: 'Summary' },
            { route: 'settings', name: 'settings', moduleId: PLATFORM.moduleName('./settings/settings'), nav: true, title: 'Settings' }
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
