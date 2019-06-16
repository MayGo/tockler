import _ from 'lodash';
import {
    convertDate,
    TIME_FORMAT,
    BREAKPOINT_TIME,
    DURATION_FORMAT,
    DURATION_SETTINGS,
} from '../../constants';
import moment from 'moment';

export const formatDuration = dur =>
    moment.duration(dur).format(DURATION_FORMAT, DURATION_SETTINGS);

export const groupByField = mode => item =>
    mode === 'month' ? convertDate(item.beginDate).date() : convertDate(item.beginDate).month();

export const groupByActualDay = item => {
    const date = convertDate(item.beginDate);
    const day = date.date();

    if (date.format(TIME_FORMAT) < BREAKPOINT_TIME) {
        return day === 1 ? day : day - 1;
    }
    return day;
};

export const summariseLog = (items, mode) => {
    const data = {};

    _(items)
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => convertDate(c.endDate).diff(convertDate(c.beginDate)));
        });

    return data;
};

export const summariseOnline = (items, mode) => {
    const data = {};

    _(items)
        .filter(item => item.app === 'ONLINE')
        .groupBy(groupByField(mode))
        .forEach((value, key) => {
            data[key] = _.sumBy(value, c => convertDate(c.endDate).diff(convertDate(c.beginDate)));
        });
    return data;
};

export const summariseTimeOnline = (items, mode) => {
    if (mode === 'year') {
        return [];
    }
    const data = _(items)
        .filter(item => item.app === 'ONLINE')
        .groupBy(groupByActualDay)
        .map((value, key) => {
            return {
                beginDate: _.minBy(
                    value.filter(
                        item => convertDate(item.beginDate).format(TIME_FORMAT) > BREAKPOINT_TIME,
                    ),
                    c => convertDate(c.beginDate),
                ).beginDate,
                endDate: _.maxBy(value, c => convertDate(c.endDate)).endDate,
                online: _.sumBy(value, c => convertDate(c.endDate).diff(convertDate(c.beginDate))),
            };
        })
        .value();
    return data;
};
