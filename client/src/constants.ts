import moment from 'moment';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const INPUT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss ZZ';
export const TIME_FORMAT = 'HH:mm:ss';

export const convertDate = (d: Date) => moment(d, INPUT_DATE_FORMAT);
