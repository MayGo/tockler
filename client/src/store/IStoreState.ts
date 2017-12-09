import {ITrackItemState} from './reducers/trackItem/ITrackItemState';
import { ITimelineState } from './reducers/timeline/ITimelineState';

export default interface IStoreState {
  routing:any,
  trackItem: ITrackItemState;
  timeline: ITimelineState
};
