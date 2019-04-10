import moment from 'moment';
import { TrackItemService } from '../services/TrackItemService';
import { AppSettingService } from '../services/AppSettingService';
import { handleTimelineItems, addToTimelineItems } from './timeline.util';
import { TimelineRowType } from '../enum/TimelineRowType';

export const timelineModel: any = {
    namespace: 'timeline',
    state: {
        isRowEnabled: {
            [TimelineRowType.App]: false,
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

        *saveTimelineItem({ payload: { item, colorScope } }: any, { call, put, select }: any) {
            console.log('Updating color for trackItem', item, colorScope);
            if (colorScope === 'ALL_ITEMS') {
                yield AppSettingService.changeColorForApp(item.app, item.color);
                yield TrackItemService.updateColorForApp(item.app, item.color);
            } else if (colorScope === 'NEW_ITEMS') {
                yield AppSettingService.changeColorForApp(item.app, item.color);
                yield TrackItemService.saveTrackItem(item);
            } else {
                yield TrackItemService.saveTrackItem(item);
            }

            yield put({
                type: 'selectTimelineItem',
                payload: { item: null },
            });
            const timerange = yield select(state => state.timeline.timerange);
            yield put({
                type: 'loadTimerange',
                payload: { timerange },
            });
        },

        *deleteTimelineItem({ payload: { item } }: any, { call, put, select }: any) {
            console.log('Delete timeline item', item);

            if (item.id) {
                yield TrackItemService.deleteById(item.id);
                yield put({
                    type: 'selectTimelineItem',
                    payload: { item: null },
                });
                const timerange = yield select(state => state.timeline.timerange);
                yield put({
                    type: 'loadTimerange',
                    payload: { timerange },
                });
            } else {
                console.error('No id, not deleting from DB');
            }
        },
        *loadTimerange({ payload: { timerange } }: any, { call, put }: any) {
            console.log('Change timerange:', timerange);

            const { appItems, statusItems, logItems } = yield call(
                TrackItemService.findAllItems,
                timerange[0],
                timerange[1],
            );

            yield put({
                type: 'loadTimelineItems',
                payload: {
                    logTrackItems: logItems,
                    statusTrackItems: statusItems,
                    appTrackItems: appItems,
                },
            });
            yield put({
                type: 'setTimerange',
                payload: { timerange },
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
