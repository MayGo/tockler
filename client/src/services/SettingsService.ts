import Config from 'electron-store';
import { EventEmitter } from './EventEmitter';

const remote = (<any>window).require('electron').remote;
const config = new Config();

export class SettingsService {
    static service: any = remote.getGlobal('SettingsService');

    static getOpenAtLogin() {
        return <boolean>config.get('openAtLogin');
    }
    static getIsAutoUpdateEnabled() {
        return <boolean>config.get('isAutoUpdateEnabled');
    }

    static saveOpenAtLogin(openAtLogin) {
        if (openAtLogin !== config.get('openAtLogin')) {
            console.log('Setting openAtLogin', openAtLogin);
            config.set('openAtLogin', openAtLogin);

            EventEmitter.send('openAtLoginChanged');
        }
    }

    static saveIsAutoUpdateEnabled(isAutoUpdateEnabled) {
        if (isAutoUpdateEnabled !== config.get('isAutoUpdateEnabled')) {
            console.log('Setting isAutoUpdateEnabled', isAutoUpdateEnabled);
            config.set('isAutoUpdateEnabled', isAutoUpdateEnabled);
        }
    }

    static async updateByName(name, jsonData) {
        console.info('updateByName', JSON.stringify(jsonData));
        return await SettingsService.service.updateByName(name, JSON.stringify(jsonData));
    }

    static async getRunningLogItem() {
        const runningLogItem = await SettingsService.service.getRunningLogItemAsJson();
        return runningLogItem;
    }

    static fetchWorkSettings() {
        return SettingsService.service.fetchWorkSettings();
    }

    static saveAnalyserSettings(data) {
        SettingsService.updateByName('ANALYSER_SETTINGS', data);
    }
    static async fetchAnalyserSettings() {
        const jsonStr = await SettingsService.service.fetchAnalyserSettingsJsonString();
        console.log('fetchAnalyserSettings', jsonStr);
        return JSON.parse(jsonStr);
    }
}
