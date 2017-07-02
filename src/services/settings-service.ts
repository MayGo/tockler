
const remote = (<any>window).nodeRequire('electron').remote;


let ipcRenderer: any = (<any>window).nodeRequire('electron').ipcRenderer;


export class SettingsService {
    private service: any;

    constructor() {
        this.service = remote.getGlobal('SettingsService');
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
