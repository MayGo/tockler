import moment from 'moment';
import { convertDate } from '../../constants';

export const clampRange = (clampToRange, range) => {
    const begin = moment.max(clampToRange[0], convertDate(range[0]));
    const end = moment.min(clampToRange[1], convertDate(range[1]));
    return [begin, end];
};

export const sumAppObject = visibleTimerange => (newItem, item) => {
    const [beginClamp, endClamp] = visibleTimerange;

    const [beginDate, endDate] = clampRange(
        [beginClamp, endClamp],
        [convertDate(item.beginDate), convertDate(item.endDate)],
    );

    const diff = endDate.diff(beginDate);
    if (diff < 0) {
        return { ...item, timeDiffInMs: newItem.timeDiffInMs };
    }

    return { ...item, timeDiffInMs: newItem.timeDiffInMs + diff };
};
export const sumApp = visibleTimerange => (timeDiffInMs, item) => {
    const newItem = sumAppObject(visibleTimerange)({ timeDiffInMs }, item);
    return newItem.timeDiffInMs;
};

export const getOnlineTime = (items, visibleTimerange) => {
    const onlineItems = items.filter(item => item.app === 'ONLINE');
    return onlineItems.reduce(sumApp(visibleTimerange), 0);
};
export const getLastOnlineTime = (items, visibleTimerange) => {
    const onlineItems = items.filter(item => item.app === 'ONLINE');
    if (onlineItems.length > 1) {
        return [onlineItems.reverse()[1]].reduce(sumApp(visibleTimerange), 0);
    }
    return;
};

export const getTasksTime = (items, visibleTimerange) => {
    return items.reduce(sumApp(visibleTimerange), 0);
};
