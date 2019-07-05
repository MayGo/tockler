import moment from 'moment';
import { ITrackItem } from '../@types/ITrackItem';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';

const { ipcRenderer } = (window as any).require('electron');

export class TrackItemService {
    public static service: any = (window as any).App.TrackItemService;

    /*  findAllItems(from, to, taskName, searchStr, paging) {
          return TrackItemService.service.findAllFromDay(from, to, taskName, searchStr, paging);
      } */

    public static async findAllDayItems(
        from: moment.Moment,
        to: moment.Moment,
        taskName: string,
    ): Promise<any> {
        Logger.debug('findAllDayItems from proxy', JSON.stringify({ from, to, taskName }));
        const json = await TrackItemService.service.findAllDayItems(
            from.toDate(),
            to.toDate(),
            taskName,
        );

        return JSON.parse(json);
    }

    public static async findAllItems(from: moment.Moment, to: moment.Moment) {
        const appItems: ITrackItem[] = await TrackItemService.findAllDayItems(
            from,
            to,
            TrackItemType.AppTrackItem,
        );

        const statusItems: ITrackItem[] = await TrackItemService.findAllDayItems(
            from,
            to,
            TrackItemType.StatusTrackItem,
        );
        const logItems: ITrackItem[] = await TrackItemService.findAllDayItems(
            from,
            to,
            TrackItemType.LogTrackItem,
        );

        return { appItems, statusItems, logItems };
    }

    public static async findAllFromDay(from: moment.Moment, type: string): Promise<any> {
        Logger.debug('findAllFromDay', from, type);
        const json = await TrackItemService.service.findAllFromDay(from.toDate(), type);

        return JSON.parse(json);
    }

    public static findFirstLogItems(): Promise<any> {
        return TrackItemService.service.findFirstLogItems();
    }

    public static createItem(trackItem: ITrackItem): Promise<any> {
        return TrackItemService.service.createTrackItem(trackItem);
    }

    public static updateItem(trackItem: ITrackItem): Promise<any> {
        return TrackItemService.service.updateItem(trackItem, trackItem.id);
    }

    public static async saveTrackItem(trackItem): Promise<any> {
        console.debug('Saving trackitem.', trackItem);
        if (!trackItem.taskName) {
            trackItem.taskName = 'LogTrackItem';
        }
        if (trackItem.id) {
            if (trackItem.originalColor === trackItem.color) {
                // this.updateItem(trackItem);
            } else {
                // this.showChangeColorDialog();
            }
            const item = await TrackItemService.updateItem(trackItem);
            console.debug('Updated trackitem to DB:', item);
            return item;
        }
        if (!trackItem.app) {
            trackItem.app = 'Default';
        }
        const item = TrackItemService.createItem(trackItem);
        console.debug('Created trackitem to DB:', item);
        return item;
    }

    public static updateTrackItem(trackItem) {
        TrackItemService.updateItem(trackItem);
    }

    public static deleteById(trackItemId: number) {
        return TrackItemService.service.deleteById(trackItemId);
    }

    public static deleteByIds(trackItemIds: number) {
        return TrackItemService.service.deleteByIds(trackItemIds);
    }

    public static startNewLogItem(oldItem: any) {
        Logger.debug('startNewLogItem');

        const newItem: any = {};
        newItem.app = oldItem.app || 'WORK';
        newItem.taskName = 'LogTrackItem';
        newItem.color = oldItem.color;
        newItem.title = oldItem.title;
        newItem.beginDate = moment().toDate();
        newItem.endDate = moment()
            .add(60, 'seconds')
            .toDate();

        ipcRenderer.send('start-new-log-item', newItem);
    }

    public static stopRunningLogItem(runningLogItemId: number) {
        Logger.debug('stopRunningLogItem', runningLogItemId);
        ipcRenderer.send('end-running-log-item');
    }

    public static updateColorForApp(appName: string, color: string) {
        return TrackItemService.service.updateColorForApp(appName, color);
    }
}
