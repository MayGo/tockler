
import IBaseReducer from '../IBaseReducer';
import IUnknownAction from '../IUnknownAction';

//import { ITrackItem } from '../../../@types/ITrackItem';
import { TIMELINEITEMS__LOAD } from './timelineActions';
import { ITimelineState } from './ITimelineState';

const trackItem: IBaseReducer<ITimelineState> = (
  state = { all: [] },
  action = IUnknownAction,
) => {
  switch (action.type) {
    case TIMELINEITEMS__LOAD:
      return handleTimelineItems(state, action.payload);
    default:
      return state;
  }
};

const handleTimelineItems = (
  state: ITimelineState,
  payload: { timelineItems: any[] },
): ITimelineState => {
  return {
    ...state,
    all: payload.timelineItems,
  };
};

export default trackItem;
