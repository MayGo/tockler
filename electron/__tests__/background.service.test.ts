import { backgroundService } from '../app/background-service';
import { stateManager } from '../app/state-manager';

import { TrackItemType } from '../app/enums/track-item-type';
import TrackItemTestData from './track-item-test-data';

import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('createOrUpdate', () => {
    afterEach(async () => {
        AppSetting.$clearQueue();
        TrackItem.$clearQueue();
        Setting.$clearQueue();
        stateManager.resetCurrentTrackItem(TrackItemType.AppTrackItem);
        stateManager.resetCurrentTrackItem(TrackItemType.LogTrackItem);
        stateManager.resetCurrentTrackItem(TrackItemType.StatusTrackItem);
    });

    it('returns saved item', async () => {
        //Create mock data
        AppSetting.$queueResult([]);
        TrackItem.$queueResult([]);
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));
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
        AppSetting.$queueResult([]);

        TrackItem.$queueResult([]);
        TrackItem.$queueResult([]);
        TrackItem.$queueResult([]);

        Setting.$queueResult(Setting.build({ jsonData: '{}' }));

        const rawItem: TrackItemAttributes = TrackItemTestData.getLogTrackItem({
            beginDate: moment().startOf('day').subtract(1, 'hours').toDate(),
            endDate: moment().startOf('day').add(1, 'hours').toDate(),
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
        AppSetting.$queueResult([AppSetting.build()]);
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));

        const rawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});

        let runningItem = stateManager.getCurrentTrackItem(rawItem.taskName);

        expect(runningItem).toBeNull();

        const item = await backgroundService.createOrUpdate(rawItem);

        runningItem = stateManager.getCurrentTrackItem(rawItem.taskName);

        expect(runningItem).not.toBeNull();
        expect(runningItem.app).toEqual('Chrome');
        expect(runningItem.id).toEqual(item.id);
    });

    it('Creates new item if running is different and marks it as running', async () => {
        //Create mock data
        AppSetting.$queueResult([AppSetting.build()]);
        AppSetting.$queueResult([AppSetting.build()]);
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));

        const firstRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});
        const secondRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({ app: 'Firefox' }, 1);

        let runningItem = stateManager.getCurrentTrackItem(firstRawItem.taskName);

        expect(runningItem).toBeNull();

        //Add First item
        const firstItem = await backgroundService.createOrUpdate(firstRawItem);
        runningItem = stateManager.getCurrentTrackItem(firstRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(firstItem.id);

        //Add Second item
        const secondItem = await backgroundService.createOrUpdate(secondRawItem);
        runningItem = stateManager.getCurrentTrackItem(secondRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(secondItem.id);
        expect(firstItem.id).not.toEqual(secondItem.id);
    });

    it('If new item is same as running item, then runningItem instance is not changed', async () => {
        //Create mock data
        TrackItem.$queueResult([models.TrackItem.build()]);

        AppSetting.$queueResult([AppSetting.build()]);
        AppSetting.$queueResult([AppSetting.build()]);
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));

        const firstRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});
        const secondRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({}, 1);

        let runningItem = stateManager.getCurrentTrackItem(firstRawItem.taskName);
        expect(runningItem).toBeNull();

        //Add First item
        const firstItem = await backgroundService.createOrUpdate(firstRawItem);
        runningItem = stateManager.getCurrentTrackItem(firstRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(firstItem.id);

        //Add Second item
        const secondItem = await backgroundService.createOrUpdate(secondRawItem);
        runningItem = stateManager.getCurrentTrackItem(secondRawItem.taskName);
        expect(runningItem).not.toBeNull();
        expect(runningItem.id).toEqual(firstItem.id);
        expect(firstItem.id).toEqual(secondItem.id);
    });

    it('If new item is same as running item, then endDate is updated', async () => {
        //Create mock data
        TrackItem.$queueResult([models.TrackItem.build()]);
        AppSetting.$queueResult([AppSetting.build()]);
        AppSetting.$queueResult([AppSetting.build()]);
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));

        const firstRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({});
        const secondRawItem: TrackItemAttributes = TrackItemTestData.getAppTrackItem({}, 1);

        //Add First item
        const firstItem = await backgroundService.createOrUpdate(firstRawItem);
        //Add Second item
        const secondItem = await backgroundService.createOrUpdate(secondRawItem);
        let runningItem = stateManager.getCurrentTrackItem(secondRawItem.taskName);
        expect(runningItem.id).toEqual(firstItem.id);
        expect(runningItem.beginDate).toEqual(firstRawItem.beginDate);
        expect(runningItem.endDate).not.toEqual(firstRawItem.endDate);
    });
});

describe('addInactivePeriod', () => {
    afterEach(async () => {
        AppSetting.$clearQueue();
        TrackItem.$clearQueue();
        Setting.$clearQueue();
    });

    it('returns saved item', async () => {
        const appName = 'OFFLINE';
        let appColor = '#000';
        //Create mock data
        AppSetting.$queueResult([AppSetting.build({ name: appName, color: appColor })]);
        TrackItem.$queueResult([]);
        Setting.$queueResult(Setting.build({ jsonData: '{}' }));

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
