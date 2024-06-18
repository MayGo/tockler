import { first, orderBy } from 'lodash';
import { dayjs } from '@renderer/dayjs.config';
import { MAIN_THEME_COLOR } from '../../theme/theme';

const clampItem =
    ({ beginClamp, endClamp }) =>
    (item) => {
        const beginDate = Math.max(beginClamp, item.beginDate);
        const endDate = Math.min(endClamp, item.endDate);

        return { ...item, beginDate, endDate };
    };

export const roundTo = (start) => {
    const roundToMin = 3;
    const remainder = roundToMin - (start.hour() % roundToMin);

    return dayjs(start).add(remainder, 'hour');
};

export enum CLOCK_MODE {
    HOURS_12 = 12,
    HOURS_24 = 24,
}

export const getQuarters = (date, mode) => {
    const startDate =
        mode === CLOCK_MODE.HOURS_12
            ? roundTo(dayjs(date)).subtract(mode, 'hours').set('minutes', 0).set('seconds', 0)
            : dayjs(date).startOf('day');

    const quarter = mode / 4;
    return [
        startDate,
        dayjs(startDate).add(quarter, 'hours'),
        dayjs(startDate).add(quarter * 2, 'hours'),
        dayjs(startDate).add(quarter * 3, 'hours'),
        dayjs(startDate).add(quarter * 4, 'hours'),
    ];
};

export const getClampHours = ({ realDate, startHour, endHour }) => {
    let beginClamp = dayjs(realDate).startOf('day').set('hour', startHour);
    let endClamp = dayjs(realDate).startOf('day').set('hour', endHour);
    return { beginClamp, endClamp };
};

export const isBetweenHours =
    ({ beginClamp, endClamp }) =>
    (item) => {
        return (
            dayjs(item.beginDate).isBetween(beginClamp, endClamp) || dayjs(item.endDate).isBetween(beginClamp, endClamp)
        );
    };

export const isLessThanHours = (now) => (item) => {
    return dayjs(item.endDate) <= dayjs(now);
};

export const getOnlineTimesForChart = ({
    beginClamp,
    endClamp,
    items,
    mode,
}: {
    beginClamp: dayjs.dayjs;
    endClamp: dayjs.dayjs;
    items: any[];
    mode?: CLOCK_MODE;
}) => {
    const pieData: any[] = [];
    const arr: any[] = [];

    const filtered = items.filter((item) => item.app === 'ONLINE').filter(isBetweenHours({ beginClamp, endClamp }));

    if (filtered.length === 0) {
        return [];
    }

    filtered.forEach((item) => {
        const clampedItem = clampItem({ beginClamp, endClamp })(item);
        const diff = dayjs(clampedItem.endDate).diff(dayjs(clampedItem.beginDate), 'minutes');
        arr.push({ ...clampedItem, diff });
    });

    let nr = 0;
    arr.forEach((item, idx) => {
        const prev = 0 !== idx ? arr[idx - 1] : null;
        const next = arr.length - 1 !== idx ? arr[idx + 1] : null;

        if (!prev) {
            const diff = dayjs(dayjs(item.beginDate)).diff(beginClamp, 'minutes');

            if (diff > 0) {
                pieData.push({
                    beginDate: beginClamp.valueOf(),
                    endDate: item.beginDate,
                    color: 'transparent',
                    diff,
                    x: nr++,
                });
            }
        }

        pieData.push({ ...item, x: nr++ });

        if (next) {
            const diff = dayjs(next.beginDate).diff(dayjs(item.endDate), 'minutes');

            if (diff > 0) {
                pieData.push({
                    beginDate: item.endDate,
                    endDate: next.beginDate,
                    color: 'transparent',
                    diff,
                    x: nr++,
                });
            }
        }

        if (!next) {
            if (mode) {
                const currentTimeItem = {
                    beginDate: dayjs(),
                    endDate: dayjs(),
                    color: MAIN_THEME_COLOR,
                    diff: mode === CLOCK_MODE.HOURS_12 ? 2 : 4,
                    x: nr++,
                };
                pieData.push(currentTimeItem);
            }

            const diff = dayjs(dayjs(endClamp)).diff(item.endDate, 'minutes');

            if (diff > 0) {
                pieData.push({
                    beginDate: item.endDate,
                    endDate: endClamp.valueOf(),
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

const getBeginEndDiff = (beginDate, endDate) => {
    return dayjs(dayjs(endDate)).diff(dayjs(beginDate));
};

const MINUTES = 60 * 1000;

export const groupByBreaks = (items, minBreakTime) => {
    let newItems: any[] = [];
    let olderItem;

    const groups: any[][] = [];

    items.forEach((currentItem) => {
        if (olderItem) {
            const diff = getBeginEndDiff(currentItem.endDate, olderItem.beginDate);
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

export const getTotalOnlineDuration = (now, items, minBreakTime) => {
    const filtered = items.filter((item) => item.app === 'ONLINE').filter(isLessThanHours(now));

    if (filtered.length === 0) {
        return [0];
    }

    const sorted = orderBy(filtered, ['beginDate'], ['desc']);

    if (getBeginEndDiff(first(sorted).endDate, now) / MINUTES >= minBreakTime) {
        return [0];
    }

    const onlyNeeded = groupByBreaks(sorted, minBreakTime);

    if (onlyNeeded.length === 0) {
        return [0];
    }

    return onlyNeeded.map((group) => {
        const diffs = group.map(({ beginDate, endDate }) => getBeginEndDiff(beginDate, endDate));
        return diffs.reduce((a, b) => a + b, 0);
    });
};
