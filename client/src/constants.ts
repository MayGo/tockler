import moment from 'moment';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const INPUT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss ZZ';
export const TIME_FORMAT = 'HH:mm:ss';
export const DAY_MONTH_LONG_FORMAT = 'D MMM';
export const TIME_FORMAT_SHORT = 'HH:mm';
export const DURATION_FORMAT = 'w[w] d[d] h[h] m[m] s[s]';
export const DURATION_SETTINGS = { largest: 2 };
export const BREAKPOINT_TIME = '04:00';

export const convertDate = (d: Date) => moment(d);

export const COLORS = { green: '#8BC34A' };

export const THEME_DARK = 'dark';
export const THEME_LIGHT = 'default';
export const THEME_COMPACT = 'compact';

export const ThemeVariables: any = {
    [THEME_DARK]: {
        name: THEME_DARK,
        variables: {
            'normal-color': '#000000',
            'primary-color': '#8363ff',
            'body-background': '#303030',
            'component-background': '#000000',
        },
    },
    [THEME_LIGHT]: {
        name: THEME_LIGHT,
        variables: {
            'normal-color': '#ffffff',
            'primary-color': '#8363ff',
            'body-background': '#f8f8f8',
            'component-background': '#ffffff',
        },
    },
    [THEME_COMPACT]: {
        name: THEME_COMPACT,
        variables: {
            'normal-color': '#ffffff',
            'primary-color': '#8363ff',
            'body-background': '#f8f8f8',
            'component-background': '#f8f8f8',
        },
    },
};
