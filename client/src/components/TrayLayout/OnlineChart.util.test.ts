import { last } from 'lodash';
import moment from 'moment';
import {
    getClampHours,
    getOnlineTimesForChart,
    getTotalOnlineDuration,
    isBetweenHours,
    isLessThanHours,
    groupByBreaks,
} from './OnlineChart.util';
import { describe, expect, it, test } from 'vitest';

const ONLINE = 'ONLINE';
const OFFLINE = 'OFFLINE';
const IDLE = 'IDLE';

const beginDate0 = moment('2021-06-18T23:50:00').valueOf();
const endDate0 = moment('2021-06-19T00:10:00').valueOf();

const beginDate1 = moment('2021-06-19T10:00:00').valueOf();
const endDate1 = moment('2021-06-19T10:10:00').valueOf();

const beginDate2 = moment('2021-06-19T11:50:00').valueOf();
const endDate2 = moment('2021-06-19T12:10:00').valueOf();

const beginDate3 = moment('2021-06-19T18:50:00').valueOf();
const endDate3 = moment('2021-06-19T19:10:00').valueOf();

const beginDate4 = moment('2021-06-19T23:50:00').valueOf();
const endDate4 = moment('2021-06-20T00:10:00').valueOf();

const realDate = moment('2021-06-19T10:10:00').valueOf();

describe('OnlineChart getOnlineTimesForChart', () => {
    it('uses only ONLINE items', () => {
        const beginDate = moment('2021-06-19T18:00:00').valueOf();
        const otherItems = [
            {
                app: OFFLINE,
                beginDate: moment('2021-06-19T16:00:00').valueOf(),
                endDate: moment('2021-06-19T17:10:00').valueOf(),
            },
            {
                beginDate: beginDate,
                endDate: moment('2021-06-19T18:10:00').valueOf(),
            },
        ];

        const items = [
            {
                app: ONLINE,
                beginDate: beginDate1,
                endDate: endDate1,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 24 }),
            items: [...items, ...otherItems],
        });

        expect(actual.find((item) => item.beginDate === beginDate)).toBeUndefined();
        expect(actual.find((item) => item.app === OFFLINE)).toBeUndefined();
        expect(actual.find((item) => item.app === ONLINE)).not.toBeUndefined();
    });
    it('Sets first, last and in between empty items hours 0 to 24', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: beginDate1,
                endDate: endDate1,
            },

            {
                app: ONLINE,
                beginDate: beginDate3,
                endDate: endDate3,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 24 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                beginDate: moment('2021-06-19T00:00:00').valueOf(),
                endDate: beginDate1,
                color: 'transparent',
                diff: 600,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate1,
                endDate: endDate1,
                diff: 10,
                x: 1,
            },

            {
                beginDate: endDate1,
                endDate: beginDate3,
                diff: 520,
                color: 'transparent',
                x: 2,
            },

            {
                app: ONLINE,
                beginDate: beginDate3,
                endDate: endDate3,
                diff: 20,
                x: 3,
            },
            {
                beginDate: endDate3,
                endDate: moment('2021-06-19T24:00:00').valueOf(),
                color: 'transparent',
                diff: 290,
                x: 4,
            },
        ]);
    });

    it('Sets first, last and in between empty items for hours 12 to 24', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: beginDate1,
                endDate: endDate1,
            },

            {
                app: ONLINE,
                beginDate: beginDate3,
                endDate: endDate3,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 12, endHour: 24 }),

            items: [...items],
        });

        expect(actual).toEqual([
            {
                beginDate: moment('2021-06-19T12:00:00').valueOf(),
                endDate: beginDate3,
                color: 'transparent',
                diff: 410,
                x: 0,
            },

            {
                app: ONLINE,
                beginDate: beginDate3,
                endDate: endDate3,
                diff: 20,
                x: 1,
            },
            {
                beginDate: endDate3,
                endDate: moment('2021-06-19T24:00:00').valueOf(),
                color: 'transparent',
                diff: 290,
                x: 2,
            },
        ]);
    });

    it('Clamps items for hours 12 to 24 beginDate', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: beginDate2,
                endDate: endDate2,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 12, endHour: 24 }),

            items: [...items],
        });

        expect(actual).toEqual([
            {
                app: ONLINE,
                beginDate: moment('2021-06-19T12:00:00').valueOf(),
                endDate: endDate2,
                diff: 10,
                x: 0,
            },
            {
                beginDate: endDate2,
                endDate: moment('2021-06-19T24:00:00').valueOf(),
                color: 'transparent',
                diff: 710,
                x: 1,
            },
        ]);
    });

    it('Clamps items for hours 12 to 24 endDate', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: beginDate2,
                endDate: endDate2,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 12 }),
            items: [...items],
        });

        expect(actual).toEqual([
            {
                beginDate: moment('2021-06-19T00:00:00').valueOf(),
                endDate: beginDate2,
                color: 'transparent',
                diff: 710,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate2,
                endDate: moment('2021-06-19T12:00:00').valueOf(),
                diff: 10,
                x: 1,
            },
        ]);
    });
    it('Clamps items for hours 12 to 24 endDate next day', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: beginDate4,
                endDate: endDate4,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 12, endHour: 24 }),
            items: [...items],
        });

        expect(actual).toEqual([
            {
                beginDate: moment('2021-06-19T12:00:00').valueOf(),
                endDate: beginDate4,
                color: 'transparent',
                diff: 710,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate4,
                endDate: moment('2021-06-19T24:00:00').valueOf(),
                diff: 10,
                x: 1,
            },
        ]);
    });

    it('Clamps items for hours 0 to 12 beginDate previous day', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: beginDate0,
                endDate: endDate0,
            },
        ];

        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 12 }),
            items: [...items],
        });

        expect(actual).toEqual([
            {
                app: ONLINE,
                beginDate: moment('2021-06-19T00:00:00').valueOf(),
                endDate: endDate0,
                diff: 10,
                x: 0,
            },
            {
                beginDate: endDate0,
                endDate: moment('2021-06-19T12:00:00').valueOf(),
                color: 'transparent',
                diff: 710,
                x: 1,
            },
        ]);
    });
});

