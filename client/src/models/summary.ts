import * as moment from 'moment';
import { TrackItemService } from '../services/TrackItemService';
import { handleItems } from './summary.util';

export const summaryModel: any = {
    namespace: 'summary',
    state: {
        AppTrackItem: [],
        StatusTrackItem: [],
        LogTrackItem: [],
        selectedDate: moment(),
    },

    subscriptions: {
        setup({ dispatch }: any) {
            console.log('Summary data setup');

            dispatch({
                type: 'loadSummary',
                payload: { selectedDate: moment() },
            });
        },
    },

    effects: {
        *changeSelectedDate({ payload: { selectedDate } }: any, { call, put }: any) {
            console.log('selectedDate changed:', selectedDate);
            yield put({
                type: 'setSelectedDate',
                payload: { selectedDate },
            });
        },

        *loadSummary({ payload: { selectedDate } }: any, { call, put }: any) {
            console.log('Change selectedDate:', selectedDate);
            const beginDate = moment(selectedDate)
                .startOf('month')
                .toDate();
            const endDate = moment(selectedDate)
                .endOf('month')
                .toDate();

            const { appItems, statusItems, logItems } = yield call(
                TrackItemService.findAllItems,
                beginDate,
                endDate,
            );

            yield put({
                type: 'loadItems',
                payload: {
                    logTrackItems: logItems,
                    statusTrackItems: statusItems,
                    appTrackItems: appItems,
                },
            });
            yield put({
                type: 'setSelectedDate',
                payload: { selectedDate },
            });
        },
    },
    reducers: {
        loadItems(state: any, { payload }: any) {
            return handleItems(state, payload);
        },

        setSelectedDate(state: any, { payload: { selectedDate } }: any) {
            return {
                ...state,
                selectedDate,
            };
        },
    },
};
