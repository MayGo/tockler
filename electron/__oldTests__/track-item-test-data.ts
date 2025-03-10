import { TrackItemType } from '../app/enums/track-item-type';
import moment from 'moment';

export default class TrackItemTestData {
    static getAppTrackItem(data = {}, addHours = 0): any {
        const rawItem: any = {
            app: 'Chrome',
            title: 'google.com',
            taskName: TrackItemType.AppTrackItem,
            color: '#123456',
            beginDate: moment().startOf('day').add(addHours, 'hours').toDate(),
            endDate: moment()
                .startOf('day')
                .add(addHours + 1, 'hours')
                .toDate(),
        };

        return Object.assign({}, rawItem, data);
    }

    static getLogTrackItem(data = {}, addDays = 1): any {
        const rawItem: any = {
            app: 'WORK',
            title: 'Some work.',
            taskName: TrackItemType.LogTrackItem,
            color: '#123456',
            beginDate: moment().startOf('day').add(addDays, 'hours').toDate(),
            endDate: moment()
                .startOf('day')
                .add(addDays + 1, 'hours')
                .toDate(),
        };

        return Object.assign({}, rawItem, data);
    }

    static getStatusTrackItem(data: any = {}, addDays = 1): any {
        const rawItem: any = {
            app: 'IDLE',
            taskName: TrackItemType.StatusTrackItem,
            color: '#123456',
            beginDate: moment().startOf('day').add(addDays, 'hours').toDate(),
            endDate: moment()
                .startOf('day')
                .add(addDays + 1, 'hours')
                .toDate(),
        };
        rawItem.title = data.app ? data.app.toString().toLowerCase() : rawItem.app.toString().toLowerCase();
        return Object.assign({}, rawItem, data);
    }

    static getStatusOnlineTrackItem(data: any = {}, addDays = 1): any {
        const rawItem: any = {
            app: 'ONLINE',
            taskName: TrackItemType.StatusTrackItem,
            color: '#666777',
            beginDate: moment().startOf('day').add(addDays, 'hours').toDate(),
            endDate: moment()
                .startOf('day')
                .add(addDays + 1, 'hours')
                .toDate(),
        };
        rawItem.title = data.app ? data.app.toString().toLowerCase() : rawItem.app.toString().toLowerCase();
        return Object.assign({}, rawItem, data);
    }
}
