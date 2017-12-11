import IBaseAction from '../IBaseAction';
import { ITrackItem } from '../../../@types/ITrackItem';
import { TrackItemType } from '../../../enum/TrackItemType';
//import { ITrackItem } from '../../../@types/ITrackItem';


export const TIMELINEITEMS__LOAD = 'TIMELINEITEM/LOAD';
export const TIMELINEITEMS__CHANGE_TIMERANGE = 'TIMELINEITEM/CHANGE/TIMERANGE';

export const loadTimelineItems = (trackItems: ITrackItem[], trackItemType:TrackItemType): IBaseAction => ({
  type: TIMELINEITEMS__LOAD,
  payload: {
    trackItems,
    trackItemType
  },
});
export const changeTimerange = (timerange:any): IBaseAction => ({
  type: TIMELINEITEMS__CHANGE_TIMERANGE,
  payload: {
    timerange,
  },
});


