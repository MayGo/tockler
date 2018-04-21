const remote = (<any>window).require('electron').remote;

export class SettingsService {
    static service: any = remote.getGlobal('SettingsService');

    static updateByName(name, jsonData) {
        return SettingsService.service.updateByName(name, jsonData);
    }

    static getRunningLogItem() {
        return SettingsService.service.getRunningLogItem();
    }

    static fetchWorkSettings() {
        return SettingsService.service.fetchWorkSettings();
    }

    static fetchAnalyserSettings() {
        return SettingsService.service.fetchAnalyserSettings();
    }
}
