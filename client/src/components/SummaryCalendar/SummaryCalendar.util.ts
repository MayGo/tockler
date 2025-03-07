import _ from 'lodash';
import { DateTime } from 'luxon';
import { ITrackItem } from '../../@types/ITrackItem';
import { BREAKPOINT_TIME, convertDate, TIME_FORMAT } from '../../constants';
import { CALENDAR_MODE, DAY_MONTH_FORMAT } from '../../SummaryContext.util';

export const groupByField = (mode) => (item) =>
    mode === CALENDAR_MODE.MONTH
        ? convertDate(item.beginDate).toFormat(DAY_MONTH_FORMAT)
        : convertDate(item.beginDate).month;

export const groupByActualDay = (item) => {
    const date = convertDate(item.beginDate);

    if (date.toFormat(TIME_FORMAT) < BREAKPOINT_TIME) {
        return date.minus({ days: 1 }).toFormat(DAY_MONTH_FORMAT);
    }
    return date.toFormat(DAY_MONTH_FORMAT);
};

export interface ISummary {
    [key: string]: number;
}

export const summariseLog = (items: ITrackItem[], mode: CALENDAR_MODE): ISummary => {
    const data: ISummary = {};

    _(items)
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, (c) => convertDate(c.endDate).diff(convertDate(c.beginDate)).milliseconds);
        });

    return data;
};

export const summariseOnline = (items, mode) => {
    const data: ISummary = {};

    _(items)
        .filter((item) => item.app === 'ONLINE')
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, (c) => convertDate(c.endDate).diff(convertDate(c.beginDate)).milliseconds);
        });
    return data;
};

interface IOnlineTime {
    beginDate: Date;
    endDate: Date;
    online: number;
}

export interface ISummaryOnlineTime {
    [key: string]: IOnlineTime;
}

export const summariseTimeOnline = (
    items: ITrackItem[],
    mode: CALENDAR_MODE,
    beginDate: DateTime,
): ISummaryOnlineTime => {
    if (mode === 'year') {
        return {};
    }
    // We are taking sleep time from next months first day, but going to remove it from end result
    const currentMonth = beginDate.month;

    const data = _(items)
        .filter((item) => item.app === 'ONLINE')
        .groupBy(groupByActualDay)
        .map((value) => {
            return {
                beginDate: _.minBy(value, (c) => convertDate(c.beginDate).toMillis())?.beginDate,
                endDate: _.maxBy(value, (c) => convertDate(c.endDate).toMillis())?.endDate,
                online: _.sumBy(value, (c) => convertDate(c.endDate).diff(convertDate(c.beginDate)).milliseconds),
            };
        })
        .reduce((result, currentValue) => {
            const key = groupByActualDay(currentValue);

            const month = DateTime.fromFormat(key, DAY_MONTH_FORMAT).month;

            if (currentMonth === month) {
                result[key] = currentValue;
            }
            return result;
        }, {});

    console.log('data', data);
    return data;
};
