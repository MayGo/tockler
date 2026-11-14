import { and, asc, desc, eq, gte, inArray, like, lte, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { State } from '../../../enums/state';
import { TrackItemType } from '../../../enums/track-item-type';
import { OrderByKey, orderByKey } from '../../query.utils';
import { NewTrackItem, TrackItem, trackItems } from '../../schema';
import { db } from '../db';

const DEFAULT_PAGE_SIZE = 20;

const logger = console;

async function createTrackItem(trackItemAttributes: NewTrackItem): Promise<TrackItem> {
    const result = await db.insert(trackItems).values(trackItemAttributes).returning();
    return result[0]!;
}

async function updateTrackItemDb(itemData: Partial<TrackItem>, id: number) {
    logger.debug('Updating track item:', id, itemData);

    const result = await db
        .update(trackItems)
        .set({
            app: itemData.app,
            title: itemData.title,
            url: itemData.url,
            color: itemData.color,
            beginDate: itemData.beginDate,
            endDate: itemData.endDate,
        })
        .where(eq(trackItems.id, id))
        .returning();

    return result.length;
}

async function findItemsForExport(from: string, to: string, taskName: string, searchStr: string) {
    const conditions = [
        eq(trackItems.taskName, taskName),
        gte(trackItems.endDate, new Date(from).getTime()),
        lte(trackItems.endDate, new Date(to).getTime()),
    ];

    if (searchStr) {
        conditions.push(like(trackItems.title, `%${searchStr}%`));
    }

    const results = await db
        .select()
        .from(trackItems)
        .where(and(...conditions));

    return results;
}

async function findAllItems(
    from: string,
    to: string,
    taskName: string,
    searchStr: string,
    paging: { limit: number; offset: number; sortByKey?: OrderByKey; sortByOrder?: 'asc' | 'desc' },
    sumTotal: boolean,
) {
    const conditions = [
        eq(trackItems.taskName, taskName),
        gte(trackItems.endDate, new Date(from).getTime()),
        lte(trackItems.endDate, new Date(to).getTime()),
    ];

    if (searchStr) {
        conditions.push(like(trackItems.title, `%${searchStr}%`));
    }

    const order = orderByKey[paging.sortByKey as OrderByKey] || trackItems.endDate;
    const orderByFn = paging.sortByOrder === 'desc' ? desc : asc;

    // Create query
    let query = db
        .select()
        .from(trackItems)
        .where(and(...conditions))
        .orderBy(orderByFn(order));

    // Execute query with limit and offset
    const data = await query.limit(paging.limit || DEFAULT_PAGE_SIZE).offset(paging.offset || 0);

    // Get total count of items matching the query
    const countResult = await db
        .select({ count: sql`COUNT(*)` })
        .from(trackItems)
        .where(and(...conditions));

    const totalCount = parseInt(countResult[0]?.count as string) || 0;

    if (sumTotal) {
        // Calculate total duration using sql template literal
        const totalResult = await db
            .select({
                totalMs: sql`SUM(${trackItems.endDate}/1000 - ${trackItems.beginDate}/1000)`,
            })
            .from(trackItems)
            .where(and(...conditions))
            .orderBy(orderByFn(order));
        const totalDuration = totalResult[0]?.totalMs || 0;

        return {
            data,
            total: totalCount,
            totalDuration: parseInt(totalDuration as string) * 1000, // Convert seconds to milliseconds
        };
    }

    return { data, total: totalCount };
}

async function findAllDayItemsDb(from: string, to: string, taskName: string) {
    console.log('findAllDayItems', from, to, taskName);

    const data = await db
        .select()
        .from(trackItems)
        .where(
            and(
                eq(trackItems.taskName, taskName),
                gte(trackItems.endDate, new Date(from).getTime()),
                lte(trackItems.endDate, new Date(to).getTime()),
            ),
        )
        .orderBy(asc(trackItems.beginDate));

    return data;
}

async function findFirstChunkLogItemsDb() {
    const items = await db
        .select({
            color: trackItems.color,
            app: trackItems.app,
            title: trackItems.title,
            beginDate: sql`MIN(${trackItems.beginDate})`,
            endDate: sql`MAX(${trackItems.endDate})`,
            totalDuration: sql`SUM(${trackItems.endDate} - ${trackItems.beginDate})`,
        })
        .from(trackItems)
        .where(eq(trackItems.taskName, TrackItemType.LogTrackItem))
        .groupBy(trackItems.app, trackItems.title)
        .orderBy(desc(trackItems.endDate))
        .limit(10);

    return items;
}

async function findFirstTrackItem() {
    return await db
        .select()
        .from(trackItems)
        .where(eq(trackItems.taskName, TrackItemType.AppTrackItem))
        .orderBy(trackItems.beginDate)
        .limit(1);
}

async function findLastOnlineItem() {
    const appName = State.Online;

    const results = await db
        .select()
        .from(trackItems)
        .where(and(eq(trackItems.app, appName), eq(trackItems.taskName, TrackItemType.StatusTrackItem)))
        .orderBy(desc(trackItems.endDate))
        .limit(1);

    return results[0];
}

async function updateTrackItemColor(appName: string, color: string) {
    await db.update(trackItems).set({ color }).where(eq(trackItems.app, appName));
}

async function findById(id: number) {
    const row = await db.select().from(trackItems).where(eq(trackItems.id, id));
    return row[0] as TrackItem | undefined;
}

async function deleteById(id: number) {
    logger.debug('Deleting track item:', id);

    await db.delete(trackItems).where(eq(trackItems.id, id));

    return id;
}

async function deleteByIds(ids: number[]) {
    logger.debug('Deleting track items:', ids);

    if (ids.length === 0) {
        return ids;
    }

    // Use transaction for better performance with bulk operations
    await db.delete(trackItems).where(inArray(trackItems.id, ids));

    return ids;
}

async function findAllFromLastHoursDb(hours: number) {
    const now = DateTime.now();

    const items = await db
        .select()
        .from(trackItems)
        .where(
            and(
                eq(trackItems.app, State.Online),
                eq(trackItems.taskName, TrackItemType.StatusTrackItem),
                gte(trackItems.endDate, now.minus({ hours }).toMillis()),
            ),
        )
        .orderBy(asc(trackItems.beginDate));

    return items;
}

export const trackItemService = {
    createTrackItem,
    updateTrackItemDb,
    findItemsForExport,
    findAllItems,
    findAllDayItemsDb,
    findFirstChunkLogItemsDb,
    findFirstTrackItem,
    findLastOnlineItem,
    updateTrackItemColor,
    findById,
    deleteById,
    deleteByIds,
    findAllFromLastHoursDb,
};

export type TrackItemService = typeof trackItemService;
