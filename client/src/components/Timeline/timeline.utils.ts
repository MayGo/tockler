import _ from 'lodash';
import moment from 'moment';
import { convertDate } from '../../constants';

export const filterItems = (timeItems, visibleTimerange) =>
    timeItems.filter(item => {
        const itemBegin = convertDate(item.beginDate);
        const itemEnd = convertDate(item.endDate);
        const visBegin = visibleTimerange[0];
        const visEnd = visibleTimerange[1];
        return itemBegin.isBetween(visBegin, visEnd) && itemEnd.isBetween(visBegin, visEnd);
    });

export const aggregateappItems = items => {
    _.reduce(
        items,
        result => {
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

export const getUniqueAppNames = appItems =>
    _(appItems)
        .map('app')
        .uniq()
        .orderBy([app => app.toLowerCase()])
        .map(app => ({
            text: app,
            value: app,
        }))
        .value();
