import {autoinject} from "aurelia-framework";
import * as moment from "moment";
import {SettingsService} from "./settings-service";

const remote = require('electron').remote;

@autoinject
export class TrackItemService {
    private service:any;

    constructor(private settingsService:SettingsService) {
        this.service = remote.getGlobal('BackgroundService').getTrackItemService();
        console.log("..................sds")
    }

    findAllFromDay(from:Date, type:string) {
        return this.service.findAllFromDay(from, type)

    }

    findFirstLogItems() {
        return this.service.findFirstLogItems();
    }

    startNewLogItem(oldItem:any) {
        console.log("startNewLogItem");

        let newItem:any = {};
        newItem.app = oldItem.app || "WORK";
        newItem.taskName = "LogTrackItem";
        newItem.color = oldItem.color;
        newItem.title = oldItem.title;
        newItem.beginDate = moment().toDate();
        newItem.endDate = moment().add(60, 'seconds').toDate();


        return this.service.createItem(newItem).then((item) => {
            console.log("Created newItem to DB:", item);

            this.settingsService.saveRunningLogItemReferemce(item.id)
            return item;
        });
    };

    stopRunningLogItem(runningLogItemId) {
        console.log("stopRunningLogItem");

        return this.service.updateEndDateWithNow(runningLogItemId).then(function (item) {
            console.log("Updated trackitem to DB:", item);


            this.settingsService.saveRunningLogItemReferemce(null);

        });
    };

}
