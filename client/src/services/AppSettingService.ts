const remote = (window as any).require('electron').remote;

export class AppSettingService {
    public static service: any = remote.getGlobal('AppSettingService');

    public static changeColorForApp(appName: string, color: string): Promise<any> {
        return AppSettingService.service.changeColorForApp(appName, color);
    }
}
