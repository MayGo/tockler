import { TrackItemType } from '../enum/TrackItemType';
import { ITrackItem } from '../@types/ITrackItem';
import { ITimelineState } from '../@types/ITimelineState';

export const handleTimelineItems = (
    state: ITimelineState,
    payload: {
        appTrackItems: object;
        logTrackItems: object;
        statusTrackItems: object;
    },
): ITimelineState => {
    return {
        ...state,
        [TrackItemType.AppTrackItem]: payload.appTrackItems,
        [TrackItemType.LogTrackItem]: payload.logTrackItems,
        [TrackItemType.StatusTrackItem]: payload.statusTrackItems,
    };
};

export const addToTimelineItems = (
    state: ITimelineState,
    payload: {
        appItems: ITrackItem[];
        logItems: ITrackItem[];
        statusItems: ITrackItem[];
    },
): ITimelineState => {
    return {
        ...state,
        [TrackItemType.AppTrackItem]: [...state[TrackItemType.AppTrackItem], ...payload.appItems],
        [TrackItemType.LogTrackItem]: [...state[TrackItemType.LogTrackItem], ...payload.logItems],
        [TrackItemType.StatusTrackItem]: [
            ...state[TrackItemType.StatusTrackItem],
            ...payload.statusItems,
        ],
    };
};
