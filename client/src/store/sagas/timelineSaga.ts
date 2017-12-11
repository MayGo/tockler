import { call, put, fork, cancelled } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemService } from '../../services/TrackItemService';
import * as moment from 'moment';
import { loadTimelineItems } from '../reducers/timeline/timelineActions';
import { TrackItemType } from '../../enum/TrackItemType';

function* bgSync() {
  const delayMs = 100000;
  try {
    while (true) {
      console.log('Timeline loading')
      const day = moment().startOf('day').toDate();

      let trackItems:ITrackItem[]  = yield call(TrackItemService.findAllFromDay, day, TrackItemType.AppTrackItem)
      yield put(loadTimelineItems(trackItems, TrackItemType.AppTrackItem));

      trackItems = yield call(TrackItemService.findAllFromDay, day, TrackItemType.StatusTrackItem)
      yield put(loadTimelineItems(trackItems, TrackItemType.StatusTrackItem));
   
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
