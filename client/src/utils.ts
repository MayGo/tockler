import moment from 'moment';
import { convertDate } from './constants';

export const diffAndFormatShort = (beginDate, endDate) => {
    const diff = convertDate(endDate).diff(convertDate(beginDate));
    const dur = moment.duration(diff);
    const formattedDuration = dur.format();
    return formattedDuration;
};
