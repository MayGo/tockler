import { autoinject } from "aurelia-framework";
import * as moment from "moment";
import { SettingsService } from "./settings-service";

const remote = (<any>window).nodeRequire('electron').remote;

@autoinject
export class TrackItemService {
    private service: any;

    constructor(private settingsService: SettingsService) {
        this.service = remote.getGlobal('BackgroundService').getTrackItemService();
    }

    findAllFromDay(from: Date, type: string) {
        return this.service.findAllFromDay(from, type)

    }

    findFirstLogItems() {
        return this.service.findFirstLogItems();
    }

    createItem(trackItem) {
        return this.service.createItem(trackItem);
    }

    updateItem(trackItem) {
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

        return new Promise((resolve, reject) => {
            this.service.createItem(newItem).then((item) => {
                console.log("Created newItem to DB:", item);

                this.settingsService.saveRunningLogItemReferemce(item.id);
                resolve(item);
            });
        });

    };

    stopRunningLogItem(runningLogItemId) {
        console.log("stopRunningLogItem");

        return this.service.updateEndDateWithNow(runningLogItemId).then((item) => {
            console.log("Updated trackitem to DB:", item);


            this.settingsService.saveRunningLogItemReferemce(null);

        });
    };

    updateColorForApp(appName, color) {
        return this.service.updateColorForApp(appName, color);
    }

}
