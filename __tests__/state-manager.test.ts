jest.autoMockOff();

import BackgroundUtils from '../app/background.utils';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';
import { settingsService } from "../app/services/settings-service";

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


describe('endRunningTrackItem', () => {

    afterEach(async () => {
        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
        models.TrackItem.$clearQueue();
    });

    it('returns item if has running item to end', async () => {
        models.TrackItem.$queueResult([]);

        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
        let rawItemRunning = TrackItemTestData.getStatusTrackItem({ app: State.Online });
        let itemRunning: TrackItemInstance = models.TrackItem.build(rawItemRunning);
        stateManager.setRunningTrackItem(itemRunning);

        let rawItem: TrackItemAttributes = TrackItemTestData.getStatusTrackItem({ app: State.Online }, 1);

        expect(rawItemRunning.endDate).not.toEqual(rawItem.beginDate);

        let updatedItem = await stateManager.endRunningTrackItem(rawItem);
        expect(updatedItem).not.toEqual(rawItemRunning);
        expect(updatedItem.endDate).toEqual(rawItem.beginDate);
    });

    it('returns null if has no running item to end', async () => {

        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);

        let rawItem: TrackItemAttributes = TrackItemTestData.getStatusTrackItem({ app: State.Online });

        let updatedItem = await stateManager.endRunningTrackItem(rawItem);
        expect(updatedItem).toEqual(null);
    });

});
describe('setLogTrackItemMarkedAsRunning', () => {

    afterEach(async () => {

    });

    it('saves running log item id', async () => {

        let rawItemRunning = TrackItemTestData.getStatusTrackItem({ app: State.Online });
        let itemRunning: TrackItemInstance = models.TrackItem.build(rawItemRunning);

        let saveRunningLogItemReferenceMock = jest.fn();
        settingsService.saveRunningLogItemReference = saveRunningLogItemReferenceMock;
        stateManager.setLogTrackItemMarkedAsRunning(itemRunning);

        expect(saveRunningLogItemReferenceMock.mock.calls.length).toBe(1);
        let saveRunningLogItemReferenceMockCalledWith = saveRunningLogItemReferenceMock.mock.calls[0][0];
        expect(saveRunningLogItemReferenceMockCalledWith).toBe(itemRunning.id);
    });

});