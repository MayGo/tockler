import moment from 'moment';
import { getClampHours, getOnlineTimesForChart, isBetweenHours } from './OnlineChart.util';

const ONLINE = 'ONLINE';
const OFFLINE = 'OFFLINE';

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

        expect(actual.find(item => item.beginDate === beginDate)).toBeUndefined();
        expect(actual.find(item => item.app === OFFLINE)).toBeUndefined();
        expect(actual.find(item => item.app === ONLINE)).not.toBeUndefined();
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

export // Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
{};
