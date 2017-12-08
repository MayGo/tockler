
import IBaseReducer from '../IBaseReducer';
import IUnknownAction from '../IUnknownAction';

import { ITrackItemState } from './ITrackItemState';
import { ITrackItem } from '../../../@types/ITrackItem';
import { TRACKITEMS__LOAD } from './trackItemActions';

const trackItem: IBaseReducer<ITrackItemState> = (
  state = { all: [] },
  action = IUnknownAction,
) => {
  switch (action.type) {
    case TRACKITEMS__LOAD:
      return handleAddAll(state, action.payload);
    default:
      return state;
  }
};

const handleAddAll = (
  state: ITrackItemState,
  payload: { trackItems: ITrackItem[] },
): ITrackItemState => {
  return {
    ...state,
    all: payload.trackItems,
  };
};

export default trackItem;
