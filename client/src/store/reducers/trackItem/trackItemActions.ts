import IBaseAction from '../IBaseAction';
import { ITrackItem } from '../../../@types/ITrackItem';

export const TRACKITEMS__LOAD = 'TRACKITEM/LOAD';

export const loadTrackItems = (trackItems: ITrackItem[]): IBaseAction => ({
  type: TRACKITEMS__LOAD,
  payload: {
    trackItems,
  },
});
