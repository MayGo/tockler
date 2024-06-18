import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import isBetween from 'dayjs/plugin/isBetween'; // Import the plugin
dayjs.extend(isBetween);

// Extend Day.js with the plugins
dayjs.extend(duration);

// Custom max function for Day.js dates
export const maxDayjs = (...dates) => {
    return dates.reduce((max, current) => (dayjs(max).isAfter(current) ? max : current));
};

// Custom min function for Day.js dates
export const minDayjs = (...dates) => {
    return dates.reduce((min, current) => (dayjs(min).isBefore(current) ? min : current));
};

// Export the configured Day.js
export { dayjs };
