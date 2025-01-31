import moment from 'moment';
import { sumApp } from './MetricTiles.utils';
import { describe, expect, it } from 'vitest';

describe('MetricTiles utils', () => {
    it('sumApp in range items', () => {
        const visibleTimerange = [moment('2021-06-19T17:00:00.000Z'), moment('2021-06-19T19:00:00.000Z')];
        const items = [
            {
                beginDate: moment('2021-06-19T17:00:00.000Z').valueOf(),
                endDate: moment('2021-06-19T17:10:00.000Z').valueOf(),
            },
            {
                beginDate: moment('2021-06-19T18:00:00.000Z').valueOf(),
                endDate: moment('2021-06-19T18:10:00.000Z').valueOf(),
            },
            {
                beginDate: moment('2021-06-19T18:50:00.000Z').valueOf(),
                endDate: moment('2021-06-19T19:00:00.000Z').valueOf(),
            },
        ];
        const actual = items.reduce(sumApp(visibleTimerange), 0);
        expect(actual).toEqual(30 * 60 * 1000);
    });
    it('sumApp does not include out of range items', () => {
        const visibleTimerange = [moment('2021-06-19T17:00:00.000Z'), moment('2021-06-19T19:00:00.000Z')];
        const items = [
            {
                beginDate: moment('2021-06-19T16:50:00.000Z').valueOf(),
                endDate: moment('2021-06-19T16:59:59.000Z').valueOf(),
            },
            {
                beginDate: moment('2021-06-19T18:00:00.000Z').valueOf(),
                endDate: moment('2021-06-19T18:10:00.000Z').valueOf(),
            },
            {
                beginDate: moment('2021-06-19T19:00:01.000Z').valueOf(),
                endDate: moment('2021-06-19T19:10:00.000Z').valueOf(),
            },
        ];
        const actual = items.reduce(sumApp(visibleTimerange), 0);
        expect(actual).toEqual(10 * 60 * 1000);
    });

    it('sumApp uses only in range time', () => {
        const visibleTimerange = [moment('2021-06-19T17:00:00.000Z'), moment('2021-06-19T19:00:00.000Z')];
        const items = [
            {
                beginDate: moment('2021-06-19T16:50:00.000Z').valueOf(),
                endDate: moment('2021-06-19T17:10:00.000Z').valueOf(),
            },
            {
                beginDate: moment('2021-06-19T18:00:00.000Z').valueOf(),
                endDate: moment('2021-06-19T18:10:00.000Z').valueOf(),
            },
            {
                beginDate: moment('2021-06-19T18:50:00.000Z').valueOf(),
                endDate: moment('2021-06-19T19:10:00.000Z').valueOf(),
            },
        ];
        const actual = items.reduce(sumApp(visibleTimerange), 0);
        expect(actual).toEqual(30 * 60 * 1000);
    });
});

export // Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
 {};
