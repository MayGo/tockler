import { Action, action, createStore, Thunk, thunk, thunkOn, ThunkOn } from 'easy-peasy';
import { DateTime } from 'luxon';
import { ITimelineState } from '../@types/ITimelineState';
import { SelectedTrackItem } from '../@types/ITrackItem';
import { getCenteredTimerange, getTodayTimerange, setDayFromTimerange } from '../components/Timeline/timeline.utils';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { findAllDayItemsForEveryTrack } from '../services/trackItem.api';
import { addToTimelineItems } from '../timeline.util';
import { loadVisibleRange, saveVisibleRange } from '../utils';

const defaultTimerange = getTodayTimerange();
// Try to load saved visible range from localStorage, fall back to default if not found
const savedVisibleTimerange = loadVisibleRange();

const defaultVisibleTimerange =
    savedVisibleTimerange ||
    getCenteredTimerange(
        defaultTimerange,
        [DateTime.now().minus({ hours: 1 }), DateTime.now().plus({ hours: 1 })],
        DateTime.now(),
    );

export const TIMERANGE_MODE_TODAY = 'TODAY';

export interface StoreModel {
    selectedTimelineItem: null | SelectedTrackItem;
    setSelectedTimelineItem: Action<StoreModel, SelectedTrackItem | null>;

    liveView: boolean;
    setLiveView: Action<StoreModel, boolean>;

    isLoading: boolean;
    setIsLoading: Action<StoreModel, boolean>;

    timerange: DateTime[];
    setTimerange: Action<StoreModel, DateTime[]>;

    visibleTimerange: DateTime[];
    setVisibleTimerange: Action<StoreModel, DateTime[]>;

    timerangeMode: string | null;
    setTimerangeMode: Action<StoreModel, string | null>;

    lastRequestTime: DateTime;
    setLastRequestTime: Action<StoreModel, DateTime>;

    timeItems: ITimelineState;
    setTimeItems: Action<StoreModel, ITimelineState>;

    onSetTimerange: ThunkOn<StoreModel>;

    fetchTimerange: Thunk<StoreModel>;

    loadTimerange: Thunk<StoreModel, DateTime[]>;

    bgSync: Thunk<StoreModel, DateTime>;
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
        // Save to localStorage whenever visible range changes
        saveVisibleRange(payload);
    }),

    timerangeMode: TIMERANGE_MODE_TODAY,
    setTimerangeMode: action((state, payload) => {
        state.timerangeMode = payload;
    }),

    lastRequestTime: DateTime.now(),
    setLastRequestTime: action((state, payload) => {
        state.lastRequestTime = payload;
    }),

    timeItems: {
        [TrackItemType.AppTrackItem]: [],
        [TrackItemType.StatusTrackItem]: [],
        [TrackItemType.LogTrackItem]: [],
        timerange: null,
    },
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

        const updatedTimeItems = {
            [TrackItemType.AppTrackItem]: appItems,
            [TrackItemType.StatusTrackItem]: statusItems,
            [TrackItemType.LogTrackItem]: logItems,
            timerange: null,
        };

        actions.setTimeItems(updatedTimeItems);
        actions.setVisibleTimerange(setDayFromTimerange(visibleTimerange, timerange));
        actions.setIsLoading(false);
    }),
    loadTimerange: thunk(async (actions, range) => {
        let mode;
        if (DateTime.now() >= range[0] && DateTime.now() <= range[1]) {
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
            requestFrom.endOf('day'),
        );
        Logger.debug('Returned updated items:', appItems);

        const payload = {
            appItems,
            statusItems,
            logItems,
        };

        actions.setTimeItems(addToTimelineItems(timeItems, payload));
    }),
    bgSyncInterval: thunk(async (actions, _, { getState }) => {
        const { isLoading, timerange, visibleTimerange, timerangeMode, lastRequestTime, liveView } = getState();
        if (!isLoading) {
            if (timerangeMode === TIMERANGE_MODE_TODAY && liveView) {
                actions.bgSync(lastRequestTime);
                actions.setLastRequestTime(DateTime.now());

                actions.setVisibleTimerange(getCenteredTimerange(timerange, visibleTimerange, lastRequestTime));

                if (lastRequestTime.day !== timerange[1].day) {
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
