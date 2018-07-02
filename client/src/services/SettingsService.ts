const remote = (<any>window).require('electron').remote;

export class SettingsService {
    static service: any = remote.getGlobal('SettingsService');

    static async updateByName(name, jsonData) {
        console.error(jsonData, JSON.stringify(jsonData), JSON.parse(JSON.stringify(jsonData)));
        return await SettingsService.service.updateByName(name, JSON.stringify(jsonData));
    }

    static getRunningLogItem() {
        return SettingsService.service.getRunningLogItem();
    }

    static fetchWorkSettings() {
        return SettingsService.service.fetchWorkSettings();
    }

    static async fetchAnalyserSettings() {
        const jsonStr = await SettingsService.service.fetchAnalyserSettingsJsonString();
        console.log('fetchAnalyserSettings', jsonStr);
        return JSON.parse(jsonStr);
    }
}
