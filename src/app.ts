import {Router, RouterConfiguration} from "aurelia-router";

export class App {
    router:Router;

    configureRouter(config:RouterConfiguration, router:Router) {
        config.title = 'Aurelia';
        config.map([
            {route: ['', 'menubar'], name: 'menubar', moduleId: './menubar', nav: true, title: 'Menubar'},
            {route: 'timeline', name: 'timeline', moduleId: './timeline/timeline-view', nav: true, title: 'Timeline'},
            {route: 'summary', name: 'summary', moduleId: './summary/summary', nav: true, title: 'Summary'},
            {route: 'settings', name: 'settings', moduleId: './settings/settings', nav: true, title: 'Settings'}
        ]);

        this.router = router;
    }
}
