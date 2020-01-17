import { appConstants } from './app-constants';
import * as moment from 'moment';

export default class BackgroundUtils {
    static isSameItems(item1, item2) {
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

    static shouldSplitInTwoOnMidnight(beginDate, endDate) {
        return BackgroundUtils.daysBetween(beginDate, endDate) > 0;
    }

    static dateToAfterMidnight(d) {
        return moment(d)
            .startOf('day')
            .add(1, 'days')
            .toDate();
    }

    static almostMidnight(d) {
        return moment(d)
            .startOf('day')
            .add(1, 'days')
            .subtract(1, 'seconds')
            .toDate();
    }

    static startOfDay(d) {
        return moment(d)
            .startOf('day')
            .toDate();
    }

    static daysBetween(beginDate, endDate) {
        return moment(endDate)
            .endOf('day')
            .diff(moment(beginDate).startOf('day'), 'days');
    }

    static getRawTrackItem(savedItem) {
        let item = {
            app: savedItem.app,
            title: savedItem.title,
            taskName: savedItem.taskName,
            color: savedItem.color,
            beginDate: savedItem.beginDate,
            endDate: savedItem.endDate,
        };

        return item;
    }

    static splitItemIntoDayChunks(item) {
        let daysBetween: number = BackgroundUtils.daysBetween(item.beginDate, item.endDate) + 1;
        if (daysBetween < 2) {
            throw new Error('begin and end date is on same day');
        }

        let firstDayIndex = 0;
        let lastDayIndex = daysBetween - 1;
        let items = [];

        for (let i = 0; i < daysBetween; i++) {
            let newItem = Object.assign({}, item);

            let currentDate = moment(item.beginDate)
                .add(i, 'days')
                .toDate();
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
