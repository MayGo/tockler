import moment from 'moment';
import { appConstants } from './app-constants';
import { TrackItem } from './drizzle/schema';

export default class BackgroundUtils {
    static isSameItems(item1: any, item2: any) {
        if (item1 && item2 && item1.app === item2.app && item1.title === item2.title) {
            return true;
        }

        return false;
    }

    static currentTimeMinusJobInterval() {
        let now = new Date();
        // Begin date is always BACKGROUND_JOB_INTERVAL before current date
        now.setMilliseconds(now.getMilliseconds() - appConstants.BACKGROUND_JOB_INTERVAL);
        return now;
    }

    static shouldSplitInTwoOnMidnight(beginDate: Date | string, endDate: Date | string) {
        return BackgroundUtils.daysBetween(beginDate, endDate) > 0;
    }

    static dateToAfterMidnight(d: Date | string) {
        return moment(d).startOf('day').add(1, 'days').toDate();
    }

    static almostMidnight(d: Date | string) {
        return moment(d).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();
    }

    static startOfDay(d: Date | string) {
        return moment(d).startOf('day').toDate();
    }

    static daysBetween(beginDate: Date | string, endDate: Date | string) {
        return moment(endDate).endOf('day').diff(moment(beginDate).startOf('day'), 'days');
    }

    static getRawTrackItem(savedItem: any) {
        let item = {
            app: savedItem.app,
            title: savedItem.title,
            taskName: savedItem.taskName,
            color: savedItem.color,
            beginDate: savedItem.beginDate instanceof Date ? savedItem.beginDate : new Date(savedItem.beginDate),
            url: savedItem.url,
            endDate: savedItem.endDate instanceof Date ? savedItem.endDate : new Date(savedItem.endDate),
        };

        return item;
    }

    static splitItemIntoDayChunks(item: TrackItem | any) {
        // Convert dates to Date objects if they're strings
        const beginDate = item.beginDate instanceof Date ? item.beginDate : new Date(item.beginDate);
        const endDate = item.endDate instanceof Date ? item.endDate : new Date(item.endDate);

        let daysBetween: number = BackgroundUtils.daysBetween(beginDate, endDate) + 1;
        if (daysBetween < 2) {
            throw new Error('begin and end date is on same day');
        }

        let firstDayIndex = 0;
        let lastDayIndex = daysBetween - 1;
        let items = [];

        for (let i = 0; i < daysBetween; i++) {
            let newItem = Object.assign({}, item);

            let currentDate = moment(beginDate).add(i, 'days').toDate();
            let almostMidnight = BackgroundUtils.almostMidnight(currentDate);
            let startOfDay = BackgroundUtils.startOfDay(currentDate);

            if (firstDayIndex === i) {
                newItem.endDate = almostMidnight;
            } else if (lastDayIndex === i) {
                newItem.beginDate = startOfDay;
            } else {
                newItem.beginDate = startOfDay;
                newItem.endDate = almostMidnight;
            }

            items.push(newItem);
        }

        return items;
    }
}
