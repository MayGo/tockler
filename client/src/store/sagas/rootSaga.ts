import { fork } from 'redux-saga/effects';

import trackItemSaga from './trackItemSaga';

const sagas = [trackItemSaga];

export default function* root() {
  yield sagas.map(saga => fork(saga));
}
