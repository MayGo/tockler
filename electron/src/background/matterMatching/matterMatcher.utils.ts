import { MatterMatchType } from '../../enums/matter-match-type';

export interface MatchableItem {
    title?: string | null;
    url?: string | null;
}

export interface MatterForMatching {
    id: number;
    caseReference: string;
    keywords: string[];
    archived?: boolean;
}

export interface MatterMatchResult {
    matterId: number;
    matchedText: string;
    matchType: MatterMatchType.CaseReference | MatterMatchType.Keyword;
}

function normalize(value: string): string {
    return value.toLowerCase().trim();
}

function buildHaystack(item: MatchableItem): string {
    return normalize(`${item.title || ''} ${item.url || ''}`);
}

/**
 * Simple, deterministic string matching — no AI/fuzzy scoring yet (Phase 1).
 * A case-reference substring match always wins over a keyword match, since it's
 * the more specific/reliable signal. Among equally-specific matches, the first
 * matter in the given list order wins.
 */
export function matchItemToMatter(item: MatchableItem, candidateMatters: MatterForMatching[]): MatterMatchResult | null {
    const haystack = buildHaystack(item);
    if (!haystack) {
        return null;
    }

    const activeMatters = candidateMatters.filter((matter) => !matter.archived);

    for (const matter of activeMatters) {
        const caseReference = normalize(matter.caseReference || '');
        if (caseReference && haystack.includes(caseReference)) {
            return { matterId: matter.id, matchedText: matter.caseReference, matchType: MatterMatchType.CaseReference };
        }
    }

    for (const matter of activeMatters) {
        for (const keyword of matter.keywords || []) {
            const normalizedKeyword = normalize(keyword || '');
            if (normalizedKeyword && haystack.includes(normalizedKeyword)) {
                return { matterId: matter.id, matchedText: keyword, matchType: MatterMatchType.Keyword };
            }
        }
    }

    return null;
}
