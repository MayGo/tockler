jest.autoMockOff();

import BackgroundUtils from '../app/background-utils';
import { TrackItemType } from '../app/enums/track-item-type';

import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('splitItemIntoDayChunks', () => {
    it('returns items split into day chunks: 5 days', async () => {
        const currentDate = '2017-06-20T10:15:00';

        const rawItem: TrackItemAttributes = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            beginDate: moment('2017-06-20T10:15:00').toDate(),
            endDate: moment('2017-06-25T15:27:00').toDate(),
        };

        let items = BackgroundUtils.splitItemIntoDayChunks(rawItem);

        expect(items.length).toEqual(6);

        let onlyDates = items.map((item, i) => {
            return {
                beginDate: moment(item.beginDate).format(dateFormat),
                endDate: moment(item.endDate).format(dateFormat),
            };
        });

        expect(onlyDates).toEqual([
            {
                beginDate: '2017-06-20 10:15:00',
                endDate: '2017-06-20 23:59:59',
            },
            {
                beginDate: '2017-06-21 00:00:00',
                endDate: '2017-06-21 23:59:59',
            },
            {
                beginDate: '2017-06-22 00:00:00',
                endDate: '2017-06-22 23:59:59',
            },
            {
                beginDate: '2017-06-23 00:00:00',
                endDate: '2017-06-23 23:59:59',
            },
            {
                beginDate: '2017-06-24 00:00:00',
                endDate: '2017-06-24 23:59:59',
            },
            {
                beginDate: '2017-06-25 00:00:00',
                endDate: '2017-06-25 15:27:00',
            },
        ]);
    });

    it('returns items split into day chunks: 2 days', async () => {
        const currentDate = '2017-06-20T10:15:00';

        const rawItem: TrackItemAttributes = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            beginDate: moment('2017-06-20T10:15:00').toDate(),
            endDate: moment('2017-06-21T15:27:00').toDate(),
        };

        let items = BackgroundUtils.splitItemIntoDayChunks(rawItem);

        expect(items.length).toEqual(2);

        let onlyDates = items.map((item, i) => {
            return {
                beginDate: moment(item.beginDate).format(dateFormat),
                endDate: moment(item.endDate).format(dateFormat),
            };
        });

        expect(onlyDates).toEqual([
            {
                beginDate: '2017-06-20 10:15:00',
                endDate: '2017-06-20 23:59:59',
            },
            {
                beginDate: '2017-06-21 00:00:00',
                endDate: '2017-06-21 15:27:00',
            },
        ]);
    });

    it('throws exception when begin and end is on same day.', async () => {
        const rawItem: TrackItemAttributes = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            beginDate: moment('2017-06-20T10:15:00').toDate(),
            endDate: moment('2017-06-20T15:27:00').toDate(),
        };

        expect(() => {
            BackgroundUtils.splitItemIntoDayChunks(rawItem);
        }).toThrow();
    });

    it('contains all fields', async () => {
        const rawItem: TrackItemAttributes = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            beginDate: moment().startOf('day').subtract(1, 'days').toDate(),
            endDate: moment().startOf('day').toDate(),
        };

        let items = BackgroundUtils.splitItemIntoDayChunks(rawItem);
        let item = items[0];
        expect(items.length).toEqual(2);

        expect(item.app).toEqual(rawItem.app);
        expect(item.title).toEqual(rawItem.title);
        expect(item.taskName).toEqual(TrackItemType.LogTrackItem);
        expect(item.beginDate).not.toBeNull;
        expect(item.endDate).not.toBeNull;
    });
});

describe('shouldSplitInTwoOnMidnight', () => {
    it('returns false if same day', async () => {
        let shouldSplit = BackgroundUtils.shouldSplitInTwoOnMidnight(
            moment('2017-06-20T10:15:00').toDate(),
            moment('2017-06-20T15:27:00').toDate(),
        );
        expect(shouldSplit).toEqual(false);
    });
    it('returns true if not same day', async () => {
        let shouldSplit = BackgroundUtils.shouldSplitInTwoOnMidnight(
            moment('2017-06-19T10:15:00').toDate(),
            moment('2017-06-20T15:27:00').toDate(),
        );
        expect(shouldSplit).toEqual(true);
    });
});
