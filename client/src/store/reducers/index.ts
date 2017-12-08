import { combineReducers } from 'redux';

import trackItem from './trackItem/trackItemState';

const rootReducer = combineReducers({
  trackItem,
});

export default rootReducer;
