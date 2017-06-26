import { backgroundService } from '../app/background.service';
import { models } from '../app/models';
import { TrackItemAttributes } from '../app/models/interfaces/track-item-interface';
import { stateManager } from '../app/state-manager';
import { TrackItemType } from '../app/track-item-type.enum';

import * as moment from 'moment';

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
        const rawItem: TrackItemAttributes = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            beginDate: moment().startOf('day').add(5, 'hours').toDate(),
            endDate: moment().startOf('day').add(6, 'hours').toDate()
        };

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


        const rawItem: TrackItemAttributes = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            beginDate: moment().startOf('day').subtract(1, 'hours').toDate(),
            endDate: moment().startOf('day').add(1, 'hours').toDate()
        };

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

        const rawItem: TrackItemAttributes = {
            app: 'Chrome',
            title: 'google.com',
            taskName: TrackItemType.AppTrackItem,
            beginDate: moment().startOf('day').add(1, 'hours').toDate(),
            endDate: moment().startOf('day').add(2, 'hours').toDate()
        };

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

        const firstRawItem: TrackItemAttributes = {
            app: 'Chrome',
            title: 'google.com',
            taskName: TrackItemType.AppTrackItem,
            beginDate: moment().startOf('day').add(1, 'hours').toDate(),
            endDate: moment().startOf('day').add(2, 'hours').toDate()
        };
        const secondRawItem: TrackItemAttributes = {
            app: 'Firefox',
            title: 'google.com',
            taskName: TrackItemType.AppTrackItem,
            beginDate: moment().startOf('day').add(3, 'hours').toDate(),
            endDate: moment().startOf('day').add(4, 'hours').toDate()
        };

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


        expect(item.title).toEqual('Inactive');
        expect(item.taskName).toEqual(TrackItemType.StatusTrackItem);
        expect(item.app).toEqual(appName);
        expect(item.beginDate).toEqual(beginDate);
        expect(item.endDate).toEqual(endDate);
        expect(item.id).not.toBeNull;

        expect(item.color).toEqual('#000');
    });
});