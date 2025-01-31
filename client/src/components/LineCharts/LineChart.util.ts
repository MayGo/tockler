import moment from 'moment';
import { convertDate } from '../../constants';
import { toInteger } from 'lodash';
import { intervalToDuration } from 'date-fns';

export const generateTickValues = (date, ticks, unit, startOf) => {
    const day = convertDate(date).startOf(startOf);
    const dates = [...Array(ticks)].map((__, i) => {
        return day.clone().add(i, unit);
    });

    return dates;
};

export const toTimeDuration = (from, to) => {
    const start = moment(from).startOf('day');

    return moment(moment(to).diff(start));
};
export const addToTimeDuration = (from, duration) => {
    const start = moment(from).startOf('day');

    return moment(moment(from).diff(start) + duration);
};

export const isOddHour = (date) => moment(date).get('hour') % 2;

export const formatToTime = (t) => moment(t).format('HH:mm');

export const formatToTimeEveryOther = (t) => {
    const hour = moment(t).startOf('hour');
    return formatToTime(hour);
};

export const formatToHours = (max) => (t) => {
    const duration = intervalToDuration({ start: 0, end: t * max });
    return `${duration.hours} h`;
};

export const formatToDay = (t) => toInteger(t.format('DD'));
export const dateToDayLabel = (short) => (date) => {
    return moment(date).format(short ? 'DD' : 'DD ddd');
};

export const timeTickValues = () => {
    const ticks = 36;
    const day = moment();
    const dates = [...Array(ticks)].map((__, i) => {
        return toTimeDuration(day, day.clone().add(i, 'hour'));
    });

    return dates;
};

export const dayTickValues = (t) => generateTickValues(t, 31, 'day', 'month');
