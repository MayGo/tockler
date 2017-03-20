export class AppSettingsService {
    private service:any;

    constructor() {
        this.service = require('electron').remote.getGlobal('BackgroundService').getAppSettingsService();
    }

}
