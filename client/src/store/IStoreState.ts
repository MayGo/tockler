import {ITrackItemState} from './reducers/trackItem/ITrackItemState';
import { ITimelineState } from './reducers/timeline/ITimelineState';

export default interface IStoreState {
  router: any,
  trackItem: ITrackItemState;
  timeline: ITimelineState
};
