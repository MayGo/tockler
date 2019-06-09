import { ITimelineState } from './@types/ITimelineState';
import { TrackItemType } from './enum/TrackItemType';

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

export const addToTimelineItems = (state, payload): ITimelineState => {
    const appIds = payload.appItems.map(item => item.id);
    const logIds = payload.logItems.map(item => item.id);
    const statusIds = payload.statusItems.map(item => item.id);

    return {
        ...state,
        appItems: [
            ...state.appItems.filter(item => !appIds.includes(item.id)),
            ...payload.appItems,
        ],
        logItems: [
            ...state.logItems.filter(item => !logIds.includes(item.id)),
            ...payload.logItems,
        ],
        statusItems: [
            ...state.statusItems.filter(item => !statusIds.includes(item.id)),
            ...payload.statusItems,
        ],
    };
};
