import { formatDuration, intervalToDuration } from 'date-fns';
import { convertDate } from './constants';
import { TrackItemType } from './enum/TrackItemType';

export const diffAndFormatShort = (beginDate: number, endDate: number) => {
    const diff = convertDate(endDate).diff(convertDate(beginDate));
    const duration = intervalToDuration({ start: 0, end: diff.toMillis() });
    return formatDuration(duration);
};

export const formatDurationInternal = (dur: number) => {
    const formattedDuration = formatDuration(intervalToDuration({ start: 0, end: dur }), { zero: false });

    return formattedDuration
        .replace(/ minutes?/g, 'm')
        .replace(/ hours?/g, 'h')
        .replace(/ seconds?/g, 's');
};

export const ITEM_TYPES = {
    [TrackItemType.AppTrackItem]: 'App',
    [TrackItemType.StatusTrackItem]: 'Status',
    [TrackItemType.LogTrackItem]: 'Task',
};
