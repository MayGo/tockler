
const remote = (<any>window).nodeRequire('electron').remote;

export class SettingsService {
    private service: any;

    constructor() {
        this.service = remote.getGlobal('SettingsService');
    }

    saveRunningLogItemReferemce(refId) {
        return this.service.saveRunningLogItemReferemce(refId);
    }

    updateByName(name, jsonData)  {
        return this.service.updateByName(name, jsonData) ;
    }

    getRunningLogItem() {
        return this.service.getRunningLogItem();
    }

    fetchWorkSettings() {
        return this.service.fetchWorkSettings();
    }
    
    fetchAnalyserSettings() {
        return this.service.fetchAnalyserSettings();
    }

}
