

const remote = (<any>window).nodeRequire('electron').remote;

export class AppSettingsService {
    private service:any;

    constructor() {
        this.service = remote.getGlobal('BackgroundService').getAppSettingsService();
    }

}
