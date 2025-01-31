import _ from 'lodash';
import { convertDate, TIME_FORMAT, BREAKPOINT_TIME } from '../../constants';
import moment from 'moment';
import { DAY_MONTH_FORMAT, CALENDAR_MODE } from '../../SummaryContext.util';

export const groupByField = (mode) => (item) =>
    mode === CALENDAR_MODE.MONTH
        ? convertDate(item.beginDate).format(DAY_MONTH_FORMAT)
        : convertDate(item.beginDate).month();

export const groupByActualDay = (item) => {
    const date = convertDate(item.beginDate);

    if (date.format(TIME_FORMAT) < BREAKPOINT_TIME) {
        return date.subtract(1, 'day').format(DAY_MONTH_FORMAT);
    }
    return date.format(DAY_MONTH_FORMAT);
};

export const summariseLog = (items, mode) => {
    const data = {};

    _(items)
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, (c) => convertDate(c.endDate).diff(convertDate(c.beginDate)));
        });

    return data;
};

export const summariseOnline = (items, mode) => {
    const data = {};

    _(items)
        .filter((item) => item.app === 'ONLINE')
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, (c) => convertDate(c.endDate).diff(convertDate(c.beginDate)));
        });
    return data;
};

export const summariseTimeOnline = (items, mode, beginDate) => {
    if (mode === 'year') {
        return [];
    }
    // We are taking sleep time from next months first day, but going to remove it from end result
    const currentMonth = beginDate.month();

    const data = _(items)
        .filter((item) => item.app === 'ONLINE')
        .groupBy(groupByActualDay)
        .map((value) => {
            return {
                beginDate: _.minBy(value, (c) => convertDate(c.beginDate)).beginDate,
                endDate: _.maxBy(value, (c) => convertDate(c.endDate)).endDate,
                online: _.sumBy(value, (c) => convertDate(c.endDate).diff(convertDate(c.beginDate))),
            };
        })
        .reduce((result, currentValue) => {
            const key = groupByActualDay(currentValue);

            const month = moment(key, DAY_MONTH_FORMAT).month();

            if (currentMonth === month) {
                result[key] = currentValue;
            }
            return result;
        }, {});

    return data;
};
