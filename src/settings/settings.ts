import { autoinject, LogManager, bindingMode } from "aurelia-framework";
import { SettingsService } from "../services/settings-service";
import * as moment from "moment";
import * as _ from "lodash";
import { TrackItemService } from "../services/track-item-service";
import { DeepObserver } from "../resources/deep-observer";
import { bindable } from "aurelia-templating";
import * as toastr from "toastr";

let logger = LogManager.getLogger('Settings');


@autoinject
export class Settings {
    @bindable({ defaultBindingMode: bindingMode.twoWay })
    workSettings: any = { workDayStartTime: "", workDayEndTime: "", splitTaskAfterIdlingForMinutes: "" };

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    analyserSettings: any = [];

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    analyserTestItems: any = [];

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    lastAnalyserTestItemIndex: number;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    todaysTrackItems: any;

    observerDisposer: any;

    constructor(private settingsService: SettingsService, private trackItemService: TrackItemService,
        private deepObserver: DeepObserver) {

    }

    findTodaysTrackItems() {
        var startDate = moment();
        startDate.startOf('day');

        this.trackItemService.findAllFromDay(startDate.toDate(), 'AppTrackItem').then((items) => {
            console.log(items);
            this.todaysTrackItems = items;
        });
    }

    async activate(): Promise<void> {
        this.findTodaysTrackItems();
      
        this.settingsService.fetchWorkSettings().then((workSettings) => {
            if (!_.isEmpty(workSettings)) {
                this.workSettings = workSettings;
            }
            logger.debug("Loaded workSettings:", workSettings);
        });

        this.settingsService.fetchAnalyserSettings().then((analyserSettings) => {
            if (!_.isEmpty(analyserSettings)) {
                this.analyserSettings = analyserSettings;
            }
            
            logger.debug("Loaded analyserSettings:", analyserSettings);
        });
    }

    findFirst(str, findRe) {
        if (!findRe) {
            return;
        }
        var re = new RegExp(findRe, "g");
        var result = re.exec(str);

        if (result != null) {
            let first = result[0];
            return first;
        }
    }

    saveSettings() {
        console.log("Saving:", this.workSettings, this.analyserSettings);
        this.settingsService.updateByName('WORK_SETTINGS', this.workSettings).then((item) => {
            console.log("Updated WORK_SETTINGS!", item);
        });

        this.settingsService.updateByName('ANALYSER_SETTINGS', this.analyserSettings).then((item) => {
            console.log("Updated ANALYSER_SETTINGS!", item);
            toastr.info('Saved!');
        })
    }

    addNewAnalyserItem() {
        this.analyserSettings.push({ findRe: '', takeTitle: '', takeGroup: '', active: true });
    }

    removeAnalyserItem(index) {
        this.analyserSettings.splice(index, 1);
    }

    testAnalyserItem(analyseSetting, index) {
        this.lastAnalyserTestItemIndex = index;
        if (!this.todaysTrackItems) {
            alert('Track items not loaded, try again!');
            return;
        }
        logger.debug("Analysing items:", analyseSetting, index)
        var testItems = [];
        _.each(this.todaysTrackItems, (item) => {

            var str = item.title;

            item.findRe = this.findFirst(str, analyseSetting.findRe);
            item.takeGroup = this.findFirst(str, analyseSetting.takeGroup) || item.findRe;
            item.takeTitle = this.findFirst(str, analyseSetting.takeTitle) || item.title;

            if (item.findRe) {
                testItems.push(item);
            }
        });

        this.analyserTestItems = _.uniqBy(testItems, 'title');
        logger.debug("Found analyserTestItems", this.analyserTestItems);
    }

    defaultWorkSettings() {
        this.workSettings = {
            workDayStartTime: '08:30',
            workDayEndTime: '17:00',
            splitTaskAfterIdlingForMinutes: 3
        }
    }

    addDefaultAnalyserSettings() {
        let analyserSettings = [
            { findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', active: true },
            { findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', active: true }
        ];
        this.analyserSettings.push(...analyserSettings);
    }
}
