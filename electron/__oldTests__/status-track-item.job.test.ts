import { appConstants } from '../app/app-constants';
import { backgroundService } from '../app/background-service';
import { statusTrackItemJob } from '../app/jobs/status-track-item-job';
import { stateManager } from '../app/state-manager';
import { State } from '../app/enums/state';
import { TrackItemType } from '../app/enums/track-item-type';
import TrackItemTestData from './track-item-test-data';

import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('saveIdleTrackItem', () => {
    afterEach(async () => {
        stateManager.resetCurrentTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetCurrentTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
        stateManager.setAwakeFromSleep();
    });

    it('Does not save item when sleeping', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        stateManager.setSystemToSleep();

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = statusTrackItemJob.saveIdleTrackItem(rawItem);

        expect(error).toBe('SLEEPING');
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });

    it('If havent idled enough, then creates Online item', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setCurrentTrackItem(item);
        statusTrackItemJob.saveIdleTrackItem(appConstants.IDLE_IN_SECONDS_TO_LOG - 1);

        expect(createOrUpdateMock.mock.calls.length).toBe(1);
        let calledObj = createOrUpdateMock.mock.calls[0][0];
        expect(calledObj.app).toBe('ONLINE');
        expect(calledObj.title).toBe('online');
        expect(calledObj.taskName).toBe('StatusTrackItem');
    });

    it('BeginDate and endDate diff should be BACKGROUND_JOB_INTERVAL (3 sec)', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        statusTrackItemJob.saveIdleTrackItem(appConstants.IDLE_IN_SECONDS_TO_LOG - 1);

        expect(createOrUpdateMock.mock.calls.length).toBe(1);
        let calledObj = createOrUpdateMock.mock.calls[0][0];
        let diffInSeconds = moment(calledObj.endDate).diff(moment(calledObj.beginDate), 'milliseconds');
        expect(diffInSeconds).toBe(appConstants.BACKGROUND_JOB_INTERVAL);
    });

    it('Does save item when online', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setCurrentTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = statusTrackItemJob.saveIdleTrackItem(rawItem);

        expect(error).not.toBeDefined();
        expect(createOrUpdateMock.mock.calls.length).toBe(1);
    });

    it('Cannot go from OFFLINE to IDLE ', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setCurrentTrackItem(item);

        let rawItem = TrackItemTestData.getAppTrackItem({});
        let error = statusTrackItemJob.saveIdleTrackItem(appConstants.IDLE_IN_SECONDS_TO_LOG + 1);

        expect(error).toEqual('BAD_STATE');
        expect(createOrUpdateMock.mock.calls.length).toBe(0);
    });
});
