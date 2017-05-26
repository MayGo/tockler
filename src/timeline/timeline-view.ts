import { autoinject, bindable, bindingMode, LogManager } from "aurelia-framework";
import { SettingsService } from "../services/settings-service";
import * as moment from "moment";
import * as _ from "lodash";
import { EventAggregator } from 'aurelia-event-aggregator';
import { DeepObserver } from "../resources/deep-observer";
import { TrackItemService } from "../services/track-item-service";
import { AppSettingsService } from "../services/app-settings-service";

let logger = LogManager.getLogger('TimelineView');

let ipcRenderer: any = (<any>window).nodeRequire('electron').ipcRenderer

@autoinject
export class TimelineView {

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    loadedItems = {
        AppTrackItem: [],
        StatusTrackItem: [],
        LogTrackItem: []
    };

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    selectedTrackItem: any = null;

    observerDisposer: any;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    loading: boolean;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    zoomScale: any;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    zoomX: any;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    searchDate: Date;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    pieData = {
        AppTrackItem: [],
        StatusTrackItem: [],
        LogTrackItem: []
    };
    dayStats = { lateForWork: null };

    table = {
        searchTask: 'LogTrackItem',
        search: '',
        order: '-beginDate'
    };
    @bindable({ defaultBindingMode: bindingMode.twoWay })
    tableSearchTask = 'AppTrackItem';

    tableFilters = [
        { value: '', keys: ['app', 'title'] }
    ];

    confirmColorChangeModal: any;


    constructor(
        private settingsService: SettingsService,
        private trackItemService: TrackItemService,
        private appSettingsService: AppSettingsService,
        private eventAggregator: EventAggregator,
        private deepObserver: DeepObserver
    ) {
        this.resetLoadedItems();
        /*this.observerDisposer = deepObserver.observe(this, 'selectedTrackItem', (n, o, p) => {
            logger.debug('DATA CHANGED:', p, ':', o, '===>', n); // Display the changes in the console log
        });*/
    }
    resetLoadedItems() {
        logger.debug("Resetting loaded items");
        // this.selectedTrackItem = null;
        this.loadedItems = {
            AppTrackItem: [],
            StatusTrackItem: [],
            LogTrackItem: []
        };
    };


    refreshWindow(event, arg) {
        logger.debug("Main-Window gained focus, reloading");
        this.refresh();
    };


    refresh() {
        let lastItem: any = (this.loadedItems['AppTrackItem'].length > 0) ? _(this.loadedItems['AppTrackItem']).last().valueOf() : null;

        var searchFrom = (lastItem) ? lastItem.beginDate : moment().startOf('day').toDate();
        logger.debug('Refreshing from:', searchFrom);
        this.list(searchFrom);
    };

    dayBack() {
        this.searchDate = moment(this.searchDate).subtract(1, 'days').toDate();
    };

    dayForward() {
        this.searchDate = moment(this.searchDate).add(1, 'days').toDate();
    };

    changeDay(day) {
        this.resetLoadedItems();
        this.list(day);
    }

    searchDateChanged(newValue, oldValue) {
        logger.debug("SearchDateChanged", oldValue, newValue);
        this.changeDay(newValue);
    }

    list(startDate) {
        logger.debug("Load data from:", startDate);
        this.zoomScale = sessionStorage.getItem('zoomScale') || 0;
        this.zoomX = sessionStorage.getItem('zoomX') || 0;
        this.loading = true;

        _.keys(this.loadedItems).forEach((taskName) => {
            logger.debug('TIMELINE_LOAD_DAY_REQUEST sent', startDate, taskName);
            ipcRenderer.send('TIMELINE_LOAD_DAY_REQUEST', startDate, taskName);
        })
    };

