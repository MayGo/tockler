import moment from 'moment';
import { ITrackItem } from '../@types/ITrackItem';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { EventEmitter } from './EventEmitter';
import { emit } from 'eiphop';

async function findAllDayItems(
    from: moment.Moment,
    to: moment.Moment,
    taskName: string,
): Promise<any> {
    Logger.info('findAllDayItems', JSON.stringify({ from, to, taskName }));
    const data = await emit('findAllDayItems', { from: from.toDate(), to: to.toDate(), taskName });
    Logger.info('findAllDayItems result ', data);
    return data;
}

export async function findAllDayItemsForEveryTrack(from: moment.Moment, to: moment.Moment) {
    // TODO, query all at async
    const appItems: ITrackItem[] = await findAllDayItems(from, to, TrackItemType.AppTrackItem);

    const statusItems: ITrackItem[] = await findAllDayItems(
        from,
        to,
        TrackItemType.StatusTrackItem,
    );
    const logItems: ITrackItem[] = await findAllDayItems(from, to, TrackItemType.LogTrackItem);

    return { appItems, statusItems, logItems };
}

export function findFirstLogItems(): Promise<any> {
    return emit('findFirstLogItems');
}
export function searchFromItems({ from, to, taskName, searchStr, paging }): Promise<any> {
    return emit('searchFromItems', {
        from: from.toDate(),
        to: to.toDate(),
        taskName,
        searchStr,
        paging,
    });
}

function createTrackItem(trackItem: ITrackItem): Promise<any> {
    return emit('createTrackItem', { trackItem: trackItem });
}

function updateTrackItem(trackItem: ITrackItem): Promise<any> {
    return emit('updateTrackItem', { trackItem });
}

export async function saveTrackItem(trackItem): Promise<any> {
    Logger.info('Saving trackitem.', trackItem);
    if (!trackItem.taskName) {
        trackItem.taskName = 'LogTrackItem';
    }
    if (trackItem.id) {
        if (trackItem.originalColor === trackItem.color) {
            // this.updateTrackItem(trackItem);
        } else {
            // this.showChangeColorDialog();
        }
        const item = await updateTrackItem(trackItem);
        Logger.info('Updated trackitem to DB:', item);
        return item;
    }
    if (!trackItem.app) {
        trackItem.app = 'Default';
    }
    const item = createTrackItem(trackItem);
    Logger.info('Created trackitem to DB:', item);
    return item;
}

export function deleteByIds(trackItemIds: number) {
    return emit('deleteByIds', { trackItemIds });
}

export function startNewLogItem(oldItem: any) {
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

    EventEmitter.send('start-new-log-item', newItem);
}

export function stopRunningLogItem(runningLogItemId: number) {
    Logger.debug('stopRunningLogItem', runningLogItemId);
    EventEmitter.send('end-running-log-item');
}

export function updateTrackItemColor(appName: string, color: string) {
    return emit('updateTrackItemColor', { appName, color });
}
