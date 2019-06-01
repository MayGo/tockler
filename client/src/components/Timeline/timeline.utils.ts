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

export const setDayFromTimerange = (visibleTimerange, timerange) => [
    moment(visibleTimerange[0]).date(moment(timerange[0]).date()),
    moment(visibleTimerange[1]).date(moment(timerange[0]).date()),
];
