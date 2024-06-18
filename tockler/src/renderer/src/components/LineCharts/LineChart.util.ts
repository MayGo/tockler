import { dayjs } from '@renderer/dayjs.config';

import { convertDate } from '../../constants';
import { toInteger } from 'lodash';

export const generateTickValues = (date, ticks, unit, startOf) => {
    const day = convertDate(date).startOf(startOf);
    const dates = [...Array(ticks)].map((__, i) => {
        return day.clone().add(i, unit);
    });

    return dates;
};

export const toTimeDuration = (from, to) => {
    const start = dayjs(from).startOf('day');

    return dayjs(dayjs(to).diff(start));
};
export const addToTimeDuration = (from, duration) => {
    const start = dayjs(from).startOf('day');

    return dayjs(dayjs(from).diff(start) + duration);
};

export const isOddHour = (date) => dayjs(date).get('hour') % 2;

export const formatToTime = (t) => dayjs(t).format('HH:mm');

export const formatToTimeEveryOther = (t) => {
    const hour = dayjs(t).startOf('hour');
    return formatToTime(hour);
};

export const formatToHours = (max) => (t) => {
    const hour = dayjs.duration(t * max).hours();
    return `${hour} h`;
};

export const formatToDay = (t) => toInteger(t.format('DD'));
export const dateToDayLabel = (short) => (date) => {
    return dayjs(date).format(short ? 'DD' : 'DD ddd');
};

export const timeTickValues = (t) => {
    const ticks = 36;
    const day = dayjs();
    const dates = [...Array(ticks)].map((__, i) => {
        return toTimeDuration(day, day.clone().add(i, 'hour'));
    });

    return dates;
};

export const dayTickValues = (t) => generateTickValues(t, 31, 'day', 'month');
