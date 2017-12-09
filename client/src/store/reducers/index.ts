import { combineReducers,Dispatch as ReduxDispatch } from 'redux';


import { routerReducer } from 'react-router-redux'

import { routerReducer as router, RouterState } from 'react-router-redux'

import trackItem from './trackItem/trackItemState';
import timeline from './timeline/timelineState';
import { ITrackItemState } from './trackItem/ITrackItemState';
import { ITimelineState } from './timeline/ITimelineState';


interface StoreEnhancerState { }

export interface RootState extends StoreEnhancerState {
    router: RouterState,
    trackItem: ITrackItemState,
    timeline: ITimelineState
}

export type Dispatch = ReduxDispatch<RootState>

const rootReducer = combineReducers({
  router,
  trackItem,
  timeline
});

export default rootReducer;