const getDateFromTime = (time: string) => {
    return moment(`2021-06-19T${time}`).valueOf();
};

const MINUTES = 60 * 1000;
const minBreakTime = 5;

describe('OnlineChart groupByBreaks', () => {
    it('groupByBreaks take items until finds minimal break time.', () => {
        const chunk1 = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:29:00'),
                endDate: getDateFromTime('08:39:00'),
            },

            {
                app: ONLINE,
                beginDate: getDateFromTime('08:15:00'),
                endDate: getDateFromTime('08:25:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:14:00'),
            },
        ];
        const chunk2 = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('07:00:00'),
                endDate: getDateFromTime('07:10:00'),
            },
        ];

        const sorted = [...chunk1, ...chunk2];
        let grouped = groupByBreaks(sorted, minBreakTime);

        expect(grouped).toEqual([chunk1, chunk2]);
    });

    it('groupByBreaks groups all items', () => {
        const chunk1 = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:29:00'),
                endDate: getDateFromTime('08:39:00'),
            },

            {
                app: ONLINE,
                beginDate: getDateFromTime('08:15:00'),
                endDate: getDateFromTime('08:25:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:14:00'),
            },
        ];
        const chunk2 = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('07:00:00'),
                endDate: getDateFromTime('07:10:00'),
            },
        ];

        const chunk3 = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('06:50:00'),
                endDate: getDateFromTime('06:51:00'),
            },
        ];

        const chunk4 = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('06:00:00'),
                endDate: getDateFromTime('06:10:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('05:00:00'),
                endDate: getDateFromTime('05:55:00'),
            },
        ];

        const sorted = [...chunk1, ...chunk2, ...chunk3, ...chunk4];
        let grouped = groupByBreaks(sorted, minBreakTime);

        expect(grouped).toEqual([chunk1, chunk2, chunk3, chunk4]);
    });
});
describe('OnlineChart getTotalOnlineDuration', () => {
    it('getTotalOnlineDuration sums diffs', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:15:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:15:00'),
                endDate: getDateFromTime('08:25:00'),
            },
        ];
        const now = last(items)?.endDate;
        let duration = getTotalOnlineDuration(now, items, minBreakTime);

        expect(duration).toEqual([25 * MINUTES]);
    });

    it('getTotalOnlineDuration returns 0 if no ONLINE items', () => {
        const items = [
            {
                app: OFFLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:15:00'),
            },
            {
                app: IDLE,
                beginDate: getDateFromTime('08:15:00'),
                endDate: getDateFromTime('08:25:00'),
            },
        ];
        const now = last(items)?.endDate;
        let duration = getTotalOnlineDuration(now, items, minBreakTime);

        expect(duration).toEqual([0]);
    });

    it('getTotalOnlineDuration only sums ONLINE items', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:10:00'),
            },
            {
                beginDate: getDateFromTime('08:11:00'),
                endDate: getDateFromTime('08:14:00'),
            },
        ];
        const now = last(items)?.endDate;
        let duration = getTotalOnlineDuration(now, items, minBreakTime);

        expect(duration).toEqual([10 * MINUTES]);
    });

    it('getTotalOnlineDuration take items until finds minimal break time.', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('07:00:00'),
                endDate: getDateFromTime('07:10:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:14:00'),
            },

            {
                app: ONLINE,
                beginDate: getDateFromTime('08:15:00'),
                endDate: getDateFromTime('08:25:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:29:00'),
                endDate: getDateFromTime('08:39:00'),
            },
        ];

        const now = last(items)?.endDate;
        let duration = getTotalOnlineDuration(now, items, minBreakTime);

        expect(duration).toEqual([34 * MINUTES, 10 * MINUTES]);
    });
    it('getTotalOnlineDuration ignores items in creater then time specified', () => {
        const items = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('07:00:00'),
                endDate: getDateFromTime('07:10:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:14:00'),
            },

            {
                app: ONLINE,
                beginDate: getDateFromTime('08:15:00'),
                endDate: getDateFromTime('08:25:00'),
            },
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:29:00'),
                endDate: getDateFromTime('08:39:00'),
            },
        ];

        const now = getDateFromTime('08:15:00');
        let duration = getTotalOnlineDuration(now, items, minBreakTime);

        expect(duration).toEqual([14 * MINUTES, 10 * MINUTES]);
    });

    it('getTotalOnlineDuration returns [0] if just taken a break', () => {
        const now = getDateFromTime('08:25:00');
        const items = [
            {
                app: ONLINE,
                beginDate: getDateFromTime('08:00:00'),
                endDate: getDateFromTime('08:20:00'),
            },
        ];
        let duration = getTotalOnlineDuration(now, items, minBreakTime);

        expect(duration).toEqual([0]);
    });
});

