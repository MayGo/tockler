import { describe, expect, it } from 'vitest';
import { IMatterReviewItem } from '../../@types/IMatterReviewItem';
import { groupReviewItems } from './matterReview.util';

function makeItem(overrides: Partial<IMatterReviewItem>): IMatterReviewItem {
    return {
        id: 1,
        app: 'Code',
        title: 'file.ts',
        url: null,
        beginDate: 0,
        endDate: 0,
        matterId: null,
        matterCaseReference: null,
        matterClientName: null,
        matterColor: null,
        matchType: null,
        matchedText: null,
        ...overrides,
    };
}

const day1 = new Date('2026-08-10T09:00:00Z').getTime();
const day2 = new Date('2026-08-11T09:00:00Z').getTime();

describe('groupReviewItems', () => {
    it('groups items by day, then matter, then distinct window title', () => {
        const items: IMatterReviewItem[] = [
            makeItem({
                id: 1,
                title: 'PA-63550-2025 letter.docx',
                beginDate: day1,
                endDate: day1 + 60_000,
                matterId: 1,
                matterCaseReference: 'PA-63550-2025',
                matterClientName: 'Smith',
            }),
            makeItem({
                id: 2,
                title: 'PA-63550-2025 letter.docx',
                beginDate: day1 + 60_000,
                endDate: day1 + 120_000,
                matterId: 1,
                matterCaseReference: 'PA-63550-2025',
                matterClientName: 'Smith',
            }),
            makeItem({ id: 3, title: 'Unrelated window', beginDate: day1, endDate: day1 + 30_000 }),
            makeItem({ id: 4, title: 'Other day item', beginDate: day2, endDate: day2 + 10_000 }),
        ];

        const result = groupReviewItems(items);

        expect(result).toHaveLength(2);
        // Most recent day first
        expect(result[0].dayKey).toBe('2026-08-11');
        expect(result[1].dayKey).toBe('2026-08-10');

        const day1Group = result[1];
        expect(day1Group.durationMs).toBe(150_000);
        expect(day1Group.matterGroups).toHaveLength(2);

        const smithMatter = day1Group.matterGroups.find((m) => m.matterId === 1)!;
        expect(smithMatter.matterLabel).toBe('PA-63550-2025 — Smith');
        expect(smithMatter.durationMs).toBe(120_000);
        expect(smithMatter.titles).toHaveLength(1);
        expect(smithMatter.titles[0].trackItemIds).toEqual([1, 2]);

        const unmatched = day1Group.matterGroups.find((m) => m.matterId === null)!;
        expect(unmatched.matterLabel).toBe('Unmatched');
        expect(unmatched.durationMs).toBe(30_000);
    });

    it('returns an empty array for no items', () => {
        expect(groupReviewItems([])).toEqual([]);
    });

    it('takes the worst-case matchType/matchedText across a mixed group', () => {
        const items: IMatterReviewItem[] = [
            makeItem({
                id: 1,
                title: 'shared title',
                beginDate: day1,
                endDate: day1 + 60_000,
                matterId: 1,
                matterCaseReference: 'PA-63550-2025',
                matterClientName: 'Smith',
                matchType: 'keyword',
                matchedText: 'Smith',
            }),
            makeItem({
                id: 2,
                title: 'shared title',
                beginDate: day1 + 60_000,
                endDate: day1 + 120_000,
                matterId: 1,
                matterCaseReference: 'PA-63550-2025',
                matterClientName: 'Smith',
                matchType: 'hint',
                matchedText: 'housing disrepair',
            }),
        ];

        const result = groupReviewItems(items);
        const titleGroup = result[0].matterGroups[0].titles[0];

        expect(titleGroup.matchType).toBe('hint');
        expect(titleGroup.matchedText).toBe('housing disrepair');
    });

    it('lets a manual tag override any other matchType in the group', () => {
        const items: IMatterReviewItem[] = [
            makeItem({
                id: 1,
                title: 'shared title',
                beginDate: day1,
                endDate: day1 + 60_000,
                matterId: 1,
                matchType: 'caseRef',
                matchedText: 'PA-63550-2025',
            }),
            makeItem({
                id: 2,
                title: 'shared title',
                beginDate: day1 + 60_000,
                endDate: day1 + 120_000,
                matterId: 1,
                matchType: 'manual',
                matchedText: null,
            }),
        ];

        const result = groupReviewItems(items);
        const titleGroup = result[0].matterGroups[0].titles[0];

        expect(titleGroup.matchType).toBe('manual');
        expect(titleGroup.matchedText).toBeNull();
    });

    it('carries a hint matchedText through for an unmatched item so the reason is visible', () => {
        const items: IMatterReviewItem[] = [
            makeItem({
                id: 1,
                title: 'IM/99999/2025 - unfiled',
                beginDate: day1,
                endDate: day1 + 60_000,
                matterId: null,
                matchType: 'hint',
                matchedText: 'IM/99999/2025',
            }),
        ];

        const result = groupReviewItems(items);
        const titleGroup = result[0].matterGroups[0].titles[0];

        expect(titleGroup.matchType).toBe('hint');
        expect(titleGroup.matchedText).toBe('IM/99999/2025');
    });
});
