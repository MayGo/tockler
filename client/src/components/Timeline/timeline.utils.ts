import { convertDate } from '../../constants';
import * as _ from 'lodash';
import moment from 'moment';

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
        function(result, value, key) {
            let currVal = result; // result[value.id](result[value.id] || (result[value.id] = [])).push(key);
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
