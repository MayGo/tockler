

const remote = (<any>window).nodeRequire('electron').remote;

export class AppSettingsService {
    private service: any;

    constructor() {
        this.service = remote.getGlobal('AppSettingService');
    }

    changeColorForApp(appName, color) {
        return this.service.changeColorForApp(appName, color);
    }

}
