import { describe, expect, it } from 'vitest';

import { NewTrackItem } from '../drizzle/schema';
import { getTimestamp } from './time.testUtils'; // Importing getTimestamp

vi.mock('electron');
vi.mock('../utils/log-manager');

describe('splitTrackItemAtMidnight', () => {
    it('should not split item when begin and end dates are on the same day', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        // Arrange
        const sameDay: NewTrackItem = {
            app: 'Test App',
            beginDate: getTimestamp('2024-02-01T10:00:00'),
            endDate: getTimestamp('2024-02-01T14:00:00'),
            taskName: 'Test Task',
        };

        // Act
        const result = splitTrackItemAtMidnight(sameDay);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(sameDay); // Should return the original item
    });

    it('should split item into two when it spans exactly two days', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        // Arrange
        const twoDays: NewTrackItem = {
            app: 'Test App',
            beginDate: getTimestamp('2024-02-01T20:00:00'),
            endDate: getTimestamp('2024-02-02T04:00:00'),
            taskName: 'Test Task',
        };

        // Act
        const result = splitTrackItemAtMidnight(twoDays);

        // Assert
        expect(result).toHaveLength(2);

        // First item: from Feb 1, 20:00 to Feb 1, 23:59:59.999
        expect(result[0].beginDate).toBe(twoDays.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));
        expect(result[0].app).toBe(twoDays.app);
        expect(result[0].taskName).toBe(twoDays.taskName);

        // Second item: from Feb 2, 00:00:00.000 to Feb 2, 04:00
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(twoDays.endDate);
        expect(result[1].app).toBe(twoDays.app);
        expect(result[1].taskName).toBe(twoDays.taskName);
    });

    it('should split item into multiple pieces when it spans more than two days', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        // Arrange
        const multiDays: NewTrackItem = {
            app: 'Test App',
            beginDate: getTimestamp('2024-02-01T22:00:00'),
            endDate: getTimestamp('2024-02-03T02:00:00'),
            taskName: 'Test Task',
            title: 'Test Title',
            url: 'http://test.com',
            color: '#FFFFFF',
        };

        // Act
        const result = splitTrackItemAtMidnight(multiDays);

        // Assert
        expect(result).toHaveLength(3);

        // First item: from Feb 1, 22:00 to Feb 1, 23:59:59.999
        expect(result[0].beginDate).toBe(multiDays.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));

        // Second item: the full day of Feb 2
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(getTimestamp('2024-02-02T23:59:59.999'));

        // Third item: from Feb 3, 00:00:00.000 to Feb 3, 02:00
        expect(result[2].beginDate).toBe(getTimestamp('2024-02-03T00:00:00'));
        expect(result[2].endDate).toBe(multiDays.endDate);

        // All items should keep the original properties
        for (const item of result) {
            expect(item.app).toBe(multiDays.app);
            expect(item.taskName).toBe(multiDays.taskName);
            expect(item.title).toBe(multiDays.title);
            expect(item.url).toBe(multiDays.url);
            expect(item.color).toBe(multiDays.color);
        }
    });

    it('should handle items exactly at midnight', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        // Arrange
        const exactMidnight: NewTrackItem = {
            app: 'Test App',
            beginDate: getTimestamp('2024-02-01T00:00:00'),
            endDate: getTimestamp('2024-02-02T00:00:00'),
            taskName: 'Test Task',
        };

        // Act
        const result = splitTrackItemAtMidnight(exactMidnight);

        // Assert
        expect(result).toHaveLength(2);

        // First item: from Feb 1, 00:00 to Feb 1, 23:59:59.999
        expect(result[0].beginDate).toBe(exactMidnight.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));

        // Second item: exactly Feb 2, 00:00
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(exactMidnight.endDate);
    });

    it('should handle fractional milliseconds correctly', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        // Arrange
        const withMilliseconds: NewTrackItem = {
            app: 'Test App',
            beginDate: getTimestamp('2024-02-01T23:59:59.500'),
            endDate: getTimestamp('2024-02-02T00:00:00.500'),
            taskName: 'Test Task',
        };

        // Act
        const result = splitTrackItemAtMidnight(withMilliseconds);

        // Assert
        expect(result).toHaveLength(2);

        // First item: from the original time to 23:59:59.999
        expect(result[0].beginDate).toBe(withMilliseconds.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));

        // Second item: from 00:00:00.000 to the original end time
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(withMilliseconds.endDate);
    });
});
