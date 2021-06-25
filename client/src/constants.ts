import moment from 'moment';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const INPUT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss ZZ';
export const TIME_FORMAT = 'HH:mm:ss';
export const DAY_MONTH_LONG_FORMAT = 'D MMM';
export const TIME_FORMAT_SHORT = 'HH:mm';
export const DURATION_FORMAT = 'w[w] d[d] h[h] m[m] s[s]';
export const DURATION_SETTINGS = { largest: 2 };
export const BREAKPOINT_TIME = '04:00';

export const convertDate = (d: Date) => {
    return moment(d);
};

export const COLORS = { green: '#8BC34A' };
