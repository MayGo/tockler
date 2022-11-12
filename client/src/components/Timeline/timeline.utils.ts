import _ from 'lodash';
import moment from 'moment';
import { convertDate } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';

export const filterItems = (timeItems, visibleTimerange) =>
    timeItems.filter((item) => {
        const itemBegin = convertDate(item.beginDate);
        const itemEnd = convertDate(item.endDate);
        const [visBegin, visEnd] = visibleTimerange;

        return itemBegin.isBetween(visBegin, visEnd) || itemEnd.isBetween(visBegin, visEnd);
    });

export const aggregateappItems = (items) => {
    _.reduce(
        items,
        (result) => {
            const currVal = result; // result[value.id](result[value.id] || (result[value.id] = [])).push(key);
            return currVal;
        },
        {},
    );
};

export const copyTime = (from, to) =>
    moment(from).set({
        hour: to.hour(),
        minute: to.minute(),
    });

export const setDayFromTimerange = (visibleTimerange, timerange) => [
    copyTime(timerange[0], visibleTimerange[0]),
    copyTime(timerange[1], visibleTimerange[1]),
];

export const getTodayTimerange = () => [moment().startOf('day'), moment().endOf('day')];

export const getCenteredTimerange = (timerange, visibleTimerange, middleTime) => {
    const timeBetweenMs = moment(visibleTimerange[1]).diff(visibleTimerange[0]);
    const middlePoint = timeBetweenMs / 5;

    let beginDate = moment(middleTime).subtract(timeBetweenMs - middlePoint, 'milliseconds');
    let endDate = moment(middleTime).add(middlePoint, 'milliseconds');

    // if new beginDate is smaller than actual timerange, then cap it with timeranges beginDate
    const underTime = moment(timerange[0]).diff(beginDate);
    if (underTime > 0) {
        beginDate = moment(timerange[0]);
        endDate = moment(endDate).add(underTime, 'milliseconds');
    }

    // if new endDate is bigger than actual timeranges endDate, then cap it with timeranges endDate
    const overTime = moment(endDate).diff(timerange[1]);
    if (overTime > 0) {
        endDate = moment(timerange[1]);
        beginDate = moment(beginDate).subtract(overTime, 'milliseconds');

        //edge case, if we have 23h visible timerange, then cap it with timeranges beginDate
        if (moment(timerange[0]).diff(beginDate) > 0) {
            beginDate = moment(timerange[0]);
        }
    }

    return [beginDate, endDate];
};

export const getUniqueAppNames = (appItems) =>
    _(appItems)
        .map('app')
        .uniq()
        .orderBy([(app) => app.toLowerCase()])
        .map((app) => ({
            text: app,
            value: app,
        }))
        .value();

export const getTrackItemOrder = (type: string) => {
    if (type === TrackItemType.AppTrackItem) {
        return 1;
    }
    if (type === TrackItemType.StatusTrackItem) {
        return 2;
    }
    if (type === TrackItemType.LogTrackItem) {
        return 3;
    }
    return 0;
};

export const getTrackItemOrderFn = (d) => getTrackItemOrder(d.taskName);
