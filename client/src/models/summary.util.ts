import { TrackItemType } from '../enum/TrackItemType';
import { ITimelineState } from '../@types/ITimelineState';

export const handleItems = (
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
