import { intervalToDuration } from 'date-fns';
import { toInteger } from 'lodash';
import { DateTime } from 'luxon';
import { convertDate } from '../../constants';

export const generateTickValues = (date, ticks, unit, startOf) => {
    const day = convertDate(date).startOf(startOf);
    const dates = [...Array(ticks)].map((__, i) => {
        return day.plus({ [unit]: i });
    });

    return dates;
};

export const toTimeDuration = (from, to) => {
    const start = DateTime.fromJSDate(from).startOf('day');
    return DateTime.fromJSDate(to).diff(start);
};

export const addToTimeDuration = (from, duration) => {
    const start = DateTime.fromJSDate(from).startOf('day');
    return DateTime.fromJSDate(from).diff(start).plus(duration);
};

export const isOddHour = (date) => DateTime.fromJSDate(date).hour % 2;

export const formatToTime = (t: number) => DateTime.fromMillis(t).toFormat('HH:mm');

export const formatToTimeEveryOther = (t: number) => {
    const hour = DateTime.fromMillis(t).startOf('hour');
    return formatToTime(hour.toMillis());
};

export const toHours = (t: number) => {
    const duration = intervalToDuration({ start: 0, end: t });
    return duration.hours ?? 0;
};

export const formatToHours = (max: number) => (t: number) => {
    const duration = intervalToDuration({ start: 0, end: t * max });
    return `${duration.hours} h`;
};

export const formatToDay = (t: DateTime) => toInteger(t.toFormat('dd'));

export const dateToDayLabel = (short) => (date) => {
    return DateTime.fromJSDate(date).toFormat(short ? 'dd' : 'dd ccc');
};

export const timeTickValues = () => {
    const ticks = 36;
    const day = DateTime.now();
    const dates = [...Array(ticks)].map((__, i) => {
        return toTimeDuration(day.toJSDate(), day.plus({ hours: i }).toJSDate());
    });

    return dates;
};

export const dayTickValues = (t) => generateTickValues(t, 31, 'day', 'month');
