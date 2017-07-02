import { appConstants } from '../app/app-constants';
import { backgroundService } from '../app/background.service';
import BackgroundUtils from '../app/background.utils';
import { appTrackItemJob } from '../app/jobs/app-track-item.job';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import TaskAnalyser from '../app/task-analyser';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';

import * as moment from 'moment';

const dateFormat = "YYYY-MM-DD HH:mm:ss";

describe('checkIfIsInCorrectState', () => {

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

        expect(() => {
            appTrackItemJob.checkIfIsInCorrectState();
        }).toThrow();
    });

    it('Does not save item when idling', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Idle }));

        stateManager.setCurrentTrackItem(item);

        expect(() => {
            appTrackItemJob.checkIfIsInCorrectState();
        }).toThrow();
    });

    it('Does save item when online', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        stateManager.setCurrentTrackItem(item);

        expect(() => {
            appTrackItemJob.checkIfIsInCorrectState();
        }).not.toThrow();

    });

    it('Does save item when offline (should not happen in reality)', async () => {
        //Create mock data
        const createOrUpdateMock = jest.fn();
        backgroundService.createOrUpdate = createOrUpdateMock;

        let item: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Offline }));

        stateManager.setCurrentTrackItem(item);

        expect(() => {
            appTrackItemJob.checkIfIsInCorrectState();
        }).not.toThrow();
    });
});
