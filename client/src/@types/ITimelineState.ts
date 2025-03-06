import { DateTime } from 'luxon';
import { ITrackItem } from './ITrackItem';

export interface ITimelineState {
    AppTrackItem?: ITrackItem[] | null;
    StatusTrackItem: ITrackItem[] | null;
    LogTrackItem: ITrackItem[] | null;
    timerange: DateTime[] | null;
}
