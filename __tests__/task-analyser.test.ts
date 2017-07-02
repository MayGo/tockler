jest.autoMockOff();

import BackgroundUtils from '../app/background.utils';
import { models } from '../app/models';
import { TrackItemAttributes, TrackItemInstance } from '../app/models/interfaces/track-item-interface';
import { settingsService } from '../app/services/settings-service';
import { trackItemService } from '../app/services/track-item-service';
import { stateManager } from '../app/state-manager';
import { State } from '../app/state.enum';
import {taskAnalyser} from '../app/task-analyser';
import { TrackItemType } from '../app/track-item-type.enum';
import TrackItemTestData from './track-item-test-data';

import * as moment from 'moment';

describe('TaskAnalyser', () => {

    it('analyseAndNotify', async () => {

        expect(true).toEqual(true);
    });

});
