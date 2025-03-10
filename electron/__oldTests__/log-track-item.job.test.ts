import { backgroundService } from '../app/background-service';
import BackgroundUtils from '../app/background-utils';
import { logTrackItemJob } from '../app/jobs/log-track-item-job';
import { stateManager } from '../app/state-manager';
import { State } from '../app/enums/state';
import { TrackItemType } from '../app/enums/track-item-type';
import TrackItemTestData from './track-item-test-data';

import moment from 'moment';
import { trackItemService } from '../app/services/track-item-service';
import { settingsService } from '../app/services/settings-service';

describe('updateRunningLogItem not saving', () => {
    let createOrUpdateMock = null;

    beforeEach(async () => {
        createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;
    });

    afterEach(async () => {
        stateManager.resetCurrentTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetCurrentTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
        stateManager.setAwakeFromSleep();
    });

    it('Does not save item when sleeping', async () => {
        let item: TrackItemInstance = TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));
        stateManager.setCurrentTrackItem(item);

        stateManager.setSystemToSleep();

        expect(() => {
            logTrackItemJob.checkIfIsInCorrectState();
        }).toThrow();

        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('Does not save item when not online', async () => {
        let item: TrackItemInstance = TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setCurrentTrackItem(item);

        expect(() => {
            logTrackItemJob.checkIfIsInCorrectState();
        }).toThrow();
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });
});

describe('updateRunningLogItem saving', () => {
    let createOrUpdateMock = null;
    let _now;
    let nowMock = null;
    let getLogTrackItemMarkedAsRunningMock = null;
    let endRunningTrackItemMock = null;
    let setLogTrackItemMarkedAsRunningMock = null;
    let getTaskSplitDateMock = null;
    let _getTaskSplitDate = null;

    beforeEach(async () => {
        stateManager.isSystemOnline = jest.fn().mockReturnValueOnce(true);
        stateManager.isSystemSleeping = jest.fn().mockReturnValueOnce(false);

        let item: TrackItemInstance = TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));
        stateManager.setCurrentTrackItem(item);

        getLogTrackItemMarkedAsRunningMock = jest.fn();
        stateManager.getLogTrackItemMarkedAsRunning = getLogTrackItemMarkedAsRunningMock;

        getTaskSplitDateMock = jest.fn();
        _getTaskSplitDate = logTrackItemJob.getTaskSplitDate;
        logTrackItemJob.getTaskSplitDate = getTaskSplitDateMock;

        endRunningTrackItemMock = jest.fn();
        stateManager.endRunningTrackItem = endRunningTrackItemMock;

        createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        setLogTrackItemMarkedAsRunningMock = jest.fn();
        stateManager.setLogTrackItemMarkedAsRunning = setLogTrackItemMarkedAsRunningMock;

        _now = Date.now;
        nowMock = jest.fn();
        Date.now = nowMock;
    });

    afterEach(async () => {
        logTrackItemJob.getTaskSplitDate = _getTaskSplitDate;
    });

    it('Updates item with current date when not splitting', async () => {
        let rawItem = TrackItemTestData.getLogTrackItem({});

        getLogTrackItemMarkedAsRunningMock.mockReturnValueOnce(rawItem);

        getTaskSplitDateMock.mockReturnValueOnce(null);

        createOrUpdateMock.mockReturnValueOnce(rawItem);

        let returnEndDate = new Date();
        nowMock.mockReturnValueOnce(returnEndDate);

        let savedItem = await logTrackItemJob.updateRunningLogItem();

        expect(createOrUpdateMock.mock.calls.length).toBe(1);
        expect(endRunningTrackItemMock.mock.calls.length).toBe(0);
        expect(nowMock.mock.calls.length).toBe(3); //moment() uses this also
        let mockCalledWith = createOrUpdateMock.mock.calls[0][0];
        expect(mockCalledWith.endDate).toBe(returnEndDate);

        expect(savedItem).toBeDefined();
    });

    it('Updates new item with current date and begin date with currentTimeMinusJobInterval when splitting', async () => {
        let itemDate = new Date();
        nowMock.mockReturnValue(itemDate);
        let rawItem = TrackItemTestData.getLogTrackItem({});
        getLogTrackItemMarkedAsRunningMock.mockReturnValueOnce(rawItem);

        let splitEndDate = new Date();
        getTaskSplitDateMock.mockReturnValueOnce(splitEndDate);

        let minusJobIntervalDate = new Date();

        BackgroundUtils.currentTimeMinusJobInterval = jest.fn().mockReturnValueOnce(minusJobIntervalDate);

        createOrUpdateMock.mockReturnValueOnce(rawItem);

        let returnEndDate = new Date();
        nowMock.mockReturnValueOnce(returnEndDate);

        let savedItem = await logTrackItemJob.updateRunningLogItem();

        expect(endRunningTrackItemMock.mock.calls.length).toBe(1);
        expect(createOrUpdateMock.mock.calls.length).toBe(1);

        let createOrUpdateMockCalledWith = createOrUpdateMock.mock.calls[0][0];
        expect(createOrUpdateMockCalledWith.endDate).toBe(returnEndDate);
        expect(createOrUpdateMockCalledWith.beginDate).toBe(minusJobIntervalDate);

        expect(savedItem).toBeDefined();
    });

    it('Updates old item with splitEndDate when splitting', async () => {
        let itemDate = new Date();
        nowMock.mockReturnValue(itemDate);
        let rawItem = TrackItemTestData.getLogTrackItem({});
        getLogTrackItemMarkedAsRunningMock.mockReturnValueOnce(rawItem);

        let splitEndDate = new Date();
        getTaskSplitDateMock.mockReturnValueOnce(splitEndDate);

        createOrUpdateMock.mockReturnValueOnce(rawItem);

        let returnEndDate = new Date();
        nowMock.mockReturnValueOnce(returnEndDate);

        let savedItem = await logTrackItemJob.updateRunningLogItem();

        let endRunningTrackItemMockWith = endRunningTrackItemMock.mock.calls[0][0];
        expect(endRunningTrackItemMockWith.endDate).toBe(splitEndDate);
    });
});

describe('getTaskSplitDate', () => {
    it('returns split date', async () => {
        let rawItem = TrackItemTestData.getStatusTrackItem({ app: State.Online });

        let lastOnlineItem: TrackItemInstance = TrackItem.build(rawItem);

        let findLastOnlineItemMock = jest.fn();
        trackItemService.findLastOnlineItem = findLastOnlineItemMock;
        findLastOnlineItemMock.mockReturnValueOnce([lastOnlineItem]);

        let fetchWorkSettingsMock = jest.fn();
        settingsService.fetchWorkSettings = fetchWorkSettingsMock;
        fetchWorkSettingsMock.mockReturnValueOnce({ splitTaskAfterIdlingForMinutes: 1 });

        let shouldReturnDate = moment(rawItem.endDate).add(1, 'minutes').toDate();

        let splitDate = await logTrackItemJob.getTaskSplitDate();
        expect(shouldReturnDate).toEqual(splitDate);
    });
});
