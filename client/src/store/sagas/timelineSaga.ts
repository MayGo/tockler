import { call, put, fork, cancelled } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemService } from '../../services/TrackItemService';
import * as moment from 'moment';
import { loadTimelineItems } from '../reducers/timeline/timelineActions';
import { TimeSeries, TimeRangeEvent, TimeRange } from 'pondjs';

function* bgSync() {
  const delayMs = 100000;
  try {
    while (true) {
      console.log('Timeline delay')
    
      console.log('Timeline loading')
        const trackItems:ITrackItem[]  = yield call(TrackItemService.findAllFromDay, moment().startOf('day').toDate(), 'AppTrackItem')
        const events = trackItems.map(
          ({ beginDate, endDate, ...data }) =>
              new TimeRangeEvent(
                  new TimeRange(new Date(beginDate), new Date(endDate)),
                  data
              )
      );
      const series = new TimeSeries({ name: 'outages', events });
      yield put(loadTimelineItems(series, series.timerange()));
   
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
