import { call, put, fork, cancelled } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemService } from '../../services/TrackItemService';
import * as moment from 'moment';
import { loadTimelineItems } from '../reducers/timeline/timelineActions';

function* bgSync() {
  const delayMs = 100000;
  try {
    while (true) {
      console.log('Timeline delay')
    
      console.log('Timeline loading')
        const trackItems:ITrackItem[]  = yield call(TrackItemService.findAllFromDay, moment().startOf('day').toDate(), 'AppTrackItem')
      yield put(loadTimelineItems(trackItems));
   
      console.log('Loaded timeline:', trackItems);
      yield call(delay, delayMs);
    }
  } catch (err) {
    console.log(err)
    if (yield cancelled()) {
      console.info(' Sync canceled.');
    }
  }
}

function* main() {
  // starts the task in the background
  yield fork(bgSync);
}

// Bootstrap sagas
export default main;
