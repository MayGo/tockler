import { describe, expect, it } from 'vitest';

import { MatterMatchType } from '../enums/matter-match-type';
import { matchItemToMatter, MatterForMatching } from '../background/matterMatching/matterMatcher.utils';

const matters: MatterForMatching[] = [
    { id: 1, caseReference: 'PA-63550-2025', keywords: ['Smith v Jones', 'housing disrepair'] },
    { id: 2, caseReference: 'PA-11111-2024', keywords: ['legal aid app'] },
    { id: 3, caseReference: 'PA-ARCHIVED-2023', keywords: ['archived matter'], archived: true },
];

describe('matchItemToMatter', () => {
    it('matches on case reference substring, case-insensitively', () => {
        const result = matchItemToMatter({ title: 'pa-63550-2025 - Draft letter.docx - Word' }, matters);

        expect(result).toEqual({ matterId: 1, matchedText: 'PA-63550-2025', matchType: MatterMatchType.CaseReference });
    });

    it('matches on a keyword when no case reference is present', () => {
        const result = matchItemToMatter({ title: 'Smith v Jones - hearing bundle.pdf' }, matters);

        expect(result).toEqual({
            matterId: 1,
            matchedText: 'Smith v Jones',
            matchType: MatterMatchType.Keyword,
        });
    });

    it('prefers a case reference match over a keyword match', () => {
        const result = matchItemToMatter(
            { title: 'legal aid app - PA-11111-2024 correspondence' },
            matters,
        );

        expect(result?.matchType).toBe(MatterMatchType.CaseReference);
        expect(result?.matterId).toBe(2);
    });

    it('matches against the url as well as the title', () => {
        const result = matchItemToMatter({ title: 'Chrome', url: 'https://example.com/PA-63550-2025/docs' }, matters);

        expect(result?.matterId).toBe(1);
    });

    it('ignores archived matters', () => {
        const result = matchItemToMatter({ title: 'archived matter case file' }, matters);

        expect(result).toBeNull();
    });

    it('returns null when nothing matches', () => {
        const result = matchItemToMatter({ title: 'Unrelated window title' }, matters);

        expect(result).toBeNull();
    });

    it('returns null for an empty/blank item', () => {
        const result = matchItemToMatter({ title: '   ' }, matters);

        expect(result).toBeNull();
    });
});
