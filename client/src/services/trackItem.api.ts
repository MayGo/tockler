import moment from 'moment';
import { ITrackItem } from '../@types/ITrackItem';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { EventEmitter } from './EventEmitter';

async function findAllDayItems(from: moment.Moment, to: moment.Moment, taskName: string): Promise<any> {
    //Logger.debug('findAllDayItems', JSON.stringify({ from, to, taskName }));
    const data = await EventEmitter.emit('findAllDayItems', {
        from: from.valueOf(),
        to: to.valueOf(),
        taskName,
    });
    // Logger.debug('findAllDayItems result ', data);
    return data;
}

export async function findAllDayItemsForEveryTrack(from: moment.Moment, to: moment.Moment) {
    // TODO, query all at async
    const appItems: ITrackItem[] = await findAllDayItems(from, to, TrackItemType.AppTrackItem);

    const statusItems: ITrackItem[] = await findAllDayItems(from, to, TrackItemType.StatusTrackItem);
    const logItems: ITrackItem[] = await findAllDayItems(from, to, TrackItemType.LogTrackItem);

    return { appItems, statusItems, logItems };
}

export function findFirstLogItems(): Promise<any> {
    return EventEmitter.emit('findFirstLogItems');
}

export function findFirstTrackItem(): Promise<any> {
    return EventEmitter.emit('findFirstTrackItem');
}

export function getOnlineStartTime(): Promise<any> {
    return EventEmitter.emit('getOnlineStartTime');
}

export function searchFromItems({ from, to, taskName, searchStr, paging, sumTotal = false }): Promise<any> {
    Logger.debug('Searching items:', { from, to, taskName, searchStr, paging });
    return EventEmitter.emit('searchFromItems', {
        from: from.valueOf(),
        to: to.valueOf(),
        taskName,
        searchStr,
        paging,
        sumTotal,
    });
}
export function exportFromItems({ from, to, taskName, searchStr }): Promise<any> {
    return EventEmitter.emit('exportFromItems', {
        from: from.valueOf(),
        to: to.valueOf(),
        taskName,
        searchStr,
    });
}

function createTrackItem(trackItem: ITrackItem): Promise<any> {
    return EventEmitter.emit('createTrackItem', { trackItem: trackItem });
}

function updateTrackItem(trackItem: ITrackItem, trackItemId: number): Promise<any> {
    return EventEmitter.emit('updateTrackItem', { trackItem, trackItemId });
}

function getRawTrackItem(savedItem) {
    let item = {
        id: savedItem.id,
        app: savedItem.app,
        title: savedItem.title,
        taskName: savedItem.taskName,
        color: savedItem.color,
        beginDate: savedItem.beginDate,
        url: savedItem.url,
        endDate: savedItem.endDate,
    };

    return item;
}

export async function saveTrackItem(inputItem): Promise<any> {
    const trackItem = getRawTrackItem(inputItem);
    Logger.debug('Saving trackitem.', trackItem);

    if (!trackItem.taskName) {
        trackItem.taskName = 'LogTrackItem';
    }

    if (trackItem.id) {
        const item = await updateTrackItem(trackItem, trackItem.id);
        Logger.debug('Updated trackitem to DB:', item);
        return item;
    }

    if (!trackItem.app) {
        trackItem.app = 'Default';
    }

    const item = createTrackItem(trackItem);
    // Logger.debug('Created trackitem to DB:', item);
    return item;
}

export function deleteByIds(trackItemIds: number[]) {
    return EventEmitter.emit('deleteByIds', { trackItemIds });
}

export function startNewLogItem(oldItem: any) {
    Logger.debug('startNewLogItem', oldItem);

    const newItem: any = {};
    newItem.app = oldItem.app || 'WORK';
    newItem.taskName = 'LogTrackItem';
    newItem.color = oldItem.color;
    newItem.title = oldItem.title;
    newItem.beginDate = moment().valueOf();
    newItem.endDate = moment().add(60, 'seconds').valueOf();

    EventEmitter.send('start-new-log-item', newItem);
}

export function stopRunningLogItem(runningLogItemId: number) {
    Logger.debug('stopRunningLogItem', runningLogItemId);
    EventEmitter.send('end-running-log-item');
}

export function updateTrackItemColor(appName: string, color: string) {
    return EventEmitter.emit('updateTrackItemColor', { appName, color });
}
