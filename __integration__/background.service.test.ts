jest.autoMockOff();

import { backgroundService } from '../app/background.service';


import * as moment from 'moment';

describe('addInactivePeriod', () => {
    it('returns item', async () => {
        const beginDate = moment().startOf('day').subtract(2, 'days').subtract(1, 'seconds').toDate();

        const endDate = moment().startOf('day').subtract(1, 'days').subtract(1, 'seconds').toDate();
        const item =  await backgroundService.addInactivePeriod(beginDate, endDate);

        expect(item.app).toEqual({});
        expect(item).toEqual({});
    })
});