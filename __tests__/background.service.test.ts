import { appConstants } from '../app/app-constants';
import { backgroundService } from '../app/background.service';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import TaskAnalyser from '../app/task-analyser';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';

import * as moment from 'moment';
import BackgroundUtils from "../app/background.utils";

const dateFormat = "YYYY-MM-DD HH:mm:ss";

describe('createOrUpdate', () => {

    afterEach(async () => {
        models.AppSetting.$clearQueue();
        models.TrackItem.$clearQueue();
        models.Settings.$clearQueue();
        stateManager.resetRunningTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
    });

    it('returns saved item', async () => {
        //Create mock data
        models.AppSetting.$queueResult([]);
        models.TrackItem.$queueResult([]);
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));
        const rawItem: TrackItemAttributes = TrackItemTestData.getLogTrackItem({});

        const item = await backgroundService.createOrUpdate(rawItem);

        expect(item.app).toEqual(rawItem.app);
        expect(item.title).toEqual(rawItem.title);
        expect(item.taskName).toEqual(TrackItemType.LogTrackItem);
        expect(item.beginDate).toEqual(rawItem.beginDate);
        expect(item.endDate).toEqual(rawItem.endDate);
        expect(item.id).not.toBeNull;

        expect(item.color).toContain('#');
    });

    it('splits item at midnight', async () => {
        //Create mock data
        models.AppSetting.$queueResult([]);

        models.TrackItem.$queueResult([]);
        models.TrackItem.$queueResult([]);
        models.TrackItem.$queueResult([]);

        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));

        const rawItem: TrackItemAttributes = TrackItemTestData.getLogTrackItem({
            beginDate: moment().startOf('day').subtract(1, 'hours').toDate(),
            endDate: moment().startOf('day').add(1, 'hours').toDate()
        });

        const item = await backgroundService.createOrUpdate(rawItem);

        expect(item.app).toEqual(rawItem.app);
        expect(item.title).toEqual(rawItem.title);
        expect(item.taskName).toEqual(TrackItemType.LogTrackItem);

        const dateAtMidnight = moment().startOf('day');
        expect(moment(item.beginDate).format(dateFormat)).toEqual(dateAtMidnight.format(dateFormat));
        expect(moment(item.endDate).format(dateFormat)).toEqual(moment(rawItem.endDate).format(dateFormat));
        expect(item.id).not.toBeNull;

        expect(item.color).toContain('#');

    });

    it('Creates new item if none and marks it as running', async () => {
        //Create mock data
        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));

        const rawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});

        let runningItem = stateManager.getRunningTrackItem(rawItem.taskName);

        expect(runningItem).toBeNull();

        const item = await backgroundService.createOrUpdate(rawItem);

        runningItem = stateManager.getRunningTrackItem(rawItem.taskName);

        expect(runningItem).not.toBeNull();
        expect(runningItem.app).toEqual("Chrome");
        expect(runningItem.id).toEqual(item.id);
    });


    it('Creates new item if running is different and marks it as running', async () => {
        //Create mock data
        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));

        const firstRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});
        const secondRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({ app: 'Firefox' }, 1);

        let runningItem = stateManager.getRunningTrackItem(firstRawItem.taskName);

        expect(runningItem).toBeNull();

        //Add First item
        const firstItem = await backgroundService.createOrUpdate(firstRawItem);
        runningItem = stateManager.getRunningTrackItem(firstRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(firstItem.id);

        //Add Second item
        const secondItem = await backgroundService.createOrUpdate(secondRawItem);
        runningItem = stateManager.getRunningTrackItem(secondRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(secondItem.id);
        expect(firstItem.id).not.toEqual(secondItem.id);
    });

    it('If new item is same as running item, then runningItem instance is not changed', async () => {
        //Create mock data
        models.TrackItem.$queueResult([models.TrackItem.build()]);

        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));

        const firstRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});
        const secondRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({}, 1);

        let runningItem = stateManager.getRunningTrackItem(firstRawItem.taskName);
        expect(runningItem).toBeNull();

        //Add First item
        const firstItem = await backgroundService.createOrUpdate(firstRawItem);
        runningItem = stateManager.getRunningTrackItem(firstRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(firstItem.id);

        //Add Second item
        const secondItem = await backgroundService.createOrUpdate(secondRawItem);
        runningItem = stateManager.getRunningTrackItem(secondRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(firstItem.id);
        expect(firstItem.id).toEqual(secondItem.id);

    });

    it('If new item is same as running item, then endDate is updated', async () => {
        //Create mock data
        models.TrackItem.$queueResult([models.TrackItem.build()]);
        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.AppSetting.$queueResult([models.AppSetting.build()]);
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));

        const firstRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});
        const secondRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({}, 1);

        //Add First item
        const firstItem = await backgroundService.createOrUpdate(firstRawItem);
        //Add Second item
        const secondItem = await backgroundService.createOrUpdate(secondRawItem);
        let runningItem = stateManager.getRunningTrackItem(secondRawItem.taskName);
        expect(runningItem.id).toEqual(firstItem.id);
        expect(runningItem.beginDate).toEqual(firstRawItem.beginDate);
        expect(runningItem.endDate).not.toEqual(firstRawItem.endDate);
    });
});


