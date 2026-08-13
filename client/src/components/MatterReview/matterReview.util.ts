import { DateTime } from 'luxon';
import { IMatterReviewItem } from '../../@types/IMatterReviewItem';

export interface TitleGroup {
    key: string;
    title: string;
    app: string;
    durationMs: number;
    trackItemIds: number[];
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
            };
            matterGroup.titles.push(titleGroup);
        }
        titleGroup.durationMs += duration;
        titleGroup.trackItemIds.push(item.id);
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
