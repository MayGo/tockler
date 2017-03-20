export class SettingsService {
    private service:any;

    constructor() {
        this.service = require('electron').remote.getGlobal('BackgroundService').getSettingsService();
    }

    saveRunningLogItemReferemce(refId) {
        return this.service.saveRunningLogItemReferemce(refId);
    }

    getRunningLogItem() {
        return this.service.getRunningLogItem();
    }

}
