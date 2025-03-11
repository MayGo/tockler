import moment from 'moment';
import { TrackItemRaw } from '../app/task-analyser';
import { TrackItem } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { appConstants } from '../utils/app-constants';

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
        return now.getTime();
    }

    static shouldSplitInTwoOnMidnight(beginDate: number, endDate: number) {
        return BackgroundUtils.daysBetween(beginDate, endDate) > 0;
    }

    static almostMidnight(d: Date) {
        return moment(d).startOf('day').add(1, 'days').subtract(1, 'seconds').toDate();
    }

    static startOfDay(d: Date) {
        return moment(d).startOf('day').toDate();
    }

    static daysBetween(beginDate: number, endDate: number) {
        return moment(endDate).endOf('day').diff(moment(beginDate).startOf('day'), 'days');
    }

    static getRawTrackItem(savedItem: TrackItem) {
        let item: TrackItemRaw = {
            app: savedItem.app || undefined,
            title: savedItem.title || undefined,
            taskName: (savedItem.taskName as TrackItemType) || undefined,
            color: savedItem.color || undefined,
            beginDate: savedItem.beginDate,
            url: savedItem.url || undefined,
            endDate: savedItem.endDate,
        };

        return item;
    }

    static splitItemIntoDayChunks(item: TrackItem | any) {
        // Convert dates to Date objects if they're strings
        const beginDate = item.beginDate;
        const endDate = item.endDate;

        let daysBetween: number = BackgroundUtils.daysBetween(beginDate, endDate) + 1;
        if (daysBetween < 2) {
            throw new Error('begin and end date is on same day');
        }

        let firstDayIndex = 0;
        let lastDayIndex = daysBetween - 1;
        let items = [];

        for (let i = 0; i < daysBetween; i++) {
            let newItem: TrackItem = Object.assign({}, item);

            let currentDate = moment(beginDate).add(i, 'days').toDate();
            let almostMidnight = BackgroundUtils.almostMidnight(currentDate);
            let startOfDay = BackgroundUtils.startOfDay(currentDate);

            if (firstDayIndex === i) {
                newItem.endDate = almostMidnight.getTime();
            } else if (lastDayIndex === i) {
                newItem.beginDate = startOfDay.getTime();
            } else {
                newItem.beginDate = startOfDay.getTime();
                newItem.endDate = almostMidnight.getTime();
            }

            items.push(newItem);
        }

        return items;
    }
}
