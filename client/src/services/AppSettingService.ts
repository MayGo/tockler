import * as moment from 'moment';
import { ITrackItem } from '../@types/ITrackItem';

const remote = (<any>window).nodeRequire('electron').remote;
let ipcRenderer: any = (<any>window).nodeRequire('electron').ipcRenderer;

export class AppSettingService {
    static service: any = remote.getGlobal('AppSettingService');

    static changeColorForApp(appName: string, color: string): Promise<any> {
        return AppSettingService.service.changeColorForApp(appName, color);
    }
}