    parseReceivedTimelineData(event, startDate, taskName, items) {
        logger.debug('TIMELINE_LOAD_DAY_RESPONSE received', taskName, items);

        var nothingToUpdate = false;
        var upsert = function (arr, id, newval) {
            if (nothingToUpdate === true) {
                arr.push(newval);
                //logger.debug('Nothing to update, inserting instead');
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
        logger.debug('Trackitems loaded, parsing ended.', taskName);
        this.eventAggregator.publish('addItemsToTimeline', this.loadedItems[taskName]);

        this.updatePieCharts(this.loadedItems[taskName], taskName);

        if (taskName === 'AppTrackItem') {
            this.setWorkStatsForDay(this.loadedItems[taskName]);
        }

        logger.debug('Trackitems loaded, $digest.');
    };

    selectedTrackItemChanged(newValue, oldValue) {
        logger.debug("selectedTrackItemChanged", newValue, oldValue);
    }

    setWorkStatsForDay(items) {
        logger.debug("WorkStatsForDay");
        var firstItem: any = _.first(items);
        this.settingsService.fetchWorkSettings().then((settingsData) => {
            if (firstItem && settingsData.workDayStartTime) {
                logger.debug("Setting WorkStatsForDay:", firstItem);
                var parts = settingsData.workDayStartTime.split(':')
                var startDate = moment(firstItem.beginDate);
                startDate.startOf('day');
                startDate.hour(parts[0]);
                startDate.minute(parts[1]);
                this.dayStats.lateForWork = moment(firstItem.beginDate).diff(startDate)
            } else {
                logger.debug("No data for WorkStatsForDay")
            }
        });

    }

    sumApp(p, c) {
        return _.extend(p, {
            timeDiffInMs: p.timeDiffInMs + moment(c.endDate).diff(c.beginDate)
        });
    }

    dateDiff(c) {
        return moment(c.endDate).diff(c.beginDate)
    }

    updatePieCharts(items, taskName) {

        logger.debug('Track Items changed. Updating pie charts');

        var groupBy = (taskName === 'LogTrackItem') ? 'title' : 'app'
        this.pieData[taskName] = _(items)
            .groupBy(groupBy)
            .map((b) => {
                return b.reduce(this.sumApp, { app: b[0].app, title: b[0].title, timeDiffInMs: 0, color: b[0].color })
            })
            .valueOf();

        logger.debug('Updating pie charts ended.');

    };

    onZoomChanged(scale, x) {
        sessionStorage.setItem('zoomScale', scale);
        sessionStorage.setItem('zoomX', x);
    };

    showAddLogDialog(trackItem) {
        logger.debug(trackItem);
        /* $mdDialog.show({
             templateUrl: 'app/trackItem/trackItem.edit.modal.html',
             controller: 'TrackItemEditModalController as trackItemModalCtrl',
             parent: angular.element(document.body),
             locals: {
                 trackItem: trackItem
             },
             clickOutsideToClose: true
         }).then(function (trackItem) {
             logger.debug('TrackItem added.');
             this.saveTrackItem(trackItem)
         });*/
    };

    saveTrackItem(trackItem) {
        logger.debug("Saving trackitem.", trackItem);
        if (!trackItem.taskName) {
            trackItem.taskName = "LogTrackItem";
        }
        if (trackItem.id) {
            if (trackItem.originalColor === trackItem.color) {
                this.updateItem(trackItem);
            } else {
                this.confirmColorChangeModal.open();
            }
        } else {
            if (!trackItem.app) {
                trackItem.app = "Default";
            }
            this.trackItemService.createItem(trackItem).then((item) => {
                logger.debug("Created trackitem to DB:", item);
                this.selectedTrackItem = null;

                this.eventAggregator.publish('addItemsToTimeline', [trackItem]);
                this.loadedItems[trackItem.taskName].push(item);
                this.updatePieCharts(this.loadedItems[trackItem.taskName], trackItem.taskName);
            });
        }

    }

    changeColorAnswer(answer) {
        let trackItem = this.selectedTrackItem;
        if (answer === 'ALL_ITEMS') {
            this.loading = true;
            this.appSettingsService.changeColorForApp(trackItem.app, trackItem.color);
            this.trackItemService.updateColorForApp(trackItem.app, trackItem.color).then(() => {
                logger.debug("Updated all item with color");

                this.resetLoadedItems();
                this.list(this.searchDate);
            })
        } else if (answer === 'NEW_ITEMS') {
            this.appSettingsService.changeColorForApp(trackItem.app, trackItem.color);
            this.updateItem(trackItem);
        } else {
            this.updateItem(trackItem);
        }
    }

    updateItem(trackItem) {
        this.trackItemService.updateItem(trackItem).then((item) => {
            logger.debug("Updated trackitem to DB:", item);
            this.selectedTrackItem = null;

            this.eventAggregator.publish('addItemToTimeline', item);
            var update = function (arr, id, newval) {
                var index = _.indexOf(arr, _.find(arr, { id: id }));
                arr.splice(index, 1, newval);
            };

            update(this.loadedItems[trackItem.taskName], item.id, item);
            this.updatePieCharts(this.loadedItems[trackItem.taskName], trackItem.taskName);
        });
    };

    deleteTrackItem(trackItem) {
        logger.debug("Deleting trackitem.", trackItem);

        if (trackItem.id) {
            this.trackItemService.deleteById(trackItem.id).then(function (item) {
                logger.debug("Deleting trackitem from DB:", trackItem);
                this.selectedTrackItem = null;

                var index = _.indexOf(this.trackItems, _.find(this.loadedItems[trackItem.taskName], { id: trackItem.id }));
                this.loadedItems[trackItem.taskName].splice(index, 1);
                this.updatePieCharts(this.loadedItems[trackItem.taskName], trackItem.taskName);
                this.eventAggregator.publish('removeItemsFromTimeline', _.flatten(_.values(this.loadedItems)));

            });
        } else {
            logger.debug("No id, not deleting from DB");
        }

    };

    closeMiniEdit() {
        logger.debug("Closing mini edit.");
        this.selectedTrackItem = null;
    };


    attached() {
        logger.debug("attached");
        ipcRenderer.on('main-window-focus', (event, arg) => this.refreshWindow(event, arg));
        ipcRenderer.on('TIMELINE_LOAD_DAY_RESPONSE', (event, startDate, taskName, items) => this.parseReceivedTimelineData(event, startDate, taskName, items));
        //this.refresh();
        // Initialy load todays data
        this.searchDate = moment().startOf('day').toDate();
        this.list(this.searchDate);
    }
    detached() {
        logger.debug("detached");
        this.observerDisposer();
        ipcRenderer.removeListener('main-window-focus', this.refreshWindow);
        ipcRenderer.removeListener('TIMELINE_LOAD_DAY_RESPONSE', this.parseReceivedTimelineData);
    }
}
