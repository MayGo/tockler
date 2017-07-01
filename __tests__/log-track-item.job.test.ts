import { appConstants } from '../app/app-constants';
import { backgroundService } from '../app/background.service';
import BackgroundUtils from '../app/background.utils';
import { logTrackItemJob } from '../app/jobs/log-track-item.job';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import TaskAnalyser from '../app/task-analyser';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';

import * as moment from 'moment';

const dateFormat = "YYYY-MM-DD HH:mm:ss";

describe('updateRunningLogItem not saving', () => {

    let createOrUpdateMock = null;

    beforeEach(async () => {
        createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;
    });

    afterEach(async () => {

        stateManager.resetRunningTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
        stateManager.setAwakeFromSleep();
    });

    it('Does not save item when sleeping', async () => {

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));
        stateManager.setRunningTrackItem(item);

        stateManager.setSystemToSleep();

        expect(() => {
            logTrackItemJob.checkIfIsInCorrectState();
        }).toThrow();

        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('Does not save item when not online', async () => {

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setRunningTrackItem(item);

        expect(() => {
            logTrackItemJob.checkIfIsInCorrectState();
        }).toThrow();
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });
});

describe('updateRunningLogItem saving', () => {
    let createOrUpdateMock = null;
    let nowMock = null;
    let getLogTrackItemMarkedAsRunningMock = null;
    let endRunningTrackItemMock = null;
    let setLogTrackItemMarkedAsRunningMock = null;
    let getTaskSplitDateMock = null;

    beforeEach(async () => {
        stateManager.isSystemOnline = jest.fn().mockReturnValueOnce(true);
        stateManager.isSystemSleeping = jest.fn().mockReturnValueOnce(false);

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));
        stateManager.setRunningTrackItem(item);

        getLogTrackItemMarkedAsRunningMock = jest.fn();
        stateManager.getLogTrackItemMarkedAsRunning = getLogTrackItemMarkedAsRunningMock;

        getTaskSplitDateMock = jest.fn();
        TaskAnalyser.getTaskSplitDate = getTaskSplitDateMock;

        endRunningTrackItemMock = jest.fn();
        stateManager.endRunningTrackItem = endRunningTrackItemMock;

        createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        setLogTrackItemMarkedAsRunningMock = jest.fn();
        stateManager.setLogTrackItemMarkedAsRunning = setLogTrackItemMarkedAsRunningMock;

        nowMock = jest.fn();
        Date.now = nowMock;


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