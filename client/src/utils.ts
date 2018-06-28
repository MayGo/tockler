import moment from 'moment';

export const diffAndFormatShort = (beginDate, endDate) => {
    const diff = moment(new Date(endDate)).diff(moment(new Date(beginDate)));
    const dur = moment.duration(diff);
    let formattedDuration = dur.format();
    return formattedDuration;
};
