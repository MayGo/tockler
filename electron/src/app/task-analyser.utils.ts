import { TrackItemType } from '../enums/track-item-type';

export interface TrackItemRaw {
    app?: string;
    taskName?: TrackItemType;
    title?: string;
    color?: string;
    beginDate?: number;
    endDate?: number;
    url?: string;
}
