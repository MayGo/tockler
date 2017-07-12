import { autoinject } from "aurelia-framework";
import * as moment from "moment";
import { SettingsService } from "./settings-service";

const remote = (<any>window).nodeRequire('electron').remote;
let ipcRenderer: any = (<any>window).nodeRequire('electron').ipcRenderer;

@autoinject
export class TrackItemService {
    private service: any;

    constructor(private settingsService: SettingsService) {
        this.service = remote.getGlobal('TrackItemService');
    }

    /*  findAllItems(from, to, taskName, searchStr, paging) {
          return this.service.findAllFromDay(from, to, taskName, searchStr, paging);
      }*/

    findAllDayItems(from, to, taskName): Promise<any> {
        return this.service.findAllDayItems(from, to, taskName);
    }

    findAllFromDay(from: Date, type: string): Promise<any> {
        return this.service.findAllFromDay(from, type);
    }

    findFirstLogItems(): Promise<any> {
        return this.service.findFirstLogItems();
    }

    createItem(trackItem): Promise<any> {
        return this.service.createTrackItem(trackItem);
    }

    updateItem(trackItem): Promise<any> {
        return this.service.updateItem(trackItem);
    }

    deleteById(trackItemId) {
        return this.service.deleteById(trackItemId);
    }

    startNewLogItem(oldItem: any) {
        console.log("startNewLogItem");

        let newItem: any = {};
        newItem.app = oldItem.app || "WORK";
        newItem.taskName = "LogTrackItem";
        newItem.color = oldItem.color;
        newItem.title = oldItem.title;
        newItem.beginDate = moment().toDate();
        newItem.endDate = moment().add(60, 'seconds').toDate();

        ipcRenderer.send('start-new-log-item', newItem);

    }

    stopRunningLogItem(runningLogItemId) {
        console.log("stopRunningLogItem", runningLogItemId);
        ipcRenderer.send('end-running-log-item');
    }

    updateColorForApp(appName, color) {
        return this.service.updateColorForApp(appName, color);
    }

}
