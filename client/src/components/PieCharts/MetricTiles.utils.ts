import { DateTime } from 'luxon';
import { ITrackItem } from '../../@types/ITrackItem';
import { convertDate } from '../../constants';

export type SumItem = {
    app: string;
    title?: string;
    timeDiffInMs: number;
    color?: string;
};

export const clampRange = (clampToRange: DateTime[], range: DateTime[]) => {
    const begin = DateTime.max(clampToRange[0], convertDate(range[0]));
    const end = DateTime.min(clampToRange[1], convertDate(range[1]));
    return [begin, end];
};

export const sumAppObject = (visibleTimerange: DateTime[]) => (newItem: { timeDiffInMs: number }, item: ITrackItem) => {
    const [beginClamp, endClamp] = visibleTimerange;

    const [beginDate, endDate] = clampRange(
        [beginClamp, endClamp],
        [convertDate(item.beginDate), convertDate(item.endDate)],
    );

    const diff = endDate.diff(beginDate).milliseconds;
    if (diff < 0) {
        return { ...item, timeDiffInMs: newItem.timeDiffInMs };
    }

    return { ...item, timeDiffInMs: newItem.timeDiffInMs + diff };
};

export const sumApp = (visibleTimerange: DateTime[]) => (timeDiffInMs: number, item: ITrackItem) => {
    const newItem = sumAppObject(visibleTimerange)({ timeDiffInMs }, item);
    return newItem.timeDiffInMs;
};

export const getOnlineTime = (items: ITrackItem[], visibleTimerange: DateTime[]) => {
    const onlineItems = items.filter((item) => item.app === 'ONLINE');
    return onlineItems.reduce(sumApp(visibleTimerange), 0);
};

export const getLastOnlineTime = (items: ITrackItem[], visibleTimerange: DateTime[]) => {
    const onlineItems = items.filter((item) => item.app === 'ONLINE');
    if (onlineItems.length > 1) {
        return [onlineItems.reverse()[1]].reduce(sumApp(visibleTimerange), 0);
    }
    return;
};

export const getTasksTime = (items: ITrackItem[], visibleTimerange: DateTime[]) => {
    return items.reduce(sumApp(visibleTimerange), 0);
};
