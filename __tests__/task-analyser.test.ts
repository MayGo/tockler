jest.autoMockOff();

import BackgroundUtils from '../app/background.utils';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { settingsService } from '../app/services/settings-service';
import { trackItemService } from '../app/services/track-item-service';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import TaskAnalyser from '../app/task-analyser';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';

import * as moment from 'moment';

describe('TaskAnalyser', () => {

    it('returns split date', async () => {

        let lastOnlineItem: TrackItemInstance = models.TrackItem.build(TrackItemTestData.getStatusTrackItem({ app: State.Online }));

        let findLastOnlineItemMock = jest.fn();
        trackItemService.findLastOnlineItem = findLastOnlineItemMock;
        findLastOnlineItemMock.mockReturnValueOnce([lastOnlineItem]);

        let fetchWorkSettingsMock = jest.fn();
        settingsService.fetchWorkSettings = fetchWorkSettingsMock;
        fetchWorkSettingsMock.mockReturnValueOnce({ splitTaskAfterIdlingForMinutes: 1 });

        let shouldReturnDate = moment(lastOnlineItem.endDate).add(1, 'minutes').toDate();

        let splitDate = await TaskAnalyser.getTaskSplitDate();

        expect(shouldReturnDate).toEqual(splitDate);
    });

});
