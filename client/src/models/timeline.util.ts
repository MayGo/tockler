import { TrackItemType } from '../enum/TrackItemType';
import { ITrackItem } from '../@types/ITrackItem';
import { ITimelineState } from '../@types/ITimelineState';

export const handleTimelineItems = (
    state: ITimelineState,
    payload: {
        appItems: object;
        logItems: object;
        statusItems: object;
    },
): ITimelineState => {
    return {
        ...state,
        [TrackItemType.AppTrackItem]: payload.appItems,
        [TrackItemType.LogTrackItem]: payload.logItems,
        [TrackItemType.StatusTrackItem]: payload.statusItems,
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
    const appIds = payload.appItems.map(item => item.id);
    const logIds = payload.logItems.map(item => item.id);
    const statusIds = payload.statusItems.map(item => item.id);

    return {
        ...state,
        [TrackItemType.AppTrackItem]: [
            ...state[TrackItemType.AppTrackItem].filter(item => !appIds.includes(item.id)),
            ...payload.appItems,
        ],
        [TrackItemType.LogTrackItem]: [
            ...state[TrackItemType.LogTrackItem].filter(item => !logIds.includes(item.id)),
            ...payload.logItems,
        ],
        [TrackItemType.StatusTrackItem]: [
            ...state[TrackItemType.StatusTrackItem].filter(item => !statusIds.includes(item.id)),
            ...payload.statusItems,
        ],
    };
};
