const remote = (<any>window).require('electron').remote;

export class AppSettingService {
    static service: any = remote.getGlobal('AppSettingService');

    static changeColorForApp(appName: string, color: string): Promise<any> {
        return AppSettingService.service.changeColorForApp(appName, color);
    }
}
