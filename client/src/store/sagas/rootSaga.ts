import { fork } from 'redux-saga/effects';

import trackItemSaga from './trackItemSaga';
import timelineSaga from './timelineSaga';

const sagas = [trackItemSaga, timelineSaga];

export default function* root() {
  yield sagas.map(saga => fork(saga));
}
