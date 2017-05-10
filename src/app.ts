import { Router, RouterConfiguration } from "aurelia-router";

let mainConfig: any = (<any>window).nodeRequire('./app/config');

export class App {
    router: Router;

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Tockler';
        config.map([
            {
                route: ['menubar'], name: 'menubar', moduleId: './menubar/menubar',
                nav: (mainConfig.isDev && !mainConfig.trayEnabledInDev),
                title: 'Menubar'
            },
            { route: ['', 'timeline'], name: 'timeline', moduleId: './timeline/timeline-view', nav: true, title: 'Timeline' },
            { route: 'summary', name: 'summary', moduleId: './summary/summary', nav: true, title: 'Summary' },
            { route: 'settings', name: 'settings', moduleId: './settings/settings', nav: true, title: 'Settings' }
        ]);

        this.router = router;
    }
}
