
import IBaseReducer from '../IBaseReducer';
import IUnknownAction from '../IUnknownAction';

//import { ITrackItem } from '../../../@types/ITrackItem';
import { TIMELINEITEMS__LOAD, TIMELINEITEMS__CHANGE_TIMERANGE } from './timelineActions';
import { ITimelineState } from './ITimelineState';

const trackItem: IBaseReducer<ITimelineState> = (
  state = { series: [], timerange:[] },
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
  payload: { series: any[], timerange:any[] },
): ITimelineState => {
  return {
    ...state,
    series: payload.series,
    timerange: payload.timerange,
  };
};

const handleChangeTimerange = (
  state: ITimelineState,
  payload: { timerange:any},
): ITimelineState => {
  return {
    ...state,
    timerange: payload.timerange,
  };
};

export default trackItem;
