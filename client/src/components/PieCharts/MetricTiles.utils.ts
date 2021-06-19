import moment from 'moment';
import { convertDate } from '../../constants';

export const sumApp = visibleTimerange => (timeDiffInMs, item) => {
    const [beginClamp, endClamp] = visibleTimerange;

    const beginDate = moment.max(beginClamp, convertDate(item.beginDate));
    const endDate = moment.min(endClamp, convertDate(item.endDate));

    const diff = endDate.diff(beginDate);
    if (diff < 0) {
        return timeDiffInMs;
    }

    return timeDiffInMs + diff;
};

export const getOnlineTime = (items, visibleTimerange) => {
    const onlineItems = items.filter(item => item.app === 'ONLINE');
    return onlineItems.reduce(sumApp(visibleTimerange), 0);
};

export const getTasksTime = (items, visibleTimerange) => {
    return items.reduce(sumApp(visibleTimerange), 0);
};
