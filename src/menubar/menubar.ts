import {autoinject} from "aurelia-framework";
import * as moment from "moment";
import {TrackItemService} from "../services/track-item-service";
import {SettingsService} from "../services/settings-service";


const ipcRenderer = (<any>window).nodeRequire('electron').ipcRenderer;

@autoinject
export class Menubar {
    trackItems:Array<any> = [];

    loading:boolean = false;

    newItem:any = {color: '#426DFC'};
    runningLogItem:any;

    constructor(private trackItemService:TrackItemService, private settingsService:SettingsService) {
        ipcRenderer.on('focus-tray', this.refresh);
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
            console.log("Setting running log item:", item);
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
                this.loadItems();
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

        this.settingsService.getRunningLogItem().then((item) => {
            console.log("Running log item:", item);
            this.runningLogItem = item;
        });

        this.loadItems();
    };
}
