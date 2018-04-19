import * as moment from 'moment';
import { TimeRange } from 'pondjs';
import { delay } from 'dva/saga';
import { TrackItemService } from '../services/TrackItemService';

export const rootModel: any = {
    namespace: 'root',
    state: {
        isFocused: true,
    },
    subscriptions: {
        setup({ dispatch }: any) {
            console.log('ROOT  setup');
            window.onfocus = function() {
                console.log('focused');
                dispatch({ type: 'setFocused', payload: { isFocused: true } });
            };

            window.onblur = function() {
                console.log('blur');
                dispatch({ type: 'setFocused', payload: { isFocused: false } });
            };
            // dispatch({ type: 'bgSync' });

            const beginDate = moment().startOf('day');
            const endDate = moment().endOf('day');
            dispatch({
                type: 'loadTimerange',
                payload: { timerange: new TimeRange(beginDate, endDate) },
            });
        },
    },

    effects: {
        *bgSync(action: any, { call, put, select }: any) {
            const delayMs = 10000;
            let lastRequestTime = moment();
            while (true) {
                try {
                    yield call(delay, delayMs);
                    // const isFocused = yield select(state => state.root.isFocused);
                    console.log('Watching track changes:', lastRequestTime);
                    const requestFrom = lastRequestTime.toDate();
                    lastRequestTime = moment();
                    console.log('Requesting from:', requestFrom);
                    const { appItems, statusItems, logItems } = yield call(
                        TrackItemService.findAllItems,
                        requestFrom,
                        moment(lastRequestTime)
                            .add(1, 'days')
                            .toDate(),
                    );
                    console.log(appItems);
                    yield put({
                        type: 'timeline/addToTimeline',
                        payload: {
                            logItems,
                            statusItems,
                            appItems,
                        },
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        },
    },
    reducers: {
        setFocused(state: any, { payload: { isFocused } }: any) {
            return {
                ...state,
                isFocused,
            };
        },
    },
};
