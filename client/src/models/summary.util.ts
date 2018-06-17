import { TrackItemType } from '../enum/TrackItemType';
import { ITrackItem } from '../@types/ITrackItem';
import { ITimelineState } from '../@types/ITimelineState';

export const handleItems = (
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
