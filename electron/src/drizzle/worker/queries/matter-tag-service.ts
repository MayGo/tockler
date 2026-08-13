import { and, eq, gte, inArray, isNull, lte, ne, or } from 'drizzle-orm';
import { TrackItemType } from '../../../enums/track-item-type';
import { MatterMatchType } from '../../../enums/matter-match-type';
import { matters, matterTags } from '../../legalAid.schema';
import { trackItems } from '../../schema';
import { db } from '../db';

const logger = console;

// Only app/manual-log activity is matter-matchable; StatusTrackItem rows are system online/idle/offline state.
const MATCHABLE_TASK_NAMES = [TrackItemType.AppTrackItem, TrackItemType.LogTrackItem];

export interface MatchableTrackItem {
    id: number;
    app: string;
    title: string | null;
    url: string | null;
}

export interface ReviewItem {
    id: number;
    app: string;
    title: string | null;
    url: string | null;
    beginDate: number;
    endDate: number;
    matterId: number | null;
    matterCaseReference: string | null;
    matterClientName: string | null;
    matterColor: string | null;
    matchType: string | null;
    matchedText: string | null;
}

async function findTrackItemsPendingMatch(sinceMs: number): Promise<MatchableTrackItem[]> {
    const rows = await db
        .select({ id: trackItems.id, app: trackItems.app, title: trackItems.title, url: trackItems.url })
        .from(trackItems)
        .leftJoin(matterTags, eq(matterTags.trackItemId, trackItems.id))
        .where(
            and(
                inArray(trackItems.taskName, MATCHABLE_TASK_NAMES),
                gte(trackItems.endDate, sinceMs),
                isNull(matterTags.id),
            ),
        );

    return rows;
}

async function findTrackItemsForRematch(sinceMs: number): Promise<MatchableTrackItem[]> {
    const rows = await db
        .select({ id: trackItems.id, app: trackItems.app, title: trackItems.title, url: trackItems.url })
        .from(trackItems)
        .leftJoin(matterTags, eq(matterTags.trackItemId, trackItems.id))
        .where(
            and(
                inArray(trackItems.taskName, MATCHABLE_TASK_NAMES),
                gte(trackItems.endDate, sinceMs),
                or(isNull(matterTags.id), ne(matterTags.matchType, MatterMatchType.Manual)),
            ),
        );

    return rows;
}

async function upsertMatterTag(
    trackItemId: number,
    matterId: number | null,
    matchedText: string | null,
    matchType: MatterMatchType,
) {
    const now = Date.now();

    await db
        .insert(matterTags)
        .values({ trackItemId, matterId, matchedText, matchType, createdAt: now, updatedAt: now })
        .onConflictDoUpdate({
            target: matterTags.trackItemId,
            set: { matterId, matchedText, matchType, updatedAt: now },
        });
}

async function reassignMatterTag(trackItemId: number, matterId: number | null) {
    logger.debug('Reassigning matter tag:', trackItemId, matterId);
    await upsertMatterTag(trackItemId, matterId, null, MatterMatchType.Manual);
}

async function findReviewItems(from: number, to: number): Promise<ReviewItem[]> {
    const rows = await db
        .select({
            id: trackItems.id,
            app: trackItems.app,
            title: trackItems.title,
            url: trackItems.url,
            beginDate: trackItems.beginDate,
            endDate: trackItems.endDate,
            matterId: matters.id,
            matterCaseReference: matters.caseReference,
            matterClientName: matters.clientName,
            matterColor: matters.color,
            matchType: matterTags.matchType,
            matchedText: matterTags.matchedText,
        })
        .from(trackItems)
        .leftJoin(matterTags, eq(matterTags.trackItemId, trackItems.id))
        .leftJoin(matters, eq(matters.id, matterTags.matterId))
        .where(
            and(
                inArray(trackItems.taskName, MATCHABLE_TASK_NAMES),
                gte(trackItems.endDate, from),
                lte(trackItems.beginDate, to),
            ),
        )
        .orderBy(trackItems.beginDate);

    return rows.map((row) => ({ ...row, matterId: row.matterId ?? null }));
}

export const matterTagService = {
    findTrackItemsPendingMatch,
    findTrackItemsForRematch,
    upsertMatterTag,
    reassignMatterTag,
    findReviewItems,
};

export type MatterTagService = typeof matterTagService;
