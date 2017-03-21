
const remote = (<any>window).nodeRequire('electron').remote;

export class SettingsService {
    private service:any;

    constructor() {
        this.service = remote.getGlobal('BackgroundService').getSettingsService();
    }

    saveRunningLogItemReferemce(refId) {
        return this.service.saveRunningLogItemReferemce(refId);
    }

    getRunningLogItem() {
        return this.service.getRunningLogItem();
    }

}
