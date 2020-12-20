import { createStore, Action, action } from 'easy-peasy';
import { ITrackItem } from '../@types/ITrackItem';

export interface StoreModel {
    selectedTimelineItem: null | ITrackItem;
    setSelectedTimelineItem: Action<StoreModel, ITrackItem | null>;
}

const mainStore = createStore<StoreModel>({
    selectedTimelineItem: null,
    setSelectedTimelineItem: action((state, payload) => {
        state.selectedTimelineItem = payload;
    }),
});

export { mainStore };
