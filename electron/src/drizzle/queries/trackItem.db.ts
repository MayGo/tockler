import { TrackItem } from '../schema';

import { trackItems } from '../schema';

import { eq } from 'drizzle-orm';
import { db } from '../db';
import { NewTrackItem } from '../schema';
import { appSettingService } from './app-setting-service';

export async function updateTrackItem(id: number, appName: string, item: Partial<TrackItem>) {
    console.warn('Updating end date of current log item');

    const color = await appSettingService.getAppColor(appName);
    item.color = color;

    const query = db.update(trackItems).set(item).where(eq(trackItems.id, id));
    await query.execute();
}

export async function insertTrackItem(item: NewTrackItem) {
    console.warn('Inserting new log item');

    const color = await appSettingService.getAppColor(item.app ?? '');
    item.color = color;

    const query = db.insert(trackItems).values(item);
    const result = await query.execute();

    return result.lastInsertRowid as number;
}

export async function insertNewLogTrackItem(item: NewTrackItem) {
    console.warn('Inserting new log item');
    const result = await db.insert(trackItems).values(item).execute();
    return result.lastInsertRowid as number;
}
