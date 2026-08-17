import { MatterMatchType } from '../../enums/matter-match-type';

export interface MatchableItem {
    title?: string | null;
    url?: string | null;
}

export interface MatterForMatching {
    id: number;
    caseReference: string;
    clientName: string;
    keywords: string[];
    archived?: boolean;
}

export interface MatterMatchResult {
    // null only for a Hint result where a reference-shaped string was spotted but
    // didn't match any known matter — there's no matter to suggest, just a signal
    // worth surfacing for manual review.
    matterId: number | null;
    matchedText: string;
    matchType: MatterMatchType.CaseReference | MatterMatchType.Keyword | MatterMatchType.Hint;
}

// Common UK legal-aid-style case-reference shapes. Heuristic and not exhaustive —
// safe to extend as real-world titles turn up false negatives.
const REFERENCE_PATTERNS: RegExp[] = [
    /\b\d{3,4}[/-]\d{6}\b/g, // UFN-style, e.g. 0801/123456
    /\b[A-Za-z]{1,3}[/-]\d{4,6}[/-]\d{4}\b/g, // e.g. PA-12345-2025, IM/12345/2025
];

const MIN_WORD_LENGTH_FOR_FUZZY = 4;
const FUZZY_OVERLAP_THRESHOLD = 0.5;

function normalizeLoose(value: string): string {
    return value.toLowerCase().trim();
}

// Strips everything but letters/digits so formatting differences (dashes, slashes,
// spaces) between a stored case reference and however it appears in a title don't
// cause a miss — "PA-63550-2025", "PA 63550 2025" and "PA/63550/2025" all normalize
// to the same string.
function normalizeReference(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildHaystack(item: MatchableItem): string {
    return `${item.title || ''} ${item.url || ''}`;
}

function extractReferenceCandidates(text: string): string[] {
    const candidates = new Set<string>();
    for (const pattern of REFERENCE_PATTERNS) {
        const matches = text.match(pattern) || [];
        matches.forEach((match) => candidates.add(match));
    }
    return Array.from(candidates);
}

function wordsOf(phrase: string): string[] {
    return normalizeLoose(phrase)
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= MIN_WORD_LENGTH_FOR_FUZZY);
}

// Fraction of `phrase`'s significant words that appear somewhere in `haystackWords`.
// Only used for the hint tier — a full/contiguous match is already caught earlier.
function wordOverlapScore(phrase: string, haystackWords: Set<string>): number {
    const words = wordsOf(phrase);
    if (words.length === 0) {
        return 0;
    }
    const matched = words.filter((word) => haystackWords.has(word)).length;
    return matched / words.length;
}

/**
 * Deterministic string matching — no AI (Phase 1/1b). Three tiers, most specific wins:
 *   1. exact   — case reference matches, tolerant of punctuation/spacing differences
 *   2. keyword — a full configured keyword or the client's name appears verbatim
 *   3. hint    — a partial/fuzzy keyword or client-name overlap, or a reference-shaped
 *                string that doesn't match any known matter (surfaced with no matter
 *                suggestion, so it still shows up for manual review instead of
 *                silently vanishing into "no signal at all")
 * Among equally-specific matches, the first matter in the given list order wins.
 */
export function matchItemToMatter(
    item: MatchableItem,
    candidateMatters: MatterForMatching[],
): MatterMatchResult | null {
    const rawHaystack = buildHaystack(item);
    if (!rawHaystack.trim()) {
        return null;
    }

    const activeMatters = candidateMatters.filter((matter) => !matter.archived);
    const looseHaystack = normalizeLoose(rawHaystack);
    const referenceHaystack = normalizeReference(rawHaystack);

    // Tier 1: case reference, formatting-tolerant.
    for (const matter of activeMatters) {
        const normalizedReference = normalizeReference(matter.caseReference || '');
        if (normalizedReference && referenceHaystack.includes(normalizedReference)) {
            return { matterId: matter.id, matchedText: matter.caseReference, matchType: MatterMatchType.CaseReference };
        }
    }

    // Tier 2: a full keyword, or the client's name, appears verbatim.
    for (const matter of activeMatters) {
        for (const keyword of matter.keywords || []) {
            const normalizedKeyword = normalizeLoose(keyword || '');
            if (normalizedKeyword && looseHaystack.includes(normalizedKeyword)) {
                return { matterId: matter.id, matchedText: keyword, matchType: MatterMatchType.Keyword };
            }
        }

        const normalizedClientName = normalizeLoose(matter.clientName || '');
        if (normalizedClientName && looseHaystack.includes(normalizedClientName)) {
            return { matterId: matter.id, matchedText: matter.clientName, matchType: MatterMatchType.Keyword };
        }
    }

    // Tier 3a: partial/fuzzy overlap on a keyword or client name (e.g. only one name
    // out of "Smith v Jones" is present, or the words are present but not contiguous).
    const haystackWords = new Set(wordsOf(rawHaystack));
    let bestHint: MatterMatchResult | null = null;
    let bestScore = 0;

    for (const matter of activeMatters) {
        const phrases = [...(matter.keywords || []), matter.clientName].filter(Boolean);
        for (const phrase of phrases) {
            const score = wordOverlapScore(phrase, haystackWords);
            if (score >= FUZZY_OVERLAP_THRESHOLD && score > bestScore) {
                bestScore = score;
                bestHint = { matterId: matter.id, matchedText: phrase, matchType: MatterMatchType.Hint };
            }
        }
    }

    if (bestHint) {
        return bestHint;
    }

    // Tier 3b: something reference-shaped is present, but it doesn't match any known
    // matter — flag it rather than silently discarding it, so a human can look.
    const referenceCandidates = extractReferenceCandidates(rawHaystack);
    if (referenceCandidates.length > 0) {
        return { matterId: null, matchedText: referenceCandidates[0], matchType: MatterMatchType.Hint };
    }

    return null;
}
