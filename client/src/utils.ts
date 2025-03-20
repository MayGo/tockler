import { formatDuration, intervalToDuration } from 'date-fns';
import { DateTime } from 'luxon';
import { convertDate } from './constants';
import { TrackItemType } from './enum/TrackItemType';

export const diffAndFormatShort = (beginDate: number, endDate: number) => {
    const diff = convertDate(endDate).diff(convertDate(beginDate));
    return formatDurationInternal(diff.toMillis());
};

export const formatDurationInternal = (dur: number) => {
    if (!dur) {
        return '0s';
    }

    const formattedDuration = formatDuration(intervalToDuration({ start: 0, end: dur }), { zero: false });

    return formattedDuration
        .replace(/ minutes?/g, 'm')
        .replace(/ hours?/g, 'h')
        .replace(/ seconds?/g, 's');
};

export const ITEM_TYPES = {
    [TrackItemType.AppTrackItem]: 'App',
    [TrackItemType.StatusTrackItem]: 'Status',
    [TrackItemType.LogTrackItem]: 'Task',
};

// Constants for localStorage keys
export const STORAGE_KEYS = {
    VISIBLE_RANGE: 'tockler_visible_range',
};

/**
 * Saves the visible range to localStorage
 * @param visibleTimerange Array of DateTime objects [start, end]
 */
export const saveVisibleRange = (visibleTimerange: DateTime[]): void => {
    if (!visibleTimerange || visibleTimerange.length !== 2) {
        console.error('Invalid visible range found in localStorage');
        return;
    }

    try {
        const serialized = JSON.stringify(visibleTimerange.map((dt) => dt.toISO()));
        localStorage.setItem(STORAGE_KEYS.VISIBLE_RANGE, serialized);
        console.log('Saved visible range to localStorage:', serialized);
    } catch (error) {
        console.error('Failed to save visible range to localStorage:', error);
    }
};

/**
 * Loads the visible range from localStorage
 * @returns Array of DateTime objects [start, end] or null if not found
 */
export const loadVisibleRange = (): DateTime[] | null => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEYS.VISIBLE_RANGE);
        if (!serialized) {
            console.error('No visible range found in localStorage');
            return null;
        }

        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed) || parsed.length !== 2) {
            console.error('Invalid visible range found in localStorage');
            return null;
        }

        console.log('Loaded visible range from localStorage:', parsed);
        return parsed.map((isoString) => DateTime.fromISO(isoString));
    } catch (error) {
        console.error('Failed to load visible range from localStorage:', error);
        return null;
    }
};
