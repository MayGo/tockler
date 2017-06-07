import { Router, RouterConfiguration } from "aurelia-router";
import { PLATFORM } from "aurelia-framework";

let mainConfig: any = {
    isDev: true,
    trayEnabledInDev: false,
};

export class App {
    router: Router;

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
}
