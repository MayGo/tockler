import * as moment from 'moment';
import { TimeSeries, TimeRangeEvent, TimeRange } from 'pondjs';
import { TrackItemService } from '../services/TrackItemService';
import { AppSettingService } from '../services/AppSettingService';
import { TrackItemType } from '../enum/TrackItemType';
import { ITrackItem } from '../@types/ITrackItem';
import { ITimelineState } from '../@types/ITimelineState';

const createSeries = (name, items) => {
    const events = items.map(
        ({ beginDate, endDate, ...data }) =>
            new TimeRangeEvent(new TimeRange(new Date(beginDate), new Date(endDate)), data),
    );
    const trackItemSeries = new TimeSeries({ name, events });
    return trackItemSeries;
};

const addToSeries = (store, name, items) => {
    const ids = items.map(item => item.id);
    console.log('IDS', ids);

    const newEvents = items.map(
        ({ beginDate, endDate, ...data }) =>
            new TimeRangeEvent(new TimeRange(new Date(beginDate), new Date(endDate)), data),
    );
    const newSeries = new TimeSeries({ name, events: newEvents });
    const series = store[name];

    const trackItemSeries = TimeSeries.timeSeriesListMerge({
        name,
        seriesList: [series, newSeries],
    });
    return trackItemSeries;
};

const handleTimelineItems = (
    state: ITimelineState,
    payload: {
        appTrackItems: object;
        logTrackItems: object;
        statusTrackItems: object;
    },
): ITimelineState => {
    return {
        ...state,
        [TrackItemType.AppTrackItem]: createSeries(
            TrackItemType.AppTrackItem,
            payload.appTrackItems,
        ),
        [TrackItemType.LogTrackItem]: createSeries(
            TrackItemType.LogTrackItem,
            payload.logTrackItems,
        ),
        [TrackItemType.StatusTrackItem]: createSeries(
            TrackItemType.StatusTrackItem,
            payload.statusTrackItems,
        ),
    };
};

const addToTimelineItems = (
    state: ITimelineState,
    payload: {
        appItems: ITrackItem[];
        logItems: ITrackItem[];
        statusItems: ITrackItem[];
    },
): ITimelineState => {
    return {
        ...state,
        [TrackItemType.AppTrackItem]: addToSeries(
            state,
            TrackItemType.AppTrackItem,
            payload.appItems,
        ),
        [TrackItemType.LogTrackItem]: addToSeries(
            state,
            TrackItemType.LogTrackItem,
            payload.logItems,
        ),
        [TrackItemType.StatusTrackItem]: addToSeries(
            state,
            TrackItemType.StatusTrackItem,
            payload.statusItems,
        ),
    };
};

export const timelineModel: any = {
    namespace: 'timeline',
    state: {
        AppTrackItem: new TimeSeries({ name: 'AppTrackItem', events: [] }),
        StatusTrackItem: new TimeSeries({ name: 'StatusTrackItem', events: [] }),
        LogTrackItem: new TimeSeries({ name: 'LogTrackItem', events: [] }),
        timerange: new TimeRange(
            moment()
                .subtract(1, 'days')
                .toDate(),
            new Date(),
        ),
        visibleTimerange: new TimeRange(
            moment()
                .subtract(1, 'hour')
                .toDate(),
            new Date(),
        ),
        selectedTimelineItem: null,
    },
    subscriptions: {
        setup({ dispatch }: any) {
            console.log('Timeline data setup');
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
        *loadTimerange({ payload: { timerange } }: any, { call, put }: any) {
            console.log('Change timerange:', timerange);

            const { appItems, statusItems, logItems } = yield call(
                TrackItemService.findAllItems,
                timerange.begin(),
                timerange.end(),
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
                console.log('Selected timeline item:', item.data().toJS());
            } else {
                console.log('Deselected timeline item');
            }

            return {
                ...state,
                selectedTimelineItem: item,
            };
        },
    },
};
