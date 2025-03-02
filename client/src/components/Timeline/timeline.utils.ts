import _ from 'lodash';
import { DateTime } from 'luxon';
import { ITrackItem } from '../../@types/ITrackItem';
import { convertDate } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';

export const filterItems = (timeItems: ITrackItem[], visibleTimerange: DateTime[]) => {
    if (!timeItems) {
        console.warn('No time items found');
        return [] as ITrackItem[];
    }

    return timeItems.filter((item) => {
        const itemBegin = convertDate(item.beginDate);
        const itemEnd = convertDate(item.endDate);
        const [visBegin, visEnd] = visibleTimerange;

        return (itemBegin >= visBegin && itemBegin <= visEnd) || (itemEnd >= visBegin && itemEnd <= visEnd);
    });
};

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

export const copyTime = (from: DateTime, to: DateTime): DateTime =>
    DateTime.fromJSDate(from.toJSDate()).set({
        hour: to.hour,
        minute: to.minute,
    });

export const setDayFromTimerange = (visibleTimerange: DateTime[], timerange: DateTime[]): DateTime[] => [
    copyTime(timerange[0], visibleTimerange[0]),
    copyTime(timerange[1], visibleTimerange[1]),
];

export const getTodayTimerange = (): DateTime[] => [DateTime.now().startOf('day'), DateTime.now().endOf('day')];

export const getCenteredTimerange = (
    timerange: DateTime[],
    visibleTimerange: DateTime[],
    middleTime: DateTime,
): DateTime[] => {
    const timeBetweenMs = visibleTimerange[1].diff(visibleTimerange[0]).milliseconds;
    const middlePoint = timeBetweenMs / 5;

    let beginDate = middleTime.minus({ milliseconds: timeBetweenMs - middlePoint });
    let endDate = middleTime.plus({ milliseconds: middlePoint });

    // if new beginDate is smaller than actual timerange, then cap it with timeranges beginDate
    const underTime = timerange[0].diff(beginDate).milliseconds;
    if (underTime > 0) {
        beginDate = timerange[0];
        endDate = endDate.plus({ milliseconds: underTime });
    }

    // if new endDate is bigger than actual timeranges endDate, then cap it with timeranges endDate
    const overTime = endDate.diff(timerange[1]).milliseconds;
    if (overTime > 0) {
        endDate = timerange[1];
        beginDate = beginDate.minus({ milliseconds: overTime });

        //edge case, if we have 23h visible timerange, then cap it with timeranges beginDate
        if (timerange[0].diff(beginDate).milliseconds > 0) {
            beginDate = timerange[0];
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
