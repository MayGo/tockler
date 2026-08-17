import { describe, expect, it } from 'vitest';

import { MatterMatchType } from '../enums/matter-match-type';
import { matchItemToMatter, MatterForMatching } from '../background/matterMatching/matterMatcher.utils';

const matters: MatterForMatching[] = [
    { id: 1, caseReference: 'PA-63550-2025', clientName: 'Smith', keywords: ['Smith v Jones', 'housing disrepair'] },
    { id: 2, caseReference: 'PA-11111-2024', clientName: 'Jones', keywords: ['legal aid app'] },
    {
        id: 3,
        caseReference: 'PA-ARCHIVED-2023',
        clientName: 'Old Client',
        keywords: ['archived matter'],
        archived: true,
    },
];

describe('matchItemToMatter', () => {
    it('matches on case reference substring, case-insensitively', () => {
        const result = matchItemToMatter({ title: 'pa-63550-2025 - Draft letter.docx - Word' }, matters);

        expect(result).toEqual({ matterId: 1, matchedText: 'PA-63550-2025', matchType: MatterMatchType.CaseReference });
    });

    it('matches a case reference despite different punctuation/spacing', () => {
        const result = matchItemToMatter({ title: 'PA/63550/2025 - Draft letter.docx - Word' }, matters);

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

    it('matches on the client name verbatim, even without a matching keyword', () => {
        const result = matchItemToMatter({ title: 'Smith - correspondence.docx - Word' }, matters);

        expect(result).toEqual({ matterId: 1, matchedText: 'Smith', matchType: MatterMatchType.Keyword });
    });

    it('prefers a case reference match over a keyword match', () => {
        const result = matchItemToMatter({ title: 'legal aid app - PA-11111-2024 correspondence' }, matters);

        expect(result?.matchType).toBe(MatterMatchType.CaseReference);
        expect(result?.matterId).toBe(2);
    });

    it('matches against the url as well as the title', () => {
        const result = matchItemToMatter({ title: 'Chrome', url: 'https://example.com/PA-63550-2025/docs' }, matters);

        expect(result?.matterId).toBe(1);
    });

    it('falls back to a hint on partial keyword word-overlap', () => {
        // Only "disrepair" out of the "housing disrepair" keyword is present — not a full match.
        const result = matchItemToMatter({ title: 'disrepair notes.docx - Word' }, matters);

        expect(result).toEqual({ matterId: 1, matchedText: 'housing disrepair', matchType: MatterMatchType.Hint });
    });

    it('flags a reference-shaped string with no matching matter as a hint with no matter suggestion', () => {
        const result = matchItemToMatter({ title: 'IM/99999/2025 - unfiled correspondence' }, matters);

        expect(result).toEqual({ matterId: null, matchedText: 'IM/99999/2025', matchType: MatterMatchType.Hint });
    });

    it('ignores archived matters at every tier', () => {
        expect(matchItemToMatter({ title: 'archived matter case file' }, matters)).toBeNull();
        expect(matchItemToMatter({ title: 'PA-ARCHIVED-2023 file' }, matters)).toBeNull();
        expect(matchItemToMatter({ title: 'Old Client file' }, matters)).toBeNull();
    });

    it('returns null when nothing matches at all', () => {
        const result = matchItemToMatter({ title: 'Unrelated window title' }, matters);

        expect(result).toBeNull();
    });

    it('returns null for an empty/blank item', () => {
        const result = matchItemToMatter({ title: '   ' }, matters);

        expect(result).toBeNull();
    });
});
