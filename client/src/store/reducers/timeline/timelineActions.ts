import IBaseAction from '../IBaseAction';
//import { ITrackItem } from '../../../@types/ITrackItem';


export const TIMELINEITEMS__LOAD = 'TIMELINEITEM/LOAD';

export const loadTimelineItems = (timelineItems: any[]): IBaseAction => ({
  type: TIMELINEITEMS__LOAD,
  payload: {
    timelineItems,
  },
});

