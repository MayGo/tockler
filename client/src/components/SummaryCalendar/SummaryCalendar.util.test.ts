import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { CALENDAR_MODE } from '../../SummaryContext.util';
import { summariseTimeOnline } from './SummaryCalendar.util';
import { TEST_INPUT } from './SummaryCalendar.util.testdata';

describe('summariseTimeOnline', () => {
    it('parses online items', () => {
        const actual = summariseTimeOnline(TEST_INPUT, CALENDAR_MODE.MONTH, DateTime.fromMillis(1589311528755));
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
                id: 1,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 02:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 03:30', 'yyyy-MM-dd HH:mm').toMillis(),
            },
        ];
        const actual = summariseTimeOnline(
            input,
            CALENDAR_MODE.MONTH,
            DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm'),
        );
        const result = {
            '04-09': {
                beginDate: DateTime.fromFormat('2020-04-10 02:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 03:30', 'yyyy-MM-dd HH:mm').toMillis(),
                online: 3600000,
            },
        };

        expect(actual).toEqual(result);
    });

    it('online item after 04:00 goes to correct day', () => {
        const input = [
            {
                id: 1,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 05:30', 'yyyy-MM-dd HH:mm').toMillis(),
            },
        ];
        const actual = summariseTimeOnline(
            input,
            CALENDAR_MODE.MONTH,
            DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm'),
        );
        const result = {
            '04-10': {
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 05:30', 'yyyy-MM-dd HH:mm').toMillis(),
                online: 3600000,
            },
        };

        expect(actual).toEqual(result);
    });

    it('woke up 04:30 and went to sleep 03:30', () => {
        const input = [
            {
                id: 1,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 05:30', 'yyyy-MM-dd HH:mm').toMillis(),
            },
            {
                id: 2,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 11:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 15:30', 'yyyy-MM-dd HH:mm').toMillis(),
            },
            {
                id: 3,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 23:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-11 01:30', 'yyyy-MM-dd HH:mm').toMillis(),
            },
            {
                id: 4,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-11 02:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-11 03:30', 'yyyy-MM-dd HH:mm').toMillis(),
            },
        ];
        const actual = summariseTimeOnline(
            input,
            CALENDAR_MODE.MONTH,
            DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm'),
        );
        const result = {
            '04-10': {
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'yyyy-MM-dd HH:mm').toMillis(),
                endDate: DateTime.fromFormat('2020-04-11 03:30', 'yyyy-MM-dd HH:mm').toMillis(),
                online: 28800000,
            },
        };

        expect(actual).toEqual(result);
    });
});

export // Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
 {};
