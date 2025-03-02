import { DateTime } from 'luxon';
import { convertDate } from '../../constants';

/**
 * Gets a dynamic time format function based on the visible time range
 *
 * @param timestamp - The timestamp to format
 * @param visibleTimerange - The current visible time range (optional)
 * @returns Formatted time string appropriate for the current zoom level
 */
export const getDynamicTimeFormat = (timestamp: number, visibleTimerange?: DateTime[]) => {
    // Get the current system locale for date/time formatting
    const locale = DateTime.local().resolvedLocaleOptions().locale;
    const dateTime = convertDate(timestamp);

    // If no visible timerange is set yet, use the default format
    if (!visibleTimerange || visibleTimerange.length !== 2) {
        return dateTime.setLocale(locale).toLocaleString(DateTime.TIME_WITH_SECONDS);
    }

    // Calculate the duration of the visible range in milliseconds
    const [start, end] = visibleTimerange;
    const rangeDuration = end.diff(start).milliseconds;

    // Adjust format based on zoom level
    if (rangeDuration > 24 * 60 * 60 * 1000) {
        // More than 24 hours - show date and time
        return dateTime.setLocale(locale).toLocaleString({ ...DateTime.DATE_MED_WITH_WEEKDAY, year: undefined });
    } else if (rangeDuration > 60 * 60 * 1000) {
        // More than 1 hour - show hours and minutes
        return dateTime.setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE);
    } else {
        // Zoomed in - show hours, minutes and seconds
        return dateTime.setLocale(locale).toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
};
