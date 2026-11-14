import { describe, expect, it } from 'vitest';
import { containsAllWords } from './TrackItemTable.utils';

describe('containsAllWords', () => {
    it('matches case-insensitively', () => {
        expect(containsAllWords('Build Tycoon - Roblox Studio', 'roblox')).toBe(true);
    });

    it('requires every word, in any order', () => {
        expect(containsAllWords('Build Tycoon - Roblox Studio', 'studio build')).toBe(true);
        expect(containsAllWords('Build Tycoon - Roblox Studio', 'studio youtube')).toBe(false);
    });

    it('ignores extra whitespace and treats empty queries as a match', () => {
        expect(containsAllWords('worldUi.ts', '   ')).toBe(true);
        expect(containsAllWords('worldUi.ts', '  worldui  ')).toBe(true);
    });

    it('handles missing values', () => {
        expect(containsAllWords(undefined, 'x')).toBe(false);
        expect(containsAllWords(null, '')).toBe(true);
    });
});
