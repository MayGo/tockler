import { NewTrackItem } from '../../schema';

/**
 * Utility functions for date operations
 */
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

function createMidnightDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function createStartOfDayDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function createTrackItemWithDates(originalItem: NewTrackItem, beginDate: number, endDate: number): NewTrackItem {
    return {
        ...originalItem,
        beginDate,
        endDate,
    };
}

/**
 * Checks if a track item spans across midnight and returns an array of items split at midnight boundaries
 * @param item Track item to check and potentially split
 * @returns Array of track items, either the original item or multiple items split at midnight
 */
export function splitTrackItemAtMidnight(item: NewTrackItem): NewTrackItem[] {
    const beginDate = new Date(item.beginDate);
    const endDate = new Date(item.endDate);

    // If begin and end dates are on the same day, no splitting needed
    if (isSameDay(beginDate, endDate)) {
        return [item];
    }

    const items: NewTrackItem[] = [];
    let currentDate = new Date(beginDate);

    // For the first day (from begin time to midnight)
    const firstDayMidnight = createMidnightDate(beginDate);
    items.push(createTrackItemWithDates(item, beginDate.getTime(), firstDayMidnight.getTime()));

    // For any days in between (full days)
    currentDate = new Date(firstDayMidnight.getTime() + 1);
    while (!isSameDay(currentDate, endDate)) {
        const dayStart = createStartOfDayDate(currentDate);
        const dayEnd = createMidnightDate(currentDate);

        items.push(createTrackItemWithDates(item, dayStart.getTime(), dayEnd.getTime()));

        // Move to next day
        currentDate = new Date(dayEnd.getTime() + 1);
    }

    // For the last day (from midnight to end time)
    const lastDayStart = createStartOfDayDate(endDate);
    items.push(createTrackItemWithDates(item, lastDayStart.getTime(), endDate.getTime()));

    return items;
}
