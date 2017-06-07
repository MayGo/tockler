import { autoinject, LogManager, bindable, bindingMode } from "aurelia-framework";
import { SettingsService } from "../services/settings-service";
import { TrackItemService } from "../services/track-item-service";
import * as moment from "moment";

let logger = LogManager.getLogger('Summary');

@autoinject
export class Summary {

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    trackItems = [];

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    searchMinDate: Date;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    searchMaxDate: Date;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    loading: boolean;

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    trackItemsTotal: any;

    constructor(private trackItemService: TrackItemService) {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let tomorrow = this.getTomorrow(today);
        this.searchMinDate = today;
        this.searchMaxDate = tomorrow;
    }

    async activate(): Promise<void> {
       return this.list();
    }

    getTomorrow(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    }


    searchMinDateChanged(newValue, oldValue) {
        logger.debug("searchMinDateChanged", oldValue, newValue);
        this.list();
    }

    searchMaxDateChanged(newValue, oldValue) {
        logger.debug("searchMaxDateChanged", oldValue, newValue);
        this.list();
    }

    list() {
        console.log("Refresh data");
        this.loading = true;
        this.trackItemService.findAllDayItems(this.searchMinDate, this.searchMaxDate, 'LogTrackItem')
            .then((items) => {
                logger.debug("Loaded items:", items);
                this.trackItems = items;
                this.loading = false;
                items.forEach((item) => {
                    item.timeDiffInMs = moment(item.endDate).diff(item.beginDate);
                    item.duration = moment.duration(item.endDate - item.beginDate);
                });

                let itemDiffs = items.map((item) => moment(item.endDate).diff(item.beginDate));
                console.log(itemDiffs)
                this.trackItemsTotal = itemDiffs.reduce((acc, val) => {
                    return acc + val;
                }, 0);

            });
    };

}
