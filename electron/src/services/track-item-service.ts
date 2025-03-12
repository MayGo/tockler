import { stringify } from 'csv-stringify/sync';
import { and, desc, eq, gte, inArray, like, lt, sql } from 'drizzle-orm';
import { dialog } from 'electron';
import { writeFileSync } from 'fs';
import moment from 'moment';
import { db } from '../drizzle/db';
import { NewTrackItem, TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { logManager } from '../log-manager';

const DEFAULT_PAGE_SIZE = 20;

export class TrackItemService {
    logger = logManager.getLogger('TrackItemService');

    async createTrackItem(trackItemAttributes: NewTrackItem): Promise<TrackItem> {
        const result = await db.insert(trackItems).values(trackItemAttributes).returning();
        return result[0]!;
    }

    async updateTrackItem(itemData: Partial<TrackItem>, id: number) {
        this.logger.debug('Updating track item:', id, itemData);

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

    async findAndExportAllItems(from: string, to: string, taskName: string, searchStr: string) {
        const conditions = [
            eq(trackItems.taskName, taskName),
            gte(trackItems.endDate, new Date(from).getTime()),
            lt(trackItems.endDate, new Date(to).getTime()),
        ];

        if (searchStr) {
            conditions.push(like(trackItems.title, `%${searchStr}%`));
        }

        const toDateStr = (timestamp: string) => moment(timestamp).format('YYYY-MM-DD');
        const toDateTimeStr = (timestamp: string) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

        const results = await db
            .select()
            .from(trackItems)
            .where(and(...conditions));

        const csvContent = stringify(results, {
            delimiter: ';',
            cast: {
                number: function (value, { column }) {
                    if (['endDate', 'beginDate'].includes(column?.toString() || '')) {
                        return toDateTimeStr(value.toString());
                    }
                    return value?.toString();
                },
            },
            header: true,
        });

        const defaultPath = `Tockler_${taskName}_${toDateStr(from)}-${toDateStr(to)}.csv`;

        dialog
            .showSaveDialog({
                title: 'Save export as',
                defaultPath: defaultPath,
                filters: [
                    { name: 'CSV', extensions: ['csv'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            })
            .then(({ filePath }) => {
                if (filePath) {
                    writeFileSync(filePath, csvContent);
                }
            });

        return results;
    }

    async findAllItems(
        from: string,
        to: string,
        taskName: string,
        searchStr: string,
        paging: { limit: number; offset: number },
        sumTotal: boolean,
    ) {
        const conditions = [
            eq(trackItems.taskName, taskName),
            gte(trackItems.endDate, new Date(from).getTime()),
            lt(trackItems.endDate, new Date(to).getTime()),
        ];

        if (searchStr) {
            conditions.push(like(trackItems.title, `%${searchStr}%`));
        }

        const data = await db
            .select()
            .from(trackItems)
            .where(and(...conditions))
            .orderBy(trackItems.beginDate)
            .limit(paging.limit || DEFAULT_PAGE_SIZE)
            .offset(paging.offset || 0);

        if (sumTotal) {
            // Calculate total duration using sql template literal
            const totalResult = await db
                .select({
                    totalMs: sql`SUM(${trackItems.endDate}/1000 - ${trackItems.beginDate}/1000)`,
                })
                .from(trackItems)
                .where(and(...conditions));
            const total = totalResult[0]?.totalMs || 0;

            return { data, total: parseInt(total as string) * 1000 }; // Convert seconds to milliseconds
        }

        return { data, total: data.length };
    }

    async findAllDayItems(from: string, to: string, taskName: string) {
        console.log('findAllDayItems', from, to, taskName);

        const data = await db
            .select()
            .from(trackItems)
            .where(
                and(
                    eq(trackItems.taskName, taskName),
                    gte(trackItems.endDate, new Date(from).getTime()),
                    lt(trackItems.endDate, new Date(to).getTime()),
                ),
            );

        return data;
    }
    async findFirstChunkLogItems() {
        return await db
            .select()
            .from(trackItems)
            .where(eq(trackItems.taskName, TrackItemType.LogTrackItem))
            .orderBy(desc(trackItems.beginDate))
            .limit(100);
    }

    async findFirstTrackItem() {
        return await db
            .select()
            .from(trackItems)
            .where(eq(trackItems.taskName, TrackItemType.AppTrackItem))
            .orderBy(trackItems.beginDate)
            .limit(1);
    }

    async findLastOnlineItem() {
        const appName = State.Online;

        const results = await db
            .select()
            .from(trackItems)
            .where(and(eq(trackItems.app, appName), eq(trackItems.taskName, TrackItemType.StatusTrackItem)))
            .orderBy(desc(trackItems.endDate))
            .limit(1);

        return results[0];
    }

    async updateTrackItemColor(appName: string, color: string) {
        await db.update(trackItems).set({ color }).where(eq(trackItems.app, appName));
    }

    async findById(id: number) {
        const row = await db.select().from(trackItems).where(eq(trackItems.id, id));
        return row[0] as TrackItem | undefined;
    }

    async deleteById(id: number) {
        this.logger.debug('Deleting track item:', id);

        await db.delete(trackItems).where(eq(trackItems.id, id));

        return id;
    }

    async deleteByIds(ids: number[]) {
        this.logger.debug('Deleting track items:', ids);

        if (ids.length === 0) {
            return ids;
        }

        // Use transaction for better performance with bulk operations
        await db.delete(trackItems).where(inArray(trackItems.id, ids));

        return ids;
    }

    async findRunningLogItem() {
        const results = await db
            .select()
            .from(trackItems)
            .where(
                and(
                    eq(trackItems.taskName, TrackItemType.LogTrackItem),
                    eq(trackItems.endDate, new Date('9999-12-31T23:59:59.999Z').getTime()),
                ),
            );

        return results[0];
    }
}

export const trackItemService = new TrackItemService();
