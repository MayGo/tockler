import IBaseAction from '../IBaseAction';
//import { ITrackItem } from '../../../@types/ITrackItem';


export const TIMELINEITEMS__LOAD = 'TIMELINEITEM/LOAD';
export const TIMELINEITEMS__CHANGE_TIMERANGE = 'TIMELINEITEM/CHANGE/TIMERANGE';

export const loadTimelineItems = (series: any[], timerange:any[]): IBaseAction => ({
  type: TIMELINEITEMS__LOAD,
  payload: {
    series,
    timerange,
  },
});
export const changeTimerange = (timerange:any): IBaseAction => ({
  type: TIMELINEITEMS__CHANGE_TIMERANGE,
  payload: {
    timerange,
  },
});


