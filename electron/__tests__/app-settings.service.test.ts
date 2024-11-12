import { models } from '../app/models';
import { appSettingService } from '../app/services/app-setting-service';

jest.autoMockOff();

import moment from 'moment';

describe('getAppColor', () => {
    afterEach(async () => {
        AppSetting.$clearQueue();
    });

    it('returns new color, when there is nothing defined for given app name.', async () => {
        let appName = 'SOMEAPP2';
        let appColor = '#000';
        //Create mock data
        AppSetting.$queueResult([]);

        const color = await appSettingService.getAppColor(appName);

        expect(color).toContain('#');
    });

    it('returns already defined color.', async () => {
        let appName = 'SOMEAPP2';
        let appColor = '#000';
        //Create mock data
        AppSetting.$queueResult([AppSetting.build({ name: appName, color: appColor })]);

        const color = await appSettingService.getAppColor(appName);

        expect(color).toEqual(appColor);
    });
});
