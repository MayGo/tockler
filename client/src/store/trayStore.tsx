import { Action, action, createStore, Thunk, thunk } from 'easy-peasy';
import { DateTime } from 'luxon';
import { ITimelineState } from '../@types/ITimelineState';
import { getTodayTimerange } from '../components/Timeline/timeline.utils';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { findAllDayItemsForEveryTrack } from '../services/trackItem.api';
import { addToTimelineItems } from '../timeline.util';

// Define the store model for the tray app
export interface TrayStoreModel {
    isLoading: boolean;
    setIsLoading: Action<TrayStoreModel, boolean>;

    timeItems: ITimelineState;
    setTimeItems: Action<TrayStoreModel, ITimelineState>;

    fetchTimerange: Thunk<TrayStoreModel>;
    bgSync: Thunk<TrayStoreModel, DateTime>;
    bgSyncInterval: Thunk<TrayStoreModel>;
}

const defaultTimerange = getTodayTimerange();

const trayStore = createStore<TrayStoreModel>({
    isLoading: false,
    setIsLoading: action((state, payload) => {
        state.isLoading = payload;
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

    fetchTimerange: thunk(async (actions) => {
        const timerange = defaultTimerange;
        Logger.debug('TrayApp - Loading timerange:', JSON.stringify(timerange));
        actions.setIsLoading(true);

        const { appItems, statusItems, logItems } = await findAllDayItemsForEveryTrack(timerange[0], timerange[1]);

        const updatedTimeItems = {
            [TrackItemType.AppTrackItem]: appItems,
            [TrackItemType.StatusTrackItem]: statusItems,
            [TrackItemType.LogTrackItem]: logItems,
            timerange: null,
        };

        actions.setTimeItems(updatedTimeItems);
        actions.setIsLoading(false);
    }),

    bgSync: thunk(async (actions, requestFrom, { getState }) => {
        Logger.debug('TrayApp - Requesting from:', JSON.stringify(requestFrom));
        const { timeItems } = getState();
        const { appItems, statusItems, logItems } = await findAllDayItemsForEveryTrack(
            requestFrom,
            requestFrom.plus({ days: 1 }),
        );
        Logger.debug('TrayApp - Returned updated items:', appItems);

        const payload = {
            appItems,
            statusItems,
            logItems,
        };

        actions.setTimeItems(addToTimelineItems(timeItems, payload));
    }),

    bgSyncInterval: thunk(async (actions, _, { getState }) => {
        const { isLoading } = getState();
        if (!isLoading) {
            actions.bgSync(DateTime.now());
        } else {
            Logger.debug('TrayApp - Delaying bg sync, initial data still loading.');
        }
    }),
});

export { trayStore };
