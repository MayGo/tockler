import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { getMergedDurationMs, matchesTitleKeyword, normalizeKeyword } from './titleSearch.utils';

const at = (time: string) => DateTime.fromISO(`2021-06-19T${time}:00.000Z`).toMillis();

const item = (id: number, begin: string, end: string) => ({
    id,
    app: 'Test',
    beginDate: at(begin),
    endDate: at(end),
});

const MINUTE = 60 * 1000;

describe('titleSearch utils', () => {
    it('matches title case-insensitively', () => {
        const keyword = normalizeKeyword('  Roblox ');
        expect(matchesTitleKeyword({ title: 'Build Tycoon - Roblox Studio' }, keyword)).toBe(true);
        expect(matchesTitleKeyword({ title: 'worldUi.ts' }, keyword)).toBe(false);
        expect(matchesTitleKeyword({ title: undefined }, keyword)).toBe(false);
    });

    it('matches nothing for an empty keyword', () => {
        expect(matchesTitleKeyword({ title: 'anything' }, normalizeKeyword('   '))).toBe(false);
    });

    it('sums disjoint items', () => {
        const range = [DateTime.fromMillis(at('17:00')), DateTime.fromMillis(at('19:00'))];
        const items = [item(1, '17:00', '17:10'), item(2, '18:00', '18:05')];
        expect(getMergedDurationMs(items, range)).toBe(15 * MINUTE);
    });

    it('counts overlapping items once', () => {
        const range = [DateTime.fromMillis(at('17:00')), DateTime.fromMillis(at('19:00'))];
        const items = [item(1, '17:00', '17:30'), item(2, '17:20', '17:40'), item(3, '17:25', '17:35')];
        expect(getMergedDurationMs(items, range)).toBe(40 * MINUTE);
    });

    it('clamps items to the range', () => {
        const range = [DateTime.fromMillis(at('17:00')), DateTime.fromMillis(at('18:00'))];
        const items = [item(1, '16:50', '17:10'), item(2, '17:55', '18:30'), item(3, '19:00', '19:10')];
        expect(getMergedDurationMs(items, range)).toBe(15 * MINUTE);
    });
});
