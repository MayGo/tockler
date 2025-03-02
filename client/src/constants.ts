import { DateTime } from 'luxon';

export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const INPUT_DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss ZZ';
export const TIME_FORMAT = 'HH:mm:ss';
export const DAY_MONTH_LONG_FORMAT = 'd MMM';
export const TIME_FORMAT_SHORT = 'HH:mm';
export const DURATION_FORMAT = 'w[w] d[d] h[h] m[m] s[s]';
export const DURATION_SETTINGS = { largest: 2 };
export const BREAKPOINT_TIME = '04:00';

export const convertDate = (d: Date | number | DateTime): DateTime => {
    if (d instanceof DateTime) {
        return d;
    }
    if (typeof d === 'number') {
        return DateTime.fromMillis(d);
    }
    return DateTime.fromJSDate(d);
};

export const COLORS = { green: '#8BC34A' };
