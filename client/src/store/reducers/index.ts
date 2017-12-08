import { combineReducers } from 'redux';


import { routerReducer } from 'react-router-redux'
import trackItem from './trackItem/trackItemState';

const rootReducer = combineReducers({
  routing:routerReducer,
  trackItem,
});

export default rootReducer;
