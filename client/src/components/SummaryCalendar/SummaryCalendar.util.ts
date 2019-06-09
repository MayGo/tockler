import _ from 'lodash';
import { convertDate } from '../../constants';

export const groupByField = mode => item =>
    mode === 'month' ? convertDate(item.beginDate).date() : convertDate(item.beginDate).month();

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
