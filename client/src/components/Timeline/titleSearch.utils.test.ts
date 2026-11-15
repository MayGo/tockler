import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import {
    getMergedDurationMs,
    matchesLast,
    matchesTitleKeyword,
    normalizeKeyword,
    titleHighlightBarStyle,
} from './titleSearch.utils';

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

    it('puts matching items last', () => {
        const items = [{ title: 'Roblox' }, { title: 'Code' }, { title: 'Roblox Studio' }, { title: 'Chrome' }];
        expect(matchesLast(items, 'roblox').map((i) => i.title)).toEqual(['Code', 'Chrome', 'Roblox', 'Roblox Studio']);
        expect(matchesLast(items, '')).toBe(items);
    });

    it('greys out non-matching bars and outlines matching ones', () => {
        const style = titleHighlightBarStyle('roblox', { isDark: false, stroke: 'white', strokeWidth: 0.5 });
        const match = { datum: { title: 'Roblox Studio', color: '#ff00ff' } };
        const other = { datum: { title: 'Code', color: '#00ff00' } };

        expect([style.fill(match), style.stroke(match), style.strokeWidth(match)]).toEqual(['#ff00ff', '#d97706', 2]);
        expect([style.fill(other), style.stroke(other), style.strokeWidth(other)]).toEqual(['#cbd5e0', 'white', 0.5]);
    });

    it('leaves bars unchanged without a keyword', () => {
        const style = titleHighlightBarStyle('', { isDark: true, stroke: 'black', strokeWidth: 0.5 });
        const bar = { datum: { title: 'Code', color: '#00ff00' } };

        expect([style.fill(bar), style.fillOpacity(bar), style.stroke(bar), style.strokeWidth(bar)]).toEqual([
            '#00ff00',
            1,
            'black',
            0.5,
        ]);
    });
});
