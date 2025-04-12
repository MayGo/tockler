import moment from 'moment';
import { TrackItem } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { logManager } from '../utils/log-manager';
import { getOngoingAppTrackItem } from './watchTrackItems/watchAndSetAppTrackItem';
import { getOngoingLogTrackItem } from './watchTrackItems/watchAndSetLogTrackItem';
import { getOngoingStatusTrackItem } from './watchTrackItems/watchAndSetStatusTrackItem';

const logger = logManager.getLogger('Background');

export async function getLastItemsAll({ to, taskName }: { from: string; to: string; taskName: string }) {
    const isToday = moment(to).isSame(moment(), 'day');
    const data: TrackItem[] = [];

    if (isToday && taskName === TrackItemType.StatusTrackItem) {
        logger.debug('Adding ongoing status track item.');
        const ongoingStatusItem = await getOngoingStatusTrackItem();
        if (ongoingStatusItem) {
            data.push(ongoingStatusItem);
        }
    }

    if (isToday && taskName === TrackItemType.AppTrackItem) {
        logger.debug('Adding ongoing app track item.');
        const ongoingAppItem = await getOngoingAppTrackItem();
        if (ongoingAppItem) {
            data.push(ongoingAppItem);
        }
    }

    if (isToday && taskName === TrackItemType.LogTrackItem) {
        logger.debug('Adding ongoing log track item.');
        const ongoingLogItem = await getOngoingLogTrackItem();
        if (ongoingLogItem) {
            data.push(ongoingLogItem);
        }
    }

    return data;
}

export async function getOngoingItemWithDuration() {
    const ongoingLogItem = await getOngoingLogTrackItem();
    if (ongoingLogItem) {
        return {
            ...ongoingLogItem,
            beginDate: ongoingLogItem.beginDate,
            endDate: ongoingLogItem.endDate,
            totalDuration: ongoingLogItem.endDate - ongoingLogItem.beginDate,
        };
    }
    return null;
}
