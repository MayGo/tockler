import { eq } from 'drizzle-orm';
import { NewTrackItem, TrackItem, trackItems } from '../../schema';
import { db } from '../db';
import { getAppColor } from './app-setting-service';
import { splitTrackItemAtMidnight } from './trackItem.db.util';

async function saveSplitItems(splitItems: NewTrackItem[], originalItem: NewTrackItem) {
    if (splitItems.length === 1) {
        // No splitting needed, insert as usual
        const query = db.insert(trackItems).values(originalItem);
        const result = await query.execute();
        return result.lastInsertRowid as number;
    } else {
        // Insert all split items
        console.warn(`Splitting track item into ${splitItems.length} parts at midnight boundaries`);
        const ids: number[] = [];

        for (const splitItem of splitItems) {
            const query = db.insert(trackItems).values(splitItem);
            const result = await query.execute();
            ids.push(result.lastInsertRowid as number);
        }

        // Return the ID of the last item
        return ids[ids.length - 1];
    }
}

export async function updateTrackItemInternal(id: number, appName: string, item: Partial<TrackItem>) {
    console.warn('Updating end date of current log item');

    const color = await getAppColor(appName);
    item.color = color;

    const query = db.update(trackItems).set(item).where(eq(trackItems.id, id));
    await query.execute();
}

export async function insertTrackItemInternal(item: NewTrackItem) {
    console.warn('Inserting new track item:', item);

    const color = await getAppColor(item.app ?? '');
    item.color = color;

    const splitItems = splitTrackItemAtMidnight({ ...item });
    const id = await saveSplitItems(splitItems, item);

    return id;
}

export async function insertNewLogTrackItem(item: NewTrackItem) {
    console.warn('Inserting new log item');

    const splitItems = splitTrackItemAtMidnight({ ...item });
    const id = await saveSplitItems(splitItems, item);

    return id;
}

export const trackItemDb = {
    updateTrackItemInternal,
    insertTrackItemInternal,
    insertNewLogTrackItem,
};

export type TrackItemDb = typeof trackItemDb;
