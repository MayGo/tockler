export class AppSettingService {
    public static service: any = (window as any).App.AppSettingService;

    public static changeColorForApp(appName: string, color: string): Promise<any> {
        return AppSettingService.service.changeColorForApp(appName, color);
    }
}