describe('OnlineChart isBetweenHours', () => {
    it('isBetweenHours returns correctly if partly out of range in end part', () => {
        let startHour = 12;
        let endHour = 24;

        let { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });

        expect(
            isBetweenHours({ beginClamp, endClamp })({
                beginDate: beginDate4,
                endDate: endDate4,
            }),
        ).toBeTruthy();
    });

    it('isBetweenHours returns correctly if partly out of range in start part', () => {
        let startHour = 0;
        let endHour = 12;

        let { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });

        expect(
            isBetweenHours({ beginClamp, endClamp })({
                beginDate: beginDate2,
                endDate: beginDate2,
            }),
        ).toBeTruthy();
    });

    it('isBetweenHours returns correctly false if date is out of range ', () => {
        let startHour = 0;
        let endHour = 12;

        let { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });

        expect(
            isBetweenHours({ beginClamp, endClamp })({
                beginDate: beginDate4,
                endDate: endDate4,
            }),
        ).toBeFalsy();
    });

    it('isBetweenHours returns correctly false if date is out of range in start part', () => {
        let startHour = 12;
        let endHour = 24;

        let { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });

        expect(
            isBetweenHours({ beginClamp, endClamp })({
                beginDate: beginDate2,
                endDate: beginDate2,
            }),
        ).toBeFalsy();
    });
});

test('isLessThanHours returns correctly', () => {
    expect(
        isLessThanHours(getDateFromTime('08:15:00'))({
            endDate: getDateFromTime('08:15:00'),
        }),
    ).toBeTruthy();

    expect(
        isLessThanHours(getDateFromTime('08:15:00'))({
            endDate: getDateFromTime('08:14:00'),
        }),
    ).toBeTruthy();

    expect(
        isLessThanHours(getDateFromTime('08:15:00'))({
            endDate: getDateFromTime('08:16:00'),
        }),
    ).not.toBeTruthy();
});

export // Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
 {};
