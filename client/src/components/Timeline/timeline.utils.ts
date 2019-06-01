import { convertDate } from '../../constants';
import * as _ from 'lodash';

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
