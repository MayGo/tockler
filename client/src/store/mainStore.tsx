import { createStore, Action, action, Thunk, thunk, thunkOn, ThunkOn } from 'easy-peasy';
import moment, { Moment } from 'moment';
import { ITrackItem } from '../@types/ITrackItem';
import { getTodayTimerange, getCenteredTimerange, setDayFromTimerange } from '../components/Timeline/timeline.utils';
import { Logger } from '../logger';
import { findAllDayItemsForEveryTrack } from '../services/trackItem.api';
import { addToTimelineItems } from '../timeline.util';

const emptyTimeItems = {
    appItems: [],
    logItems: [],
    statusItems: [],
};

const defaultTimerange = getTodayTimerange();
const defaultVisibleTimerange = getCenteredTimerange(
    defaultTimerange,
    [moment().subtract(1, 'hour'), moment().add(1, 'hour')],
    moment(),
);

export const TIMERANGE_MODE_TODAY = 'TODAY';

export interface StoreModel {
    selectedTimelineItem: null | ITrackItem;
    setSelectedTimelineItem: Action<StoreModel, ITrackItem | null>;

    liveView: boolean;
    setLiveView: Action<StoreModel, boolean>;

    isLoading: boolean;
    setIsLoading: Action<StoreModel, boolean>;

    timerange: Moment[];
    setTimerange: Action<StoreModel, Moment[]>;

    visibleTimerange: Moment[];
    setVisibleTimerange: Action<StoreModel, Moment[]>;

    timerangeMode: string | null;
    setTimerangeMode: Action<StoreModel, string | null>;

    lastRequestTime: Moment;
    setLastRequestTime: Action<StoreModel, Moment>;

    timeItems: any;
    setTimeItems: Action<StoreModel, any>;

    onSetTimerange: ThunkOn<StoreModel>;

    fetchTimerange: Thunk<StoreModel>;

    loadTimerange: Thunk<StoreModel, Moment[]>;

    bgSync: Thunk<StoreModel, Moment>;
    bgSyncInterval: Thunk<StoreModel>;
}

const mainStore = createStore<StoreModel>({
    selectedTimelineItem: null,
    setSelectedTimelineItem: action((state, payload) => {
        state.selectedTimelineItem = payload;
    }),

    liveView: true,
    setLiveView: action((state, payload) => {
        state.liveView = payload;
    }),

    isLoading: false,
    setIsLoading: action((state, payload) => {
        state.isLoading = payload;
    }),

    timerange: defaultTimerange,
    setTimerange: action((state, payload) => {
        state.timerange = payload;
    }),

    visibleTimerange: defaultVisibleTimerange,
    setVisibleTimerange: action((state, payload) => {
        state.visibleTimerange = payload;
    }),

    timerangeMode: TIMERANGE_MODE_TODAY,
    setTimerangeMode: action((state, payload) => {
        state.timerangeMode = payload;
    }),

    lastRequestTime: moment(),
    setLastRequestTime: action((state, payload) => {
        state.lastRequestTime = payload;
    }),

    timeItems: emptyTimeItems,
    setTimeItems: action((state, payload) => {
        state.timeItems = payload;
    }),

    onSetTimerange: thunkOn(
        (actions) => actions.setTimerange,
        async (actions) => {
            actions.fetchTimerange();
        },
    ),

    fetchTimerange: thunk(async (actions, _, { getState }) => {
        const { timerange, visibleTimerange } = getState();
        Logger.debug('Loading timerange:', JSON.stringify(timerange));
        actions.setIsLoading(true);
        const { appItems, statusItems, logItems } = await findAllDayItemsForEveryTrack(timerange[0], timerange[1]);

        actions.setTimeItems({ appItems, statusItems, logItems });
        actions.setVisibleTimerange(setDayFromTimerange(visibleTimerange, timerange));
        actions.setIsLoading(false);
    }),
    loadTimerange: thunk(async (actions, range) => {
        let mode;
        if (moment().isBetween(range[0], range[1])) {
            mode = TIMERANGE_MODE_TODAY;
        }
        Logger.debug('loadTimerange:', JSON.stringify(range));

        actions.setTimerange(range);
        actions.setTimerangeMode(mode);
    }),
    bgSync: thunk(async (actions, requestFrom, { getState }) => {
        Logger.debug('Requesting from:', JSON.stringify(requestFrom));
        const { timeItems } = getState();
        const { appItems, statusItems, logItems } = await findAllDayItemsForEveryTrack(
            requestFrom,
            moment(requestFrom).add(1, 'days'),
        );
        Logger.debug('Returned updated items:', appItems);

        actions.setTimeItems(addToTimelineItems(timeItems, { appItems, statusItems, logItems }));
    }),
    bgSyncInterval: thunk(async (actions, _, { getState }) => {
        const { isLoading, timerange, visibleTimerange, timerangeMode, lastRequestTime, liveView } = getState();
        if (!isLoading) {
            if (timerangeMode === TIMERANGE_MODE_TODAY && liveView) {
                actions.bgSync(lastRequestTime);
                actions.setLastRequestTime(moment());

                actions.setVisibleTimerange(getCenteredTimerange(timerange, visibleTimerange, lastRequestTime));

                if (lastRequestTime.day() !== timerange[1].day()) {
                    Logger.debug('Day changed. Setting today as timerange.');
                    actions.setTimerange(getTodayTimerange());
                }
            } else {
                // Logger.debug('Current day not selected in UI, not requesting data');
            }
        } else {
            Logger.debug('Delaying bg sync, initial data still loading.');
        }
    }),
});

export { mainStore };
