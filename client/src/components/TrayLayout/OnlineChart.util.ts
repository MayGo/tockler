import { first, orderBy } from 'lodash';
import { DateTime } from 'luxon';
import { ITrackItem } from '../../@types/ITrackItem';
import { MAIN_THEME_COLOR } from '../../theme/theme.utils';

const clampItem =
    ({ beginClamp, endClamp }: { beginClamp: DateTime; endClamp: DateTime }) =>
    (item: ITrackItem) => {
        const beginDate = Math.max(beginClamp.toMillis(), item.beginDate);
        const endDate = Math.min(endClamp.toMillis(), item.endDate);

        return { ...item, beginDate, endDate };
    };

export const roundTo = (start: DateTime) => {
    const roundToMin = 3;
    const remainder = roundToMin - (start.hour % roundToMin);

    return start.plus({ hours: remainder });
};

export enum CLOCK_MODE {
    HOURS_12 = 12,
    HOURS_24 = 24,
}

export const getQuarters = (date: DateTime, mode: CLOCK_MODE) => {
    const startDate =
        mode === CLOCK_MODE.HOURS_12 ? roundTo(date).minus({ hours: mode }).startOf('hour') : date.startOf('day');

    const quarter = mode / 4;
    return [
        startDate,
        startDate.plus({ hours: quarter }),
        startDate.plus({ hours: quarter * 2 }),
        startDate.plus({ hours: quarter * 3 }),
        startDate.plus({ hours: quarter * 4 }),
    ];
};

export const getClampHours = ({
    realDate,
    startHour,
    endHour,
}: {
    realDate: DateTime;
    startHour: number;
    endHour: number;
}) => {
    const beginClamp = realDate.startOf('day').set({ hour: startHour });
    const endClamp = realDate.startOf('day').set({ hour: endHour });
    return { beginClamp, endClamp };
};

export const isBetweenHours =
    ({ beginClamp, endClamp }: { beginClamp: DateTime; endClamp: DateTime }) =>
    (item: ITrackItem) => {
        const itemBegin = DateTime.fromMillis(item.beginDate);
        const itemEnd = DateTime.fromMillis(item.endDate);

        return (itemBegin >= beginClamp && itemBegin <= endClamp) || (itemEnd >= beginClamp && itemEnd <= endClamp);
    };

export const isLessThanHours = (now: DateTime) => (item: ITrackItem) => {
    return DateTime.fromMillis(item.endDate) <= now;
};

export interface IOnlineChartItem {
    beginDate: number;
    id?: number;
    endDate: number;
    color: string;
    diff: number;
    x: number;
}

export const getOnlineTimesForChart = ({
    beginClamp,
    endClamp,
    items,
    mode,
}: {
    beginClamp: DateTime;
    endClamp: DateTime;
    items: ITrackItem[];
    mode?: CLOCK_MODE;
}) => {
    const pieData: IOnlineChartItem[] = [];
    const arr: { beginDate: number; endDate: number; diff: number; color?: string }[] = [];

    const filtered = items.filter((item) => item.app === 'ONLINE').filter(isBetweenHours({ beginClamp, endClamp }));

    if (filtered.length === 0) {
        return [];
    }

    filtered.forEach((item) => {
        const clampedItem = clampItem({ beginClamp, endClamp })(item);
        const itemBegin = DateTime.fromMillis(clampedItem.beginDate);
        const itemEnd = DateTime.fromMillis(clampedItem.endDate);
        const diff = itemEnd.diff(itemBegin).as('minutes');
        arr.push({ ...clampedItem, diff });
    });

    let nr = 0;
    arr.forEach((item, idx) => {
        const prev = 0 !== idx ? arr[idx - 1] : null;
        const next = arr.length - 1 !== idx ? arr[idx + 1] : null;

        if (!prev) {
            const itemBegin = DateTime.fromMillis(item.beginDate);
            const diff = itemBegin.diff(beginClamp).as('minutes');

            if (diff > 0) {
                pieData.push({
                    beginDate: beginClamp.toMillis(),
                    endDate: itemBegin.toMillis(),
                    color: 'transparent',
                    diff,
                    x: nr++,
                });
            }
        }

        pieData.push({ ...item, x: nr++, color: item.color || 'transparent' });

        if (next) {
            const itemEnd = DateTime.fromMillis(item.endDate);
            const nextBegin = DateTime.fromMillis(next.beginDate);
            const diff = nextBegin.diff(itemEnd).as('minutes');

            if (diff > 0) {
                pieData.push({
                    beginDate: itemEnd.toMillis(),
                    endDate: nextBegin.toMillis(),
                    color: 'transparent',
                    diff,
                    x: nr++,
                });
            }
        }

        if (!next) {
            if (mode) {
                const currentTimeItem: IOnlineChartItem = {
                    beginDate: DateTime.now().toMillis(),
                    endDate: DateTime.now().toMillis(),
                    color: MAIN_THEME_COLOR,
                    diff: mode === CLOCK_MODE.HOURS_12 ? 2 : 4,
                    x: nr++,
                };
                pieData.push(currentTimeItem);
            }

            const itemEnd = DateTime.fromMillis(item.endDate);
            const diff = endClamp.diff(itemEnd).as('minutes');

            if (diff > 0) {
                pieData.push({
                    beginDate: itemEnd.toMillis(),
                    endDate: endClamp.toMillis(),
                    color: 'transparent',
                    diff,
                    x: nr++,
                });
            }
        }
    });

    return pieData;
};

/*
-On20-Br1-On20-Br1-On20 = On60
-On20-Br5-On20 = On20
-On20-Br4-On20 = On40
-On20-Br4-On20-Br4-0n-20 = On60
*/

const getBeginEndDiff = (beginDate: DateTime, endDate: DateTime) => {
    return endDate.diff(beginDate).milliseconds;
};

const MINUTES = 60 * 1000;

export const groupByBreaks = (items: ITrackItem[], minBreakTime: number) => {
    let newItems: ITrackItem[] = [];
    let olderItem: ITrackItem;

    const groups: ITrackItem[][] = [];

    items.forEach((currentItem) => {
        if (olderItem) {
            const diff = getBeginEndDiff(
                DateTime.fromMillis(currentItem.endDate),
                DateTime.fromMillis(olderItem.beginDate),
            );
            const hasHadBreak = diff / MINUTES > minBreakTime;

            if (hasHadBreak) {
                groups.push(newItems);
                newItems = [];
            }
        }
        newItems.push(currentItem);
        olderItem = currentItem;
    });
    groups.push(newItems);
    return groups;
};

export const getTotalOnlineDuration = (now: DateTime, items: ITrackItem[], minBreakTime: number) => {
    const filtered = items.filter((item) => item.app === 'ONLINE').filter(isLessThanHours(now));

    if (filtered.length === 0) {
        return [0];
    }

    const sorted = orderBy(filtered, ['beginDate'], ['desc']);

    if (sorted.length === 0) {
        return [0];
    }

    if (getBeginEndDiff(DateTime.fromMillis(first(sorted)?.endDate || 0), now) / MINUTES >= minBreakTime) {
        return [0];
    }

    const onlyNeeded = groupByBreaks(sorted, minBreakTime);

    if (onlyNeeded.length === 0) {
        return [0];
    }

    return onlyNeeded.map((group) => {
        const diffs = group.map(({ beginDate, endDate }) =>
            getBeginEndDiff(DateTime.fromMillis(beginDate), DateTime.fromMillis(endDate)),
        );
        return diffs.reduce((a, b) => a + b, 0);
    });
};
