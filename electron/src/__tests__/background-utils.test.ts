import moment from 'moment';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BackgroundUtils from '../background/background-utils';
import { TrackItem } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { appConstants } from '../utils/app-constants';

describe('BackgroundUtils', () => {
    describe('isSameItems', () => {
        it('should return true when items have same app and title', () => {
            const item1 = { app: 'Chrome', title: 'Google' };
            const item2 = { app: 'Chrome', title: 'Google' };

            expect(BackgroundUtils.isSameItems(item1, item2)).toBe(true);
        });

        it('should return false when items have different app or title', () => {
            const item1 = { app: 'Chrome', title: 'Google' };
            const item2 = { app: 'Firefox', title: 'Google' };
            const item3 = { app: 'Chrome', title: 'Yahoo' };

            expect(BackgroundUtils.isSameItems(item1, item2)).toBe(false);
            expect(BackgroundUtils.isSameItems(item1, item3)).toBe(false);
        });

        it('should return false when either item is null or undefined', () => {
            const item1 = { app: 'Chrome', title: 'Google' };

            expect(BackgroundUtils.isSameItems(item1, null)).toBe(false);
            expect(BackgroundUtils.isSameItems(null, item1)).toBe(false);
            expect(BackgroundUtils.isSameItems(undefined, item1)).toBe(false);
            expect(BackgroundUtils.isSameItems(item1, undefined)).toBe(false);
        });
    });

    describe('currentTimeMinusJobInterval', () => {
        beforeEach(() => {
            // Mock Date
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2023-01-01T10:00:00Z'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return current time minus BACKGROUND_JOB_INTERVAL', () => {
            const result = BackgroundUtils.currentTimeMinusJobInterval();
            const expected = new Date('2023-01-01T10:00:00Z').getTime() - appConstants.BACKGROUND_JOB_INTERVAL;

            expect(result).toBe(expected);
        });
    });

    describe('shouldSplitInTwoOnMidnight', () => {
        it('should return false if dates are in the same day', () => {
            const beginDate = moment('2023-01-01T10:00:00').valueOf();
            const endDate = moment('2023-01-01T22:00:00').valueOf();

            expect(BackgroundUtils.shouldSplitInTwoOnMidnight(beginDate, endDate)).toBe(false);
        });

        it('should return true if dates span across days', () => {
            const beginDate = moment('2023-01-01T10:00:00').valueOf();
            const endDate = moment('2023-01-02T10:00:00').valueOf();

            expect(BackgroundUtils.shouldSplitInTwoOnMidnight(beginDate, endDate)).toBe(true);
        });
    });

    describe('almostMidnight', () => {
        it('should return 23:59:59 of the given date', () => {
            const date = new Date('2023-01-01T10:00:00');
            const almostMidnight = BackgroundUtils.almostMidnight(date);

            expect(almostMidnight.getHours()).toBe(23);
            expect(almostMidnight.getMinutes()).toBe(59);
            expect(almostMidnight.getSeconds()).toBe(59);
            expect(almostMidnight.getDate()).toBe(1);
            expect(almostMidnight.getMonth()).toBe(0);
            expect(almostMidnight.getFullYear()).toBe(2023);
        });
    });

    describe('startOfDay', () => {
        it('should return 00:00:00 of the given date', () => {
            const date = new Date('2023-01-01T10:00:00');
            const startOfDay = BackgroundUtils.startOfDay(date);

            expect(startOfDay.getHours()).toBe(0);
            expect(startOfDay.getMinutes()).toBe(0);
            expect(startOfDay.getSeconds()).toBe(0);
            expect(startOfDay.getDate()).toBe(1);
            expect(startOfDay.getMonth()).toBe(0);
            expect(startOfDay.getFullYear()).toBe(2023);
        });
    });

    describe('daysBetween', () => {
        it('should return 0 for same day', () => {
            const beginDate = moment('2023-01-01T10:00:00').valueOf();
            const endDate = moment('2023-01-01T22:00:00').valueOf();

            expect(BackgroundUtils.daysBetween(beginDate, endDate)).toBe(0);
        });

        it('should return correct number of days between dates', () => {
            const beginDate = moment('2023-01-01T10:00:00').valueOf();
            const endDate = moment('2023-01-05T22:00:00').valueOf();

            expect(BackgroundUtils.daysBetween(beginDate, endDate)).toBe(4);
        });
    });

    describe('getRawTrackItem', () => {
        it('should convert TrackItem to raw format', () => {
            const trackItem = {
                id: 1,
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                color: '#ff0000',
                beginDate: 1672567200000, // 2023-01-01T10:00:00
                endDate: 1672610400000, // 2023-01-01T22:00:00
                url: 'https://google.com',
            } as TrackItem;

            const rawItem = BackgroundUtils.getRawTrackItem(trackItem);

            expect(rawItem).toEqual({
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                color: '#ff0000',
                beginDate: 1672567200000,
                endDate: 1672610400000,
                url: 'https://google.com',
            });
        });

        it('should handle null or undefined fields', () => {
            const trackItem = {
                id: 1,
                app: 'Chrome',
                beginDate: 1672567200000,
                endDate: 1672610400000,
            } as TrackItem;

            const rawItem = BackgroundUtils.getRawTrackItem(trackItem);

            expect(rawItem).toEqual({
                app: 'Chrome',
                title: undefined,
                taskName: undefined,
                color: undefined,
                beginDate: 1672567200000,
                endDate: 1672610400000,
                url: undefined,
            });
        });
    });

    describe('splitItemIntoDayChunks', () => {
        it('should throw error if begin and end date are on the same day', () => {
            const item = {
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                beginDate: moment('2023-01-01T10:00:00').valueOf(),
                endDate: moment('2023-01-01T22:00:00').valueOf(),
            };

            expect(() => BackgroundUtils.splitItemIntoDayChunks(item)).toThrow();
        });

        it('should split item into 2 day chunks correctly', () => {
            const item = {
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                beginDate: moment('2023-01-01T10:00:00').valueOf(),
                endDate: moment('2023-01-02T22:00:00').valueOf(),
            };

            const chunks = BackgroundUtils.splitItemIntoDayChunks(item);

            expect(chunks.length).toBe(2);

            // First chunk: from original begin to end of day
            expect(moment(chunks[0].beginDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-01T10:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );
            expect(moment(chunks[0].endDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-01T23:59:59').format('YYYY-MM-DD HH:mm:ss'),
            );

            // Second chunk: from start of next day to original end
            expect(moment(chunks[1].beginDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-02T00:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );
            expect(moment(chunks[1].endDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-02T22:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );

            // Other properties should be copied
            expect(chunks[0].app).toBe(item.app);
            expect(chunks[0].title).toBe(item.title);
            expect(chunks[0].taskName).toBe(item.taskName);
            expect(chunks[1].app).toBe(item.app);
            expect(chunks[1].title).toBe(item.title);
            expect(chunks[1].taskName).toBe(item.taskName);
        });

        it('should split item into 3 day chunks correctly', () => {
            const item = {
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                beginDate: moment('2023-01-01T10:00:00').valueOf(),
                endDate: moment('2023-01-03T22:00:00').valueOf(),
            };

            const chunks = BackgroundUtils.splitItemIntoDayChunks(item);

            expect(chunks.length).toBe(3);

            // First day
            expect(moment(chunks[0].beginDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-01T10:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );
            expect(moment(chunks[0].endDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-01T23:59:59').format('YYYY-MM-DD HH:mm:ss'),
            );

            // Middle day (full day)
            expect(moment(chunks[1].beginDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-02T00:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );
            expect(moment(chunks[1].endDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-02T23:59:59').format('YYYY-MM-DD HH:mm:ss'),
            );

            // Last day
            expect(moment(chunks[2].beginDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-03T00:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );
            expect(moment(chunks[2].endDate).format('YYYY-MM-DD HH:mm:ss')).toBe(
                moment('2023-01-03T22:00:00').format('YYYY-MM-DD HH:mm:ss'),
            );
        });

        it('should preserve all properties in the split items', () => {
            const item = {
                id: 1,
                app: 'Chrome',
                title: 'Google',
                taskName: TrackItemType.AppTrackItem,
                color: '#ff0000',
                url: 'https://google.com',
                beginDate: moment('2023-01-01T10:00:00').valueOf(),
                endDate: moment('2023-01-02T22:00:00').valueOf(),
            };

            const chunks = BackgroundUtils.splitItemIntoDayChunks(item);

            chunks.forEach((chunk) => {
                expect(chunk.app).toBe(item.app);
                expect(chunk.title).toBe(item.title);
                expect(chunk.taskName).toBe(item.taskName);
                expect(chunk.color).toBe(item.color);
                expect(chunk.url).toBe(item.url);
                // id should be copied if present
                expect(chunk.id).toBe(item.id);
            });
        });
    });
});
