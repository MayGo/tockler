import {autoinject} from "aurelia-framework";
import {TrackItemService} from "./services/track-item-service";
import * as moment from "moment";
import {SettingsService} from "./services/settings-service";

// polyfill fetch client conditionally
// const fetch = !self.fetch ? System.import('isomorphic-fetch') : Promise.resolve(self.fetch);
// const fetch = !self.fetch ? require('isomorphic-fetch') : Promise.resolve(self.fetch);
/*
 interface IUser {
 avatar_url:string;
 login:string;
 html_url:string;
 }
 */
@autoinject
export class Menubar {
    trackItems:Array<any> = [];

    loading:boolean = false;

    newItem:any = {color: '#426DFC'};
    runningLogItem:any;

    constructor(private trackItemService:TrackItemService, private settingsService:SettingsService) {
    }


    async activate():Promise<void> {
        this.refresh();
    }

    loadItems() {
        console.log("Loading items");
        this.loading = true;
        this.trackItemService.findFirstLogItems().then((items) => {
            console.log("Loaded items", items);
            items.forEach(function (item) {
                item.timeDiffInMs = moment(item.endDate).diff(item.beginDate);
                item.duration = moment.duration(item.endDate - item.beginDate);
            });
            this.trackItems = items;
            this.loading = false;
        });
    }

    startNewLogItem(oldItem:any) {

        this.stopRunningLogItem();

        this.trackItemService.startNewLogItem(oldItem).then((item)=> {
            console.log("Setting running log item");
            this.runningLogItem = item;
            /* var toast = $mdToast.simple()
             .textContent('Task is running!');
             $mdToast.show(toast);

             $scope.$apply();*/
        })
    }

    stopRunningLogItem() {
        if (this.runningLogItem && this.runningLogItem.id) {

            this.trackItemService.stopRunningLogItem(this.runningLogItem.id).then(()=> {
                this.runningLogItem = null;
                /*
                 var toast = $mdToast.simple()
                 .textContent('Running task is stopped!');
                 $mdToast.show(toast);
                 $scope.$apply();
                 */
            })
        } else {
            console.debug("No running log item");
        }
    }

    refresh() {
        console.log("Refresh data");

        this.settingsService.getRunningLogItem().then(function (item) {
            console.log("Running log item.", item);
            this.runningLogItem = item;
        });
        this.loadItems();
    };
}
