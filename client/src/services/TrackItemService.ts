import * as moment from 'moment';
import { ITrackItem } from '../@types/ITrackItem';
import { TrackItemType } from '../enum/TrackItemType';

const remote = (<any>window).require('electron').remote;
let ipcRenderer: any = (<any>window).require('electron').ipcRenderer;

export class TrackItemService {
    static service: any = remote.getGlobal('TrackItemService');

    /*  findAllItems(from, to, taskName, searchStr, paging) {
          return TrackItemService.service.findAllFromDay(from, to, taskName, searchStr, paging);
      }*/

    static async findAllDayItems(from: Date, to: Date, taskName: string): Promise<any> {
        console.log('findAllDayItems', from, to, taskName);
        const json = await TrackItemService.service.findAllDayItems(from, to, taskName);

        return JSON.parse(json);
    }

    static async findAllItems(from: Date, to: Date) {
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

    static async findAllFromDay(from: Date, type: string): Promise<any> {
        console.log('findAllFromDay', from, type);
        const json = await TrackItemService.service.findAllFromDay(from, type);

        return JSON.parse(json);
    }

    static findFirstLogItems(): Promise<any> {
        return TrackItemService.service.findFirstLogItems();
    }

    static createItem(trackItem: ITrackItem): Promise<any> {
        return TrackItemService.service.createTrackItem(trackItem);
    }

    static updateItem(trackItem: ITrackItem): Promise<any> {
        return TrackItemService.service.updateItem(trackItem, trackItem.id);
    }
    static async saveTrackItem(trackItem): Promise<any> {
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
        } else {
            if (!trackItem.app) {
                trackItem.app = 'Default';
            }
            const item = TrackItemService.createItem(trackItem);
            console.debug('Created trackitem to DB:', item);
            return item;
        }
    }
    static updateTrackItem(trackItem) {
        TrackItemService.updateItem(trackItem);
    }

    static deleteById(trackItemId: number) {
        return TrackItemService.service.deleteById(trackItemId);
    }
    static deleteByIds(trackItemId: number) {
        return TrackItemService.service.deleteByIds(trackItemId);
    }

    static startNewLogItem(oldItem: any) {
        console.log('startNewLogItem');

        let newItem: any = {};
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

    static stopRunningLogItem(runningLogItemId: number) {
        console.log('stopRunningLogItem', runningLogItemId);
        ipcRenderer.send('end-running-log-item');
    }

    static updateColorForApp(appName: string, color: string) {
        return TrackItemService.service.updateColorForApp(appName, color);
    }
}
