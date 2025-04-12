import { first, orderBy } from 'lodash';
import { DateTime } from 'luxon';
import { dbClient } from '../../drizzle/dbClient';
import { getOngoingStatusTrackItem } from '../watchTrackItems/watchAndSetStatusTrackItem';

const MINUTE = 60 * 1000;

const getBeginEndDiff = (beginDate: DateTime, endDate: DateTime) => {
    return endDate.diff(beginDate).milliseconds;
};

const groupByBreaks = (items: any[], minBreakTime: number) => {
    let newItems: any[] = [];
    let olderItem: any;

    const groups: any[][] = [];

    items.forEach((currentItem) => {
        if (olderItem) {
            const diff = getBeginEndDiff(
                DateTime.fromMillis(currentItem.endDate),
                DateTime.fromMillis(olderItem.beginDate),
            );
            const hasHadBreak = diff / MINUTE > minBreakTime;

            if (hasHadBreak) {
                groups.push(newItems);
                newItems = [];
            }
        }
        newItems.push(currentItem);
        olderItem = currentItem;
    });
    groups.push(newItems);
    return groups;
};

export async function getCurrentSessionDuration(minBreakTime: number) {
    const hours = 24;
    const now = DateTime.now();

    const items = await dbClient.findAllFromLastHoursDb(hours);
    const ongoingStatusItem = await getOngoingStatusTrackItem();
    if (ongoingStatusItem) {
        items.push(ongoingStatusItem);
    }

    const sorted = orderBy(items, ['beginDate'], ['desc']);

    if (sorted.length === 0) {
        return 0;
    }

    // Check if current break exceeds minBreakTime
    if (getBeginEndDiff(DateTime.fromMillis(first(sorted)?.endDate || 0), now) / MINUTE >= minBreakTime) {
        return 0;
    }

    const groups = groupByBreaks(sorted, minBreakTime);

    if (groups.length === 0) {
        return 0;
    }

    // Get the first (most recent) group and sum its durations
    const currentSession = groups[0];
    const totalDuration = currentSession.reduce((total, item) => {
        const duration = getBeginEndDiff(DateTime.fromMillis(item.beginDate), DateTime.fromMillis(item.endDate));
        return total + duration;
    }, 0);

    return totalDuration as number;
}
