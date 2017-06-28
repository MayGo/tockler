jest.autoMockOff();

import BackgroundUtils from '../app/background.utils';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';

describe('isSystemOnline', () => {

    afterEach(async () => {
        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
    });

    it('returns true if State.Online', async () => {

        let rawItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setRunningTrackItem(rawItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(true);
    });

    it('returns false if State.Offline', async () => {

        let rawItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setRunningTrackItem(rawItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(false);
    });

    it('returns false if State.Idle', async () => {

        let rawItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem());

        stateManager.setRunningTrackItem(rawItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(false);
    });

    it('returns false if StateTrackItem is not defined', async () => {

        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(false);
    });
});