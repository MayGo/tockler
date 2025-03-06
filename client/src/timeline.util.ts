import { DateTime } from 'luxon';
import { ITimelineState } from './@types/ITimelineState';
import { ITrackItem } from './@types/ITrackItem';
import { TrackItemType } from './enum/TrackItemType';

interface TimeItemsPayload {
    appItems: ITrackItem[];
    logItems: ITrackItem[];
    statusItems: ITrackItem[];
}

// Simplified payload for tray view (without appItems)
export interface SimplifiedTimeItemsPayload {
    logItems: ITrackItem[];
    statusItems: ITrackItem[];
}

export const checkIfOneDay = (visibleTimerange: DateTime[]) => visibleTimerange[0].hasSame(visibleTimerange[1], 'day');

export const rangeToDate = (range: DateTime[]): [number, number] => {
    return [range[0].toMillis(), range[1].toMillis()];
};

export const addToTimelineItems = (state: ITimelineState, payload: TimeItemsPayload): ITimelineState => {
    const appIds = payload.appItems.map((item) => item.id);
    const logIds = payload.logItems.map((item) => item.id);
    const statusIds = payload.statusItems.map((item) => item.id);

    return {
        ...state,
        [TrackItemType.AppTrackItem]: [
            ...(state[TrackItemType.AppTrackItem] || []).filter((item) => !appIds.includes(item.id)),
            ...payload.appItems,
        ],
        [TrackItemType.LogTrackItem]: [
            ...(state[TrackItemType.LogTrackItem] || []).filter((item) => !logIds.includes(item.id)),
            ...payload.logItems,
        ],
        [TrackItemType.StatusTrackItem]: [
            ...(state[TrackItemType.StatusTrackItem] || []).filter((item) => !statusIds.includes(item.id)),
            ...payload.statusItems,
        ],
    };
};

// Simplified version for tray view (without appItems)
export const addToTimelineItemsSimplified = (
    state: ITimelineState,
    payload: SimplifiedTimeItemsPayload,
): ITimelineState => {
    const logIds = payload.logItems.map((item) => item.id);
    const statusIds = payload.statusItems.map((item) => item.id);

    return {
        ...state,
        [TrackItemType.LogTrackItem]: [
            ...(state[TrackItemType.LogTrackItem] || []).filter((item) => !logIds.includes(item.id)),
            ...payload.logItems,
        ],
        [TrackItemType.StatusTrackItem]: [
            ...(state[TrackItemType.StatusTrackItem] || []).filter((item) => !statusIds.includes(item.id)),
            ...payload.statusItems,
        ],
    };
};
