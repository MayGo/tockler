import { combineReducers } from 'redux';


import { routerReducer } from 'react-router-redux'
import trackItem from './trackItem/trackItemState';
import timeline from './timeline/timelineState';

const rootReducer = combineReducers({
  routing:routerReducer,
  trackItem,
  timeline
});

export default rootReducer;
