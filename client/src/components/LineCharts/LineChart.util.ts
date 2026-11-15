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

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Tick positions (as 0..1 fractions of `max` ms) on round hours, or round minutes when `max` is under an hour,
 * about five of them.
 */
export const onlineAxisTicks = (max: number): number[] => {
    if (!(max > 0)) {
        return [];
    }
    const unit = max < HOUR_MS ? MINUTE_MS : HOUR_MS;
    const steps = [1, 2, 5, 10, 15, 30, 60].map((n) => n * unit);
    const step = steps.find((s) => max / s <= 5) ?? steps[steps.length - 1];
    const ticks: number[] = [];
    for (let value = step; value <= max; value += step) {
        ticks.push(value / max);
    }
    return ticks;
};

/**
 * Axis label for a 0..1 tick scaled by `max` ms. Uses minutes below an hour so short days still get labels.
 * (date-fns' intervalToDuration omits zero units, so `hours` alone is undefined below one hour.)
 */
export const formatToHours = (max: number) => (t: number) => {
    if (!(max > 0)) {
        return '';
    }
    const ms = t * max;
    if (max < HOUR_MS) {
        return `${Math.round(ms / MINUTE_MS)} m`;
    }
    return `${Math.round((ms / HOUR_MS) * 10) / 10} h`;
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
