import moment from 'moment';

import { delay } from 'dva/saga';
import { TrackItemService } from '../services/TrackItemService';
import { EventEmitter } from '../services/EventEmitter';
import { routerRedux } from 'dva/router';

const gotoSettingsPageFn = dispatch => () => {
    console.log('Navigating to settings page');
    dispatch(
        routerRedux.push({
            pathname: '/app/settings',
        }),
    );
};

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
            console.error('BG SYNC DISABLED');

            const beginDate = moment().startOf('day');
            const endDate = moment().endOf('day');

            const timerange = [beginDate, endDate];
            dispatch({
                type: 'loadTimerange',
                payload: { timerange },
            });
            const gotoSettingsPage = gotoSettingsPageFn(dispatch);
            EventEmitter.on('side:preferences', gotoSettingsPage);

            return () => {
                console.info('Clearing eventEmitter');
                EventEmitter.off('side:preferences', gotoSettingsPage);
            };
        },
    },

    effects: {
        *bgSync(action: any, { call, put, select }: any) {
            const delayMs = 30000;
            let lastRequestTime = moment();
            while (true) {
                try {
                    yield call(delay, delayMs);
                    // const isFocused = yield select(state => state.root.isFocused);
                    console.log('Watching track changes:', lastRequestTime);
                    const requestFrom = lastRequestTime;
                    lastRequestTime = moment();
                    console.log('Requesting from:', requestFrom);
                    const { appItems, statusItems, logItems } = yield call(
                        TrackItemService.findAllItems,
                        requestFrom,
                        moment(lastRequestTime).add(1, 'days'),
                    );
                    console.log('Returned updated items:', appItems);
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
