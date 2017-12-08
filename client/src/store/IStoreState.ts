import {ITrackItemState} from './reducers/trackItem/ITrackItemState';

export default interface IStoreState {
  routing:any,
  trackItem: ITrackItemState;
};