describe('addInactivePeriod', () => {
    afterEach(async () => {
        models.AppSetting.$clearQueue();
        models.TrackItem.$clearQueue();
        models.Settings.$clearQueue();
    });

    it('returns saved item', async () => {
        const appName = 'OFFLINE';
        let appColor = "#000";
        //Create mock data
        models.AppSetting.$queueResult([models.AppSetting.build({ name: appName, color: appColor })]);
        models.TrackItem.$queueResult([]);
        models.Settings.$queueResult(models.Settings.build({ jsonData: '{}' }));

        const beginDate = moment().startOf('day').add(5, 'hours').toDate();
        const endDate = moment().startOf('day').add(6, 'hours').toDate();
        const item = await backgroundService.addInactivePeriod(beginDate, endDate);


        expect(item.title).toEqual('offline');
        expect(item.taskName).toEqual(TrackItemType.StatusTrackItem);
        expect(item.app).toEqual(appName);
        expect(item.beginDate).toEqual(beginDate);
        expect(item.endDate).toEqual(endDate);
        expect(item.id).not.toBeNull;

        expect(item.color).toEqual('#000');
    });
});



describe('saveActiveWindow', () => {

    afterEach(async () => {

        stateManager.resetRunningTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
        stateManager.setAwakeFromSleep();
    });

    it('Does not save item when sleeping', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        stateManager.setSystemToSleep();

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveActiveWindow(rawItem);

        expect(error).toBe('SLEEPING');
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('Does not save item when idling', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Idle }));

        stateManager.setRunningTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveActiveWindow(rawItem);

        expect(error).toEqual('IDLING');
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('Does save item when online', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setRunningTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveActiveWindow(rawItem);

        expect(error).not.toBeDefined();
        expect(createOrUpdateMock.mock.calls.length).toBe(1);
    });

    it('Does save item when offline (should not happen in reality)', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setRunningTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveActiveWindow(rawItem);

        expect(error).not.toBeDefined();
        expect(createOrUpdateMock.mock.calls.length).toBe(1);
    });
});


describe('saveIdleTrackItem', () => {

    afterEach(async () => {

        stateManager.resetRunningTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetRunningTrackItem(TrackItemType.StatusTrackItem);
        stateManager.setAwakeFromSleep();
    });

    it('Does not save item when sleeping', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        stateManager.setSystemToSleep();

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveIdleTrackItem(rawItem);

        expect(error).toBe('SLEEPING');
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('If havent idled enough, then creates Online item', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setRunningTrackItem(item);
        backgroundService.saveIdleTrackItem(appConstants.IDLE_IN_SECONDS_TO_LOG - 1);

        expect(createOrUpdateMock.mock.calls.length).toBe(1);
        let calledObj = createOrUpdateMock.mock.calls[0][0];
        expect(calledObj.app).toBe("ONLINE");
        expect(calledObj.title).toBe("online");
        expect(calledObj.taskName).toBe("StatusTrackItem");
    });

    it('BeginDate and endDate diff should be BACKGROUND_JOB_INTERVAL (3 sec)', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        backgroundService.saveIdleTrackItem(appConstants.IDLE_IN_SECONDS_TO_LOG - 1);

        expect(createOrUpdateMock.mock.calls.length).toBe(1);
        let calledObj = createOrUpdateMock.mock.calls[0][0];
        let diffInSeconds = moment(calledObj.endDate).diff(moment(calledObj.beginDate), 'milliseconds');
        expect(diffInSeconds).toBe(appConstants.BACKGROUND_JOB_INTERVAL);
    });

    it('Does save item when online', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setRunningTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveIdleTrackItem(rawItem);

        expect(error).not.toBeDefined();
        expect(createOrUpdateMock.mock.calls.length).toBe(1);
    });

    it('Cannot go from OFFLINE to IDLE ', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setRunningTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = backgroundService.saveIdleTrackItem(appConstants.IDLE_IN_SECONDS_TO_LOG + 1);

        expect(error).toEqual("BAD_STATE");
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });
});



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

        let error = await backgroundService.updateRunningLogItem();

        expect(error).toBe('SLEEPING');
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('Does not save item when not online', async () => {

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setRunningTrackItem(item);

        let error = await backgroundService.updateRunningLogItem();

        expect(error).toEqual('NOT_ONLINE');
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

        let savedItem = await backgroundService.updateRunningLogItem();

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

        let savedItem = await backgroundService.updateRunningLogItem();

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

        let savedItem = await backgroundService.updateRunningLogItem();

        let endRunningTrackItemMockWith = endRunningTrackItemMock.mock.calls[0][0];
        expect(endRunningTrackItemMockWith.endDate).toBe(splitEndDate);
    });
});