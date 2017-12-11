
import IBaseReducer from '../IBaseReducer';
import IUnknownAction from '../IUnknownAction';

import { TIMELINEITEMS__LOAD, TIMELINEITEMS__CHANGE_TIMERANGE } from './timelineActions';
import { ITimelineState } from './ITimelineState';
import { ITrackItem } from '../../../@types/ITrackItem';

import { TimeSeries, TimeRangeEvent, TimeRange } from 'pondjs';
import { TrackItemType } from '../../../enum/TrackItemType';

const trackItem: IBaseReducer<ITimelineState> = (
  state = { AppTrackItem: [], StatusTrackItem: [], timerange: [] },
  action = IUnknownAction,
) => {
  switch (action.type) {
    case TIMELINEITEMS__LOAD:
      return handleTimelineItems(state, action.payload);
      case TIMELINEITEMS__CHANGE_TIMERANGE:
      return handleChangeTimerange(state, action.payload);
    default:
      return state;
  }
};

const handleTimelineItems = (
  state: ITimelineState,
  payload: { trackItems: ITrackItem[], trackItemType: TrackItemType },
): ITimelineState => {

  const events = payload.trackItems.map(
    ({ beginDate, endDate, ...data }) =>
        new TimeRangeEvent(
            new TimeRange(new Date(beginDate), new Date(endDate)),
            data,
        ),
  );
  const trackItemSeries = new TimeSeries({ name: 'outages', events });
  const timerange = trackItemSeries.timerange()

  return {
    ...state,
    [payload.trackItemType]: trackItemSeries,
    timerange,
  };
};

const handleChangeTimerange = (
  state: ITimelineState,
  payload: { timerange: any},
): ITimelineState => {
  return {
    ...state,
    timerange: payload.timerange,
  };
};

export default trackItem;
