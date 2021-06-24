import dateFormat from 'date-fns/format';

export { weekdayLabelFormat as weekdayLabelFormatFn } from '@datepicker-react/hooks';

export const weekdayLabelFormatLong = (date: Date) => dateFormat(date, 'EEEE');

export const dayLabelFormatFn = (date: Date) => dateFormat(date, 'd');
export const monthLabelFormatFn = (date: Date) => dateFormat(date, 'MMMM');

export const defaultDisplayFormat = 'MM/dd/yyyy';
