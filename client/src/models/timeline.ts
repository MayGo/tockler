import moment from 'moment';
import { TrackItemService } from '../services/TrackItemService';
import { AppSettingService } from '../services/AppSettingService';
import { handleTimelineItems, addToTimelineItems } from './timeline.util';
import { TimelineRowType } from '../enum/TimelineRowType';

export const timelineModel: any = {
    namespace: 'timeline',
    state: {
        isRowEnabled: {
            [TimelineRowType.App]: true,
            [TimelineRowType.Log]: true,
            [TimelineRowType.Status]: true,
        },
        AppTrackItem: [],
        StatusTrackItem: [],
        LogTrackItem: [],
        timerange: [moment().subtract(1, 'days'), moment()],
        visibleTimerange: [moment().subtract(1, 'hour'), moment()],
        selectedTimelineItem: null,
    },

    subscriptions: {
        setup({ dispatch }: any) {
            console.log('Timeline data setup');

            const beginDate = moment().startOf('day');

            const endDate = moment().endOf('day');

            dispatch({
                type: 'loadTimerange',
                payload: { timerange: [beginDate, endDate] },
            });
        },
    },

    effects: {
        *changeVisibleTimerange({ payload: { visibleTimerange } }: any, { call, put }: any) {
            console.log('Visible timerange changed:', visibleTimerange);
            yield put({
                type: 'setVisibleTimerange',
                payload: { visibleTimerange },
            });
        },
    },
    reducers: {
        loadTimelineItems(state: any, { payload }: any) {
            return handleTimelineItems(state, payload);
        },

        addToTimeline(state: any, { payload }: any) {
            console.log('Add to timeline:', payload);
            return addToTimelineItems(state, payload);
        },
        setTimerange(state: any, { payload: { timerange } }: any) {
            return {
                ...state,
                timerange,
            };
        },
        setVisibleTimerange(state: any, { payload: { visibleTimerange } }: any) {
            return {
                ...state,
                visibleTimerange,
            };
        },
        selectTimelineItem(state: any, { payload: { item } }: any) {
            if (item) {
                console.log('Selected timeline item:', item);
            } else {
                console.log('Deselected timeline item');
            }

            return {
                ...state,
                selectedTimelineItem: item,
            };
        },

        toggleRow(state: any, { payload: { rowId } }: any) {
            return {
                ...state,
                isRowEnabled: { ...state.isRowEnabled, [rowId]: !state.isRowEnabled[rowId] },
            };
        },
    },
};
