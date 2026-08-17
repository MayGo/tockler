import { DateTime } from 'luxon';
import { IMatterReviewItem } from '../../@types/IMatterReviewItem';
import { MatterMatchType } from '../../enum/MatterMatchType';

export interface TitleGroup {
    key: string;
    title: string;
    app: string;
    durationMs: number;
    trackItemIds: number[];
    // The lowest-confidence matchType among constituent items (or 'manual' if any item
    // was manually set) — used to badge the row. matchedText is the signal that
    // produced it, shown for hint-tier rows so a reviewer knows what to look for.
    matchType: string | null;
    matchedText: string | null;
}

// Worst-case wins so a mixed group still surfaces its least-certain member; 'manual'
// always wins outright since a human already confirmed the whole group.
const CONFIDENCE_RANK: Record<string, number> = {
    [MatterMatchType.CaseReference]: 3,
    [MatterMatchType.Keyword]: 2,
    [MatterMatchType.Hint]: 1,
    [MatterMatchType.None]: 0,
};

function mergeMatchInfo(
    current: { matchType: string | null; matchedText: string | null },
    item: IMatterReviewItem,
): { matchType: string | null; matchedText: string | null } {
    if (current.matchType === MatterMatchType.Manual) {
        return current;
    }
    if (item.matchType === MatterMatchType.Manual) {
        return { matchType: MatterMatchType.Manual, matchedText: null };
    }

    const currentRank = current.matchType ? (CONFIDENCE_RANK[current.matchType] ?? 0) : Infinity;
    const itemRank = item.matchType ? (CONFIDENCE_RANK[item.matchType] ?? 0) : Infinity;

    return itemRank < currentRank ? { matchType: item.matchType, matchedText: item.matchedText } : current;
}

export interface MatterGroup {
    matterId: number | null;
    matterLabel: string;
    matterColor: string | null;
    durationMs: number;
    titles: TitleGroup[];
}

export interface DayGroup {
    dayKey: string; // yyyy-MM-dd
    dayLabel: string;
    durationMs: number;
    matterGroups: MatterGroup[];
}

function matterLabelFor(item: IMatterReviewItem): string {
    if (item.matterId && item.matterCaseReference) {
        return `${item.matterCaseReference} — ${item.matterClientName}`;
    }
    return 'Unmatched';
}

// Groups flat review rows into Day > Matter > distinct-window-title, summing durations at each level.
// Pure/no I/O so it's easy to unit test and to re-derive whenever the underlying review items change.
export function groupReviewItems(items: IMatterReviewItem[]): DayGroup[] {
    const dayMap = new Map<string, Map<string, MatterGroup>>();
    const dayOrder: string[] = [];

    for (const item of items) {
        const duration = Math.max(0, item.endDate - item.beginDate);
        const dayKey = DateTime.fromMillis(item.beginDate).toFormat('yyyy-MM-dd');

        if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, new Map());
            dayOrder.push(dayKey);
        }
        const matterMap = dayMap.get(dayKey)!;

        const matterKey = item.matterId ? String(item.matterId) : 'unmatched';

        if (!matterMap.has(matterKey)) {
            matterMap.set(matterKey, {
                matterId: item.matterId,
                matterLabel: matterLabelFor(item),
                matterColor: item.matterColor,
                durationMs: 0,
                titles: [],
            });
        }
        const matterGroup = matterMap.get(matterKey)!;
        matterGroup.durationMs += duration;

        const titleKey = `${item.app}::${item.title || ''}`;
        let titleGroup = matterGroup.titles.find((t) => t.key === titleKey);
        if (!titleGroup) {
            titleGroup = {
                key: titleKey,
                title: item.title || '(untitled)',
                app: item.app,
                durationMs: 0,
                trackItemIds: [],
                matchType: null,
                matchedText: null,
            };
            matterGroup.titles.push(titleGroup);
        }
        titleGroup.durationMs += duration;
        titleGroup.trackItemIds.push(item.id);

        const merged = mergeMatchInfo(titleGroup, item);
        titleGroup.matchType = merged.matchType;
        titleGroup.matchedText = merged.matchedText;
    }

    return dayOrder
        .map((dayKey) => {
            const matterMap = dayMap.get(dayKey)!;
            const matterGroups = Array.from(matterMap.values()).sort((a, b) => b.durationMs - a.durationMs);
            matterGroups.forEach((matterGroup) => matterGroup.titles.sort((a, b) => b.durationMs - a.durationMs));

            const durationMs = matterGroups.reduce((sum, matterGroup) => sum + matterGroup.durationMs, 0);

            return {
                dayKey,
                dayLabel: DateTime.fromFormat(dayKey, 'yyyy-MM-dd').toFormat('cccc, dd LLL yyyy'),
                durationMs,
                matterGroups,
            };
        })
        .sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
}
