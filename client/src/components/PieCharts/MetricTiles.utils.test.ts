import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { sumApp } from './MetricTiles.utils';

describe('MetricTiles utils', () => {
    it('sumApp in range items', () => {
        const visibleTimerange = [
            DateTime.fromISO('2021-06-19T17:00:00.000Z'),
            DateTime.fromISO('2021-06-19T19:00:00.000Z'),
        ];
        const items = [
            {
                id: 1,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T17:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T17:10:00.000Z').toMillis(),
            },
            {
                id: 2,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T18:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T18:10:00.000Z').toMillis(),
            },
            {
                id: 3,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T18:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T19:00:00.000Z').toMillis(),
            },
        ];
        const actual = items.reduce(sumApp(visibleTimerange), 0);
        expect(actual).toEqual(30 * 60 * 1000);
    });
    it('sumApp does not include out of range items', () => {
        const visibleTimerange = [
            DateTime.fromISO('2021-06-19T17:00:00.000Z'),
            DateTime.fromISO('2021-06-19T19:00:00.000Z'),
        ];
        const items = [
            {
                id: 1,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T16:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T16:59:59.000Z').toMillis(),
            },
            {
                id: 2,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T18:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T18:10:00.000Z').toMillis(),
            },
            {
                id: 3,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T19:00:01.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T19:10:00.000Z').toMillis(),
            },
        ];
        const actual = items.reduce(sumApp(visibleTimerange), 0);
        expect(actual).toEqual(10 * 60 * 1000);
    });

    it('sumApp uses only in range time', () => {
        const visibleTimerange = [
            DateTime.fromISO('2021-06-19T17:00:00.000Z'),
            DateTime.fromISO('2021-06-19T19:00:00.000Z'),
        ];
        const items = [
            {
                id: 1,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T16:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T17:10:00.000Z').toMillis(),
            },
            {
                id: 2,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T18:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T18:10:00.000Z').toMillis(),
            },
            {
                id: 3,
                app: 'Test',
                beginDate: DateTime.fromISO('2021-06-19T18:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T19:10:00.000Z').toMillis(),
            },
        ];
        const actual = items.reduce(sumApp(visibleTimerange), 0);
        expect(actual).toEqual(30 * 60 * 1000);
    });
});

export // Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
 {};
