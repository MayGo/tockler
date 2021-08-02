import moment from 'moment';
import { convertDate } from './constants';
import { TrackItemType } from './enum/TrackItemType';

export const diffAndFormatShort = (beginDate, endDate) => {
    const diff = convertDate(endDate).diff(convertDate(beginDate));
    const dur = moment.duration(diff);
    const formattedDuration = dur.format();
    return formattedDuration;
};

export const ITEM_TYPES = {
    [TrackItemType.AppTrackItem]: 'App',
    [TrackItemType.StatusTrackItem]: 'Status',
    [TrackItemType.LogTrackItem]: 'Task',
};
