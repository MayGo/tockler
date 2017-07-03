jest.autoMockOff();

import BackgroundUtils from '../app/background-utils';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { settingsService } from '../app/services/settings-service';
import { trackItemService } from '../app/services/track-item-service';
import { stateManager } from '../app/state-manager';
import { State } from '../app/enums/state';
import { TrackItemType } from '../app/enums/track-item-type';
import TrackItemTestData from './track-item-test-data';

describe('isSystemOnline', () => {

    afterEach(async () => {
        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
    });

    it('returns true if State.Online', async () => {

        let rawItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setCurrentTrackItem(rawItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(true);
    });

    it('returns false if State.Offline', async () => {

        let rawItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setCurrentTrackItem(rawItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(false);
    });

    it('returns false if State.Idle', async () => {

        let rawItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem());

        stateManager.setCurrentTrackItem(rawItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(false);
    });

    it('returns false if StateTrackItem is not defined', async () => {

        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);

        let state = stateManager.isSystemOnline();

        expect(state).toEqual(false);
    });
});


describe('endRunningTrackItem', () => {

    afterEach(async () => {
        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
        models.TrackItem.$clearQueue();
    });

    it('returns item if has running item to end', async () => {
        models.TrackItem.$queueResult([]);

        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
        let rawItemRunning = TrackItemTestData.getStatusTrackItem({ app: State.Online });
        let itemRunning: TrackItemInstance = models.TrackItem.build(rawItemRunning);
        stateManager.setCurrentTrackItem(itemRunning);

        let rawItem: TrackItemAttributes = TrackItemTestData.getStatusTrackItem({ app: State.Online }, 1);

        expect(rawItemRunning.endDate).not.toEqual(rawItem.beginDate);

        let updatedItem = await stateManager.endRunningTrackItem(rawItem);
        expect(updatedItem).not.toEqual(rawItemRunning);
        expect(updatedItem.endDate).toEqual(rawItem.beginDate);
    });

    it('returns null if has no running item to end', async () => {

        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);

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


describe('restoreState', () => {

    afterEach(async () => {

    });

    it('saves running log item id', async () => {

        let rawItemRunning = TrackItemTestData.getLogTrackItem();
        let itemRunning: TrackItemInstance = models.TrackItem.build(rawItemRunning);

        let findRunningLogItemMock = jest.fn();
        trackItemService.findRunningLogItem = findRunningLogItemMock;
        findRunningLogItemMock.mockReturnValueOnce(itemRunning);

        let restoredItem = await stateManager.restoreState();

        expect(findRunningLogItemMock.mock.calls.length).toBe(1);
        expect(stateManager.getCurrentTrackItem(TrackItemType.LogTrackItem)).toBe(itemRunning);
        expect(stateManager.getLogTrackItemMarkedAsRunning()).toBe(itemRunning);
        expect(restoredItem).toBe(itemRunning);
    });

});