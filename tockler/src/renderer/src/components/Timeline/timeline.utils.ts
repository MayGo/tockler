import _ from 'lodash';
import { dayjs } from '@renderer/dayjs.config';
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
    dayjs(from).set({
        hour: to.hour(),
        minute: to.minute(),
    });

export const setDayFromTimerange = (visibleTimerange, timerange) => [
    copyTime(timerange[0], visibleTimerange[0]),
    copyTime(timerange[1], visibleTimerange[1]),
];

export const getTodayTimerange = () => [dayjs().startOf('day'), dayjs().endOf('day')];

export const getCenteredTimerange = (timerange, visibleTimerange, middleTime) => {
    const timeBetweenMs = dayjs(visibleTimerange[1]).diff(visibleTimerange[0]);
    const middlePoint = timeBetweenMs / 5;

    let beginDate = dayjs(middleTime).subtract(timeBetweenMs - middlePoint, 'milliseconds');
    let endDate = dayjs(middleTime).add(middlePoint, 'milliseconds');

    // if new beginDate is smaller than actual timerange, then cap it with timeranges beginDate
    const underTime = dayjs(timerange[0]).diff(beginDate);
    if (underTime > 0) {
        beginDate = dayjs(timerange[0]);
        endDate = dayjs(endDate).add(underTime, 'milliseconds');
    }

    // if new endDate is bigger than actual timeranges endDate, then cap it with timeranges endDate
    const overTime = dayjs(endDate).diff(timerange[1]);
    if (overTime > 0) {
        endDate = dayjs(timerange[1]);
        beginDate = dayjs(beginDate).subtract(overTime, 'milliseconds');

        //edge case, if we have 23h visible timerange, then cap it with timeranges beginDate
        if (dayjs(timerange[0]).diff(beginDate) > 0) {
            beginDate = dayjs(timerange[0]);
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
