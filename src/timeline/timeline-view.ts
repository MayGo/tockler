import { autoinject, bindable, bindingMode, LogManager } from "aurelia-framework";
import { SettingsService } from "../services/settings-service";
import * as moment from "moment";
import * as _ from "lodash";
import { EventAggregator } from 'aurelia-event-aggregator';

let logger = LogManager.getLogger('TimelineView');

let ipcRenderer: any = (<any>window).nodeRequire('electron').ipcRenderer

@autoinject
export class TimelineView {

    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    loadedItems = {};
    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    selectedTrackItem;
    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    loading: boolean;
    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    zoomScale: any;
    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    zoomX: any;

    pieData = {};
    dayStats = {};

    constructor(private settingsService: SettingsService, private eventAggregator: EventAggregator) {
        this.resetLoadedItems();
    }
    resetLoadedItems() {
        console.log("Resetting loaded items");
        this.selectedTrackItem = null;
        this.loadedItems = {
            AppTrackItem: [],
            StatusTrackItem: [],
            LogTrackItem: []
        };
    };


    refreshWindow(event, arg) {
        console.log("Main-Window gained focus, reloading");
        this.refresh();
    };

    refresh() {
        let lastItem: any = (this.loadedItems['AppTrackItem'].length > 0) ? _(this.loadedItems['AppTrackItem']).last().valueOf() : null;

        var searchFrom = (lastItem) ? lastItem.beginDate : moment().startOf('day').toDate();
        console.log('Refreshing from:', searchFrom);
        this.list(searchFrom);
    };
    list(startDate) {
        console.log("Load data from:", startDate);
        this.zoomScale = sessionStorage.getItem('zoomScale') || 0;
        this.zoomX = sessionStorage.getItem('zoomX') || 0;
        this.loading = true;

        _.keys(this.loadedItems).forEach((taskName) => {
            console.log('TIMELINE_LOAD_DAY_REQUEST sent', startDate, taskName);
            ipcRenderer.send('TIMELINE_LOAD_DAY_REQUEST', startDate, taskName);
        })
    };

    parseReceivedTimelineData(event, startDate, taskName, items) {
        console.log('TIMELINE_LOAD_DAY_RESPONSE received', taskName, items);

        var nothingToUpdate = false;
        var upsert = function (arr, id, newval) {
            if (nothingToUpdate === true) {
                arr.push(newval);
                //console.log('Nothing to update, inserting instead');
                return;
            }
            var index = _.indexOf(arr, _.find(arr, { id: id }));
            if (index === -1) {
                arr.push(newval);
                nothingToUpdate = true;
            } else {
                arr.splice(index, 1, newval);
            }
        };

        if (this.loadedItems[taskName].length === 0) {
            this.loadedItems[taskName] = items;
        } else {
            _.each(items, (item) => {
                upsert(this.loadedItems[taskName], item.id, item);
            });
        }

        this.loading = false;
        console.log('Trackitems loaded, parsing ended.', taskName);
        this.eventAggregator.publish('addItemsToTimeline', this.loadedItems[taskName]);

        //updatePieCharts(this.loadedItems[taskName], taskName);

        if (taskName === 'AppTrackItem') {
            // setWorkStatsForDay(this.loadedItems[taskName]);
        }

        // $scope.$digest();
        console.log('Trackitems loaded, $digest.');
    };

    attached() {
        console.log("attached");
        ipcRenderer.on('main-window-focus', (event, arg) => this.refreshWindow(event, arg));
        ipcRenderer.on('TIMELINE_LOAD_DAY_RESPONSE', (event, startDate, taskName, items) => this.parseReceivedTimelineData(event, startDate, taskName, items));
        this.refresh();
    }
    detached() {
        console.log("detached");
        ipcRenderer.removeListener('main-window-focus', this.refreshWindow);
        ipcRenderer.removeListener('TIMELINE_LOAD_DAY_RESPONSE', this.parseReceivedTimelineData);
    }
}
