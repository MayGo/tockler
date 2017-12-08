import { call, put, fork, cancelled } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { loadTrackItems } from '../reducers/trackItem/trackItemActions';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemService } from '../../services/TrackItemService';
import * as moment from 'moment';

function* bgSync() {
  const delayMs = 10000;
  try {
    while (true) {
      console.log('TrackItems delay')
    
      console.log('TrackItems loading')
        const trackItems:ITrackItem[]  = yield call(TrackItemService.findAllFromDay, moment().startOf('day').toDate(), 'AppTrackItem')
      yield put(loadTrackItems(trackItems));
   
      console.log('Loaded trackItems:', trackItems);
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
