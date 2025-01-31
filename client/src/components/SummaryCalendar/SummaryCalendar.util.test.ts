import { expect, it } from 'vitest';
import { describe } from 'vitest';
import { summariseTimeOnline } from './SummaryCalendar.util';
import { TEST_INPUT } from './SummaryCalendar.util.testdata';
import moment from 'moment';

describe('summariseTimeOnline', () => {
    it('parses online items', () => {
        const actual = summariseTimeOnline(TEST_INPUT, 'month', moment(1589311528755));
        const result = {
            '05-12': { beginDate: 1589311528755, endDate: 1589312113568, online: 358396 },
            '05-14': { beginDate: 1589480558049, endDate: 1589483666850, online: 2707998 },
            '05-24': { beginDate: 1590354279611, endDate: 1590357497348, online: 3085853 },
            '05-25': { beginDate: 1590375522178, endDate: 1590388476539, online: 1527164 },
        };

        expect(actual).toEqual(result);
    });

    it('online item over midnight - until 04:00 - it goes to previous day', () => {
        const input = [
            {
                app: 'ONLINE',
                beginDate: moment('2020-04-10 02:30').valueOf(),
                endDate: moment('2020-04-10 03:30').valueOf(),
            },
        ];
        const actual = summariseTimeOnline(input, 'month', moment('2020-04-10 04:30'));
        const result = {
            '04-09': {
                beginDate: moment('2020-04-10 02:30').valueOf(),
                endDate: moment('2020-04-10 03:30').valueOf(),
                online: 3600000,
            },
        };

        expect(actual).toEqual(result);
    });

    it('online item after 04:00 goes to correct day', () => {
        const input = [
            {
                app: 'ONLINE',
                beginDate: moment('2020-04-10 04:30').valueOf(),
                endDate: moment('2020-04-10 05:30').valueOf(),
            },
        ];
        const actual = summariseTimeOnline(input, 'month', moment('2020-04-10 04:30'));
        const result = {
            '04-10': {
                beginDate: moment('2020-04-10 04:30').valueOf(),
                endDate: moment('2020-04-10 05:30').valueOf(),
                online: 3600000,
            },
        };

        expect(actual).toEqual(result);
    });

    it('woke up 04:30 and went to sleep 03:30', () => {
        const input = [
            {
                app: 'ONLINE',
                beginDate: moment('2020-04-10 04:30').valueOf(),
                endDate: moment('2020-04-10 05:30').valueOf(),
            },
            {
                app: 'ONLINE',
                beginDate: moment('2020-04-10 11:30').valueOf(),
                endDate: moment('2020-04-10 15:30').valueOf(),
            },
            {
                app: 'ONLINE',
                beginDate: moment('2020-04-10 23:30').valueOf(),
                endDate: moment('2020-04-11 01:30').valueOf(),
            },
            {
                app: 'ONLINE',
                beginDate: moment('2020-04-11 02:30').valueOf(),
                endDate: moment('2020-04-11 03:30').valueOf(),
            },
        ];
        const actual = summariseTimeOnline(input, 'month', moment('2020-04-10 04:30'));
        const result = {
            '04-10': {
                beginDate: moment('2020-04-10 04:30').valueOf(),
                endDate: moment('2020-04-11 03:30').valueOf(),
                online: 28800000,
            },
        };

        expect(actual).toEqual(result);
    });
});

export // Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
 {};
